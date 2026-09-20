// Real-World SMS Gateway Service for Gujarat Kutumb Portal
// Connects to Telecom Gateways (Fast2SMS, Twilio, CDAC Mobile Seva MSDG)
// to deliver real SMS directly to a citizen's physical mobile phone.

export const SMS_CONFIG_KEY = 'gj_sms_gateway_config';

export function getSmsConfig() {
  try {
    const saved = localStorage.getItem(SMS_CONFIG_KEY);
    return saved ? JSON.parse(saved) : {
      mode: 'live_ready', // 'live_ready' | 'fast2sms' | 'twilio' | 'simulation'
      gateway: 'fast2sms',
      apiKey: '',
      senderId: 'GJGOVT'
    };
  } catch (e) {
    return {
      mode: 'live_ready',
      gateway: 'fast2sms',
      apiKey: '',
      senderId: 'GJGOVT'
    };
  }
}

export function saveSmsConfig(config) {
  localStorage.setItem(SMS_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Dispatches an SMS to a physical Indian mobile number (+91).
 * Calls the backend /api/send-sms endpoint configured in the Vite dev server.
 */
export async function dispatchRealSms({ mobileNumber, message, otp }) {
  const config = getSmsConfig();
  const cleanNumber = (mobileNumber || '').replace(/\D/g, '').slice(-10);

  if (!cleanNumber || cleanNumber.length !== 10) {
    return {
      success: false,
      error: 'Invalid 10-digit Indian mobile number.'
    };
  }

  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobileNumber: cleanNumber,
        message,
        otp,
        gateway: config.gateway,
        apiKey: config.apiKey,
        senderId: config.senderId
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Gateway Error (${response.status}): ${errText}`
      };
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.warn("Real SMS gateway network dispatch notice:", err);
    return {
      success: false,
      error: err.message,
      simulated: true
    };
  }
}
