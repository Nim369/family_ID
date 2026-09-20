import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const DB_FILE = path.resolve(process.cwd(), 'src/data/liveDatabase.json');
const NOTIF_FILE = path.resolve(process.cwd(), 'src/data/liveNotifications.json');

function sharedBackendApiPlugin() {
  return {
    name: 'shared-backend-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle CORS Preflight for any cross-origin calls (Port 3001 <-> Port 3000)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        const url = req.url ? req.url.split('?')[0] : '';

        // 1. Live Families API Endpoint
        if (url === '/api/families') {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(DB_FILE)) {
                const raw = fs.readFileSync(DB_FILE, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(raw);
              } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end('[]');
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '[]');
                fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, count: parsed.length }));
              } catch (err) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }

        // 2. Live Notifications API Endpoint
        if (url === '/api/notifications') {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(NOTIF_FILE)) {
                const raw = fs.readFileSync(NOTIF_FILE, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(raw);
              } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end('[]');
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const incoming = JSON.parse(body || '[]');
                let current = [];
                if (fs.existsSync(NOTIF_FILE)) {
                  try {
                    current = JSON.parse(fs.readFileSync(NOTIF_FILE, 'utf-8') || '[]');
                  } catch (e) { current = []; }
                }
                const updated = Array.isArray(incoming) ? [...incoming, ...current] : [incoming, ...current];
                // Keep last 50
                const trimmed = updated.slice(0, 50);
                fs.writeFileSync(NOTIF_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, count: trimmed.length }));
              } catch (err) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }

        // 3. Real Telecom SMS Gateway Endpoint
        if (url === '/api/send-sms' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { mobileNumber, message, otp, gateway = 'fast2sms', apiKey } = data;
              const cleanNumber = (mobileNumber || '').replace(/\D/g, '').slice(-10);

              if (!cleanNumber || cleanNumber.length !== 10) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, error: 'Invalid 10-digit mobile number' }));
              }

              // Fast2SMS integration (Real Telecom cellular transmission in India)
              if (gateway === 'fast2sms' && apiKey) {
                try {
                  const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                    method: 'POST',
                    headers: {
                      'authorization': apiKey,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      route: 'otp',
                      variables_values: otp || '123456',
                      numbers: cleanNumber
                    })
                  });
                  const f2sData = await fast2smsRes.json();
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ 
                    success: f2sData.return === true, 
                    gateway: 'Fast2SMS',
                    response: f2sData,
                    deliveredTo: cleanNumber,
                    message: f2sData.message ? f2sData.message[0] : 'Transmitted to cellular network'
                  }));
                } catch (apiErr) {
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: false, error: apiErr.message }));
                }
              }

              // Default Telecom-ready response
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                success: true,
                mode: 'telecom_ready',
                message: `SMS transmission request prepared for +91 ${cleanNumber} with OTP [${otp || '925578'}]. To deliver directly to your phone handset via cellular towers, provide a free Fast2SMS API key in Gateway Settings.`,
                otp,
                dispatchedTo: cleanNumber,
                timestamp: new Date().toISOString()
              }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), sharedBackendApiPlugin()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html'),
        officer: path.resolve(process.cwd(), 'officer.html')
      }
    }
  }
})
