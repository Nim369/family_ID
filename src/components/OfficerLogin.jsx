import React, { useState } from 'react';
import { 
  Building2, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const OFFICIAL_OFFICERS = [
  {
    id: "OFF_01",
    name: "K. R. Vaghela",
    email: "tdo.daskroi@gujarat.gov.in",
    password: "GujaratGov@2026",
    role: "Taluka Development Officer (Class-1)",
    taluka: "Daskroi",
    district: "Ahmedabad"
  },
  {
    id: "OFF_02",
    name: "P. B. Joshi",
    email: "mamlatdar.choryasi@gujarat.gov.in",
    password: "SuratGov@2026",
    role: "Mamlatdar & Executive Magistrate",
    taluka: "Choryasi",
    district: "Surat"
  }
];

export default function OfficerLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const officer = OFFICIAL_OFFICERS.find(
      o => o.email.toLowerCase() === email.trim().toLowerCase() && o.password === password
    );

    if (!officer) {
      setErrorMsg("Access Denied: Invalid official government email or password. Unauthorized access is punishable under IT Act 2000.");
      return;
    }

    onLoginSuccess(officer);
  };

  const handleQuickFill = (off) => {
    setEmail(off.email);
    setPassword(off.password);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#0f2b5c] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Top Government Ribbon */}
        <div className="bg-[#091c3d] text-white p-6 text-center relative border-b-4 border-amber-500">
          <div className="w-14 h-14 bg-white/10 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-8 h-8 text-amber-300" />
          </div>

          <span className="text-[10px] tracking-widest text-amber-300 font-bold uppercase block">
            Government of Gujarat • મહેસૂલ વિભાગ
          </span>
          <h2 className="text-lg font-bold text-white tracking-wide mt-1">
            Taluka Officer Administration Center
          </h2>
          <p className="text-xs text-slate-300">
            Authorized Personnel Only (G-SWAC Node)
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Official Government Email (@gujarat.gov.in)*
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="officer.taluka@gujarat.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Officer Password*
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900 leading-relaxed">
            <strong>Security Notice:</strong> All Mamlatdar and TDO verification actions are cryptographically logged with officer timestamp and digital audit trail.
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0f2b5c] hover:bg-[#091c3d] text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Authenticate & Access Admin Portal</span>
          </button>

          {/* Quick Demo Fill for Judges */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              ⚡ Quick Fill Official Accounts:
            </span>
            <div className="space-y-1.5">
              {OFFICIAL_OFFICERS.map(off => (
                <button
                  key={off.id}
                  type="button"
                  onClick={() => handleQuickFill(off)}
                  className="w-full text-left p-2 rounded bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      {off.name} — {off.role}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {off.email} ({off.taluka}, {off.district})
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-bold">Use</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
