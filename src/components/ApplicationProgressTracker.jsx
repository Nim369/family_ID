import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Building2, 
  Sparkles,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export default function ApplicationProgressTracker({ family, lang, onReuploadClick }) {
  if (!family) return null;

  const isVerified = family.incomeVerificationStatus === 'VERIFIED';
  const isRejected = family.incomeVerificationStatus === 'REJECTED';
  const isPending = family.incomeVerificationStatus === 'PENDING';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#0f2b5c] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#ea580c]" />
            <span>
              {lang === 'gu' 
                ? 'અરજી પ્રક્રિયા અને સ્થિતિ ટ્રેકર (Application Status Tracker)' 
                : 'Live Family ID & Benefit Status Tracker'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stage tracking from application registration to Taluka Mamlatdar certification.
          </p>
        </div>

        <div>
          {isVerified && (
            <span className="bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-full text-xs border border-green-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Stage 4 / 4 Complete
            </span>
          )}
          {isPending && (
            <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full text-xs border border-amber-300 flex items-center gap-1 animate-pulse">
              <Clock className="w-3.5 h-3.5" /> Stage 3 / 4 In Review
            </span>
          )}
          {isRejected && (
            <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-xs border border-red-300 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Stage 3 Action Required
            </span>
          )}
        </div>
      </div>

      {/* 4-Stage Visual Progress Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
        {/* Stage 1: Registered */}
        <div className="p-3 rounded-lg border border-green-300 bg-green-50/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-900">Stage 1</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-bold text-slate-900 block">Registration Submitted</span>
          <p className="text-[11px] text-slate-600">
            Family ID: <span className="font-mono font-semibold">{family.familyIdNumber}</span>
          </p>
          <span className="text-[10px] text-slate-400 block">
            {new Date(family.createdAt).toLocaleDateString('en-IN')}
          </span>
        </div>

        {/* Stage 2: Documents Uploaded */}
        <div className="p-3 rounded-lg border border-green-300 bg-green-50/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-900">Stage 2</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-bold text-slate-900 block">Documents Attached</span>
          <p className="text-[11px] text-slate-600 truncate">
            Income: {family.incomeCertFileName || "Certificate.pdf"}
          </p>
          <span className="text-[10px] text-green-700 font-semibold block">
            ✓ Uploaded & Indexed
          </span>
        </div>

        {/* Stage 3: Taluka Verification */}
        <div className={`p-3 rounded-lg border space-y-1 ${
          isVerified 
            ? 'border-green-300 bg-green-50/60' 
            : isRejected 
            ? 'border-red-300 bg-red-50/60' 
            : 'border-amber-300 bg-amber-50/60'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`font-bold ${isVerified ? 'text-green-900' : isRejected ? 'text-red-900' : 'text-amber-900'}`}>
              Stage 3
            </span>
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : isRejected ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            )}
          </div>
          <span className="font-bold text-slate-900 block">Taluka Mamlatdar Review</span>
          
          {isVerified && (
            <p className="text-[11px] text-green-800">
              Verified by: <span className="font-semibold">{family.verifiedByAdmin}</span>
            </p>
          )}

          {isPending && (
            <p className="text-[11px] text-amber-800">
              In Queue for {family.taluka} Taluka Mamlatdar inspection.
            </p>
          )}

          {isRejected && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-red-700 font-bold block">
                Rejected: {family.rejectionReason}
              </span>
              <button
                onClick={onReuploadClick}
                className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded shadow-xs"
              >
                Re-upload Certificate
              </button>
            </div>
          )}
        </div>

        {/* Stage 4: Welfare & DBT */}
        <div className={`p-3 rounded-lg border space-y-1 ${
          isVerified 
            ? 'border-green-300 bg-green-50/60' 
            : 'border-slate-200 bg-slate-50 opacity-75'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`font-bold ${isVerified ? 'text-green-900' : 'text-slate-500'}`}>
              Stage 4
            </span>
            <Sparkles className={`w-4 h-4 ${isVerified ? 'text-green-600' : 'text-slate-400'}`} />
          </div>
          <span className="font-bold text-slate-900 block">Welfare Schemes & DBT</span>
          <p className="text-[11px] text-slate-600">
            {isVerified 
              ? 'All BPL & caste subsidies active for 1-Click apply.' 
              : 'Locked until Stage 3 verification completes.'}
          </p>
        </div>
      </div>
    </div>
  );
}
