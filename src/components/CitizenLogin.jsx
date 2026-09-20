import React, { useState } from 'react';
import { 
  Shield, 
  Smartphone, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Users,
  Fingerprint,
  Radio
} from 'lucide-react';
import { dispatchRealSms } from '../services/smsService';
import SmsGatewayModal from './SmsGatewayModal';

export default function CitizenLogin({ families, onLoginSuccess, lang }) {
  const [aadhaarOrFid, setAadhaarOrFid] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [matchedFamily, setMatchedFamily] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [smsToast, setSmsToast] = useState(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

  // Quick Demo Logins
  const handleQuickSelect = (fam) => {
    const head = fam.members.find(m => m.relationToHead === 'HEAD') || fam.members[0];
    setAadhaarOrFid(head.aadhaarNumber);
    setErrorMsg("");
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const query = aadhaarOrFid.trim();
    if (!query) {
      setErrorMsg("Please enter a valid 12-digit Aadhaar number or Family ID.");
      return;
    }

    // Find matching family in database
    const found = families.find(f => {
      if (f.familyIdNumber.toLowerCase() === query.toLowerCase()) return true;
      return (f.members || []).some(m => m.aadhaarNumber === query);
    });

    if (!found) {
      setErrorMsg("No registered family found matching this Aadhaar or Family ID. Please register as a new family.");
      return;
    }

    const head = found.members.find(m => m.relationToHead === 'HEAD') || found.members[0];
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setMatchedFamily(found);
    setOtpSent(true);

    const mobile = found.headMobile || head.mobileNumber || "9825143210";
    const maskedMobile = `+91 ${mobile.slice(0, 2)}XXXX-${mobile.slice(-4)}`;

    // Dispatch real SMS to physical phone via telecom gateway API
    dispatchRealSms({
      mobileNumber: mobile,
      otp: newOtp,
      message: `[Govt of Gujarat] OTP for Gujarat Kutumb Portal login is ${newOtp}. Valid for 10 mins.`
    }).then(res => {
      console.log("Real Telecom Gateway Dispatch Result:", res);
    });

    // Simulate Government SMS dispatch alert on screen
    setSmsToast({
      title: "Government of Gujarat (GJ-GOVT)",
      phone: maskedMobile,
      fullMobile: mobile,
      otp: newOtp,
      time: "Just now"
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp !== generatedOtp) {
      setErrorMsg("Invalid OTP entered. Please check the 6-digit code received via SMS.");
      return;
    }

    // Success login
    onLoginSuccess(matchedFamily);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      {/* Simulated Live Government SMS Popup */}
      {smsToast && (
        <div className="fixed top-24 right-4 z-50 bg-[#091c3d] text-white p-4 rounded-xl shadow-2xl border-2 border-amber-400 max-w-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between text-[11px] text-amber-300 border-b border-slate-700 pb-1.5 mb-2">
            <span className="font-bold flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" /> SMS from GJ-GOVT
            </span>
            <span>{smsToast.time}</span>
          </div>
          <p className="text-xs text-slate-200">
            SMS dispatched to Registered Mobile: <strong className="text-amber-300 font-mono">{smsToast.phone}</strong>
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
            Your login OTP for Gujarat Kutumb Portal is:
          </p>
          <div className="my-2 text-center py-1.5 bg-amber-500 text-slate-950 font-mono text-xl font-extrabold tracking-widest rounded">
            {smsToast.otp}
          </div>
          <p className="text-[10px] text-slate-400">
            Valid for 10 minutes. Delivered via Gujarat State NIC Gateway. Do not share with anyone.
          </p>
          <button
            onClick={() => setSmsToast(null)}
            className="mt-2 text-[10px] text-amber-300 underline block text-right w-full"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      <div className="bg-white border-2 border-[#0f2b5c] rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f2b5c] text-white p-6 text-center relative">
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 absolute top-0 left-0" />
          
          <div className="w-14 h-14 bg-white/10 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Fingerprint className="w-8 h-8 text-amber-300" />
          </div>

          <h2 className="text-lg font-bold text-white tracking-wide">
            Gujarat Citizen Welfare Portal
          </h2>
          <p className="text-xs text-amber-200 mt-0.5">
            Aadhaar & Family ID Unified Authentication
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!otpSent ? (
            /* Step 1: Enter Aadhaar / Family ID */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                  Aadhaar Number or Family ID*
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="12-Digit Aadhaar or Family ID"
                    value={aadhaarOrFid}
                    onChange={(e) => setAadhaarOrFid(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-[#0f2b5c] focus:border-transparent transition"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  System sends official OTP to your Aadhaar-linked registered mobile.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0f2b5c] hover:bg-[#091c3d] text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm text-xs"
              >
                <span>Generate OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Step 2: Enter 6-Digit OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 block text-[11px]">Identified Family ID:</span>
                  <span className="font-mono font-bold text-blue-950 text-xs">
                    {matchedFamily?.familyIdNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Head of Family:</span>
                  <span className="font-semibold text-slate-800">
                    {matchedFamily?.members?.find(m => m.relationToHead === 'HEAD')?.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-blue-200 text-blue-900 font-medium">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-green-700" /> Registered Mobile:
                  </span>
                  <span className="font-mono font-bold">
                    +91 {matchedFamily?.headMobile || '9825143210'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Enter 6-Digit Mobile OTP*
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="6-Digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full border-2 border-blue-900 rounded-lg px-3.5 py-2.5 text-center text-xl tracking-widest font-mono font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-slate-500 hover:underline"
                >
                  ← Change Aadhaar Number
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-blue-700 font-bold hover:underline"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify OTP & Access Portal</span>
              </button>
            </form>
          )}

          {/* Real Telecom SMS Gateway Configuration Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsGatewayModalOpen(true)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 text-xs text-center shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Configure Live Telecom SMS Gateway (Real Phone Delivery)</span>
            </button>
          </div>

          {/* Quick Demo Selector for Judges */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              ⚡ Quick Demo Profiles (Click to Auto-Fill):
            </span>
            <div className="space-y-1.5">
              {families.slice(0, 3).map(f => {
                const head = f.members.find(m => m.relationToHead === 'HEAD') || f.members[0];
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleQuickSelect(f)}
                    className="w-full text-left p-2 rounded bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">
                        {head?.fullName} ({f.district})
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Aadhaar: {head?.aadhaarNumber} • {f.incomeVerificationStatus}
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-700 font-bold">Select</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live SMS Gateway Modal */}
      <SmsGatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
      />
    </div>
  );
}
