import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
  ExternalLink,
  Info,
  Server
} from 'lucide-react';
import { getSmsConfig, saveSmsConfig, dispatchRealSms } from '../services/smsService';

export default function SmsGatewayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [config, setConfig] = useState(getSmsConfig());
  const [testNumber, setTestNumber] = useState("");
  const [testStatus, setTestStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    saveSmsConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestSms = async () => {
    if (!testNumber || testNumber.length !== 10) {
      alert("Please enter a valid 10-digit Indian mobile number to test.");
      return;
    }

    setIsSending(true);
    setTestStatus(null);

    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const res = await dispatchRealSms({
      mobileNumber: testNumber,
      otp: testOtp,
      message: `[Govt of Gujarat] Gujarat Kutumb Portal Verification: Your test OTP is ${testOtp}. Ref: GJ-GOVT-TEST.`
    });

    setIsSending(false);
    setTestStatus(res);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-300 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0f2b5c] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Telecom SMS Gateway Integration</span>
                <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-400/30 px-2 py-0.5 rounded font-mono">
                  Live Dispatch Logic
                </span>
              </h2>
              <p className="text-slate-300 text-[11px]">
                Connect a telecom carrier gateway to deliver real SMS to physical mobile phones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#f8fafc]">
          {/* Real Telecom Architecture Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-blue-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
              <Server className="w-4 h-4 text-blue-700" />
              <span>How Real SMS Reaches Your Physical Smartphone:</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              A web browser running on a PC cannot directly communicate with cellular towers (Airtel, Jio, Vi). To buzz your physical phone, the system executes an <strong>HTTPS POST call to an authorized Telecom SMS Gateway</strong> (like Government C-DAC Mobile Seva or Fast2SMS in India), which transmits the message over telecom trunks (SMPP) directly to your SIM card.
            </p>
          </div>

          {/* Gateway Provider Selection */}
          <form onSubmit={handleSave} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#0f2b5c]" />
                <span>Select Telecom SMS Gateway Provider</span>
              </span>
              {savedSuccess && (
                <span className="text-green-600 text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved!
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Fast2SMS */}
              <label className={`p-3 rounded-lg border-2 cursor-pointer transition flex flex-col justify-between ${
                config.gateway === 'fast2sms'
                  ? 'border-blue-900 bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Fast2SMS (India)</span>
                    <input
                      type="radio"
                      name="gatewaySelect"
                      checked={config.gateway === 'fast2sms'}
                      onChange={() => setConfig({ ...config, gateway: 'fast2sms' })}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Most popular in India for instant free OTP delivery to any Indian mobile number without TRAI approval.
                  </p>
                </div>
                <span className="text-[10px] text-blue-700 font-semibold mt-2 block">
                  Recommended for India (+91)
                </span>
              </label>

              {/* Option 2: Twilio */}
              <label className={`p-3 rounded-lg border-2 cursor-pointer transition flex flex-col justify-between ${
                config.gateway === 'twilio'
                  ? 'border-blue-900 bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">Twilio (Global)</span>
                    <input
                      type="radio"
                      name="gatewaySelect"
                      checked={config.gateway === 'twilio'}
                      onChange={() => setConfig({ ...config, gateway: 'twilio' })}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Enterprise international cloud SMS API for sending SMS anywhere worldwide.
                  </p>
                </div>
                <span className="text-[10px] text-slate-600 font-semibold mt-2 block">
                  Global Delivery
                </span>
              </label>
            </div>

            {/* API Key Input */}
            <div className="pt-2">
              <label className="block text-slate-700 font-bold mb-1">
                {config.gateway === 'fast2sms' ? 'Fast2SMS API Key / Authorization Token' : 'Twilio Account SID & Token'}
              </label>
              <input
                type="password"
                placeholder={config.gateway === 'fast2sms' ? "Paste your Fast2SMS API Key here" : "ACxxxxxxxxxxxxxxx:auth_token"}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value.trim() })}
                className="w-full border border-slate-300 rounded px-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-blue-800"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>Free API keys can be obtained instantly from fast2sms.com dashboard.</span>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#0f2b5c] hover:bg-[#091c3d] text-white font-bold rounded"
                >
                  Save Gateway Key
                </button>
              </div>
            </div>
          </form>

          {/* Live Mobile Test Section */}
          <div className="bg-white p-4 rounded-lg border border-amber-300 bg-amber-50/20 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-700" />
              <span>Test Real SMS Dispatch to Your Phone</span>
            </h3>
            <p className="text-[11px] text-slate-600">
              Enter your real 10-digit mobile number below to trigger an actual government OTP SMS directly to your phone.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-600">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter your 10-digit Mobile Number"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-slate-300 rounded pl-10 pr-3 py-2 font-mono text-xs outline-none focus:ring-1 focus:ring-blue-800 bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestSms}
                disabled={isSending || testNumber.length !== 10}
                className={`px-4 py-2 text-white font-bold rounded flex items-center gap-1.5 transition ${
                  isSending || testNumber.length !== 10
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-green-700 hover:bg-green-800 shadow-sm'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Transmitting...' : 'Send Test SMS to My Phone'}</span>
              </button>
            </div>

            {/* Test Result Display */}
            {testStatus && (
              <div className={`p-3 rounded-lg border text-xs animate-in fade-in space-y-1 ${
                testStatus.success
                  ? 'bg-green-50 border-green-300 text-green-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {testStatus.success ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Info className="w-4 h-4 text-amber-600" />}
                    <span>{testStatus.gateway ? `Dispatched via ${testStatus.gateway} Gateway!` : 'Gateway Dispatch Response'}</span>
                  </span>
                  <span className="font-mono text-[10px]">Target: +91 {testNumber}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {testStatus.message || (testStatus.response && JSON.stringify(testStatus.response)) || 'Transmission request accepted by telecom node.'}
                </p>
                {!config.apiKey && (
                  <p className="text-[10px] text-amber-800 pt-1 border-t border-amber-200">
                    <strong>Note:</strong> Paste your free Fast2SMS API key above to have the carrier tower actually deliver this SMS to your physical phone handset.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0f2b5c] text-white font-bold rounded hover:bg-[#091c3d]"
          >
            Close Gateway Settings
          </button>
        </div>
      </div>
    </div>
  );
}
