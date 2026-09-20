import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  IndianRupee, 
  Sparkles, 
  FileCheck,
  Building,
  GraduationCap,
  Users,
  UserCheck
} from 'lucide-react';
import { evaluateFamilySchemes } from '../utils/rulesEngine';

export default function SchemePassbook({ family, lang, onApplyScheme, onSwitchToAdmin }) {
  const evaluationResults = evaluateFamilySchemes(family);

  const eligibleSchemes = evaluationResults.filter(r => r.status === 'ELIGIBLE');
  const pendingIncomeSchemes = evaluationResults.filter(r => r.status === 'PENDING_INCOME_VERIFICATION');
  const enrolledSchemes = evaluationResults.filter(r => r.status === 'ENROLLED');

  const handleApply = (entitlementKey, schemeName, beneficiaryName) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}

    onApplyScheme(entitlementKey);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-[#ea580c]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#0f2b5c]">
              {lang === 'gu' ? 'સ્વચાલિત સરકારી યોજના પાસબુક' : 'Proactive Gujarat Welfare Passbook'}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {lang === 'gu'
              ? '૨-સ્તરીય યોજના ફાળવણી: ઘર દીઠ ૧ રેશન/કિસાન ક્વોટા અને દરેક પાત્ર દીકરી/વિદ્યાર્થી દીઠ વ્યક્તિગત સ્કોલરશિપ.'
              : '2-Tier Entitlement Model: 1 quota per household (Ration/Kisan) & multiple individual scholarships per eligible child!'}
          </p>
        </div>

        {/* Quick Stat Counter Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-green-700 block">
              {lang === 'gu' ? 'તુરંત પાત્ર' : '100% Eligible'}
            </span>
            <span className="text-lg font-extrabold text-green-900">{eligibleSchemes.length}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">
              {lang === 'gu' ? 'ચકાસણી હેઠળ' : 'Pending Verification'}
            </span>
            <span className="text-lg font-extrabold text-amber-900">{pendingIncomeSchemes.length}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">
              {lang === 'gu' ? 'મંજૂર યોજનાઓ' : 'Enrolled'}
            </span>
            <span className="text-lg font-extrabold text-blue-900">{enrolledSchemes.length}</span>
          </div>
        </div>
      </div>

      {/* Section 1: 100% Eligible Schemes (1-Click Apply) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-green-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>
              {lang === 'gu' ? 'તુરંત અરજી કરવા પાત્ર યોજનાઓ' : 'Instant Auto-Eligible Schemes'} ({eligibleSchemes.length})
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            {lang === 'gu' ? 'બંને દીકરીઓ / સભ્યો વ્યક્તિગત રીતે અરજી કરી શકે છે' : 'Individual scholarships active for each child'}
          </span>
        </div>

        {eligibleSchemes.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
            No new instant eligible schemes available for this profile right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibleSchemes.map(({ entitlementKey, scheme, scope, matchingMember, matchReason }) => (
              <div 
                key={entitlementKey}
                className="bg-white rounded-xl border-2 border-green-500/40 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 font-mono">
                        {scheme.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        scope === 'MEMBER' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {scope === 'MEMBER' ? '🎓 Child / Member Scholarship' : '🏠 Household Quota (Max 1)'}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#0f2b5c] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-[#ea580c]" />
                      {scheme.benefit}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2">
                    {lang === 'gu' ? scheme.nameGu : scheme.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {lang === 'gu' ? scheme.descriptionGu : scheme.description}
                  </p>

                  {/* Individual Beneficiary Callout */}
                  {matchingMember && (
                    <div className="mt-3 bg-green-50/80 border border-green-300 rounded-lg p-2.5 text-xs text-green-950 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-950 flex items-center gap-1 text-[11px]">
                          <UserCheck className="w-3.5 h-3.5 text-green-700" />
                          Individual Beneficiary: {matchingMember.fullName}
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.2 rounded border border-green-200 font-semibold text-green-800">
                          {matchingMember.educationLevel || matchingMember.relationToHead}
                        </span>
                      </div>
                      <span className="text-[11px] text-green-800 block">{matchReason}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Dept: {scheme.department.split(',')[0]}
                  </span>
                  <button
                    onClick={() => handleApply(entitlementKey, scheme.name, matchingMember?.fullName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#15803d] hover:bg-[#166534] rounded-md transition shadow-sm"
                  >
                    <span>{lang === 'gu' ? '૧-ક્લિક મંજૂરી મેળવો' : '1-Click Apply'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Schemes On Hold (Pending Officer Income Verification) */}
      {pendingIncomeSchemes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>
                {lang === 'gu' 
                  ? 'આવક પ્રમાણપત્ર ચકાસણી બાકી હોવાથી અટકેલ યોજનાઓ' 
                  : 'On Hold: Pending Mamlatdar Income Verification'} ({pendingIncomeSchemes.length})
              </span>
            </h3>
            <span className="text-xs text-amber-700 font-semibold">
              Requires Taluka Officer Stamp
            </span>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingIncomeSchemes.map(({ entitlementKey, scheme, matchingMember, matchReason }) => (
                <div key={entitlementKey} className="bg-white rounded-lg border border-amber-300 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{lang === 'gu' ? scheme.nameGu : scheme.name}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Locked
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{scheme.benefit}</p>
                  {matchingMember && (
                    <p className="text-blue-900 text-[10px] font-bold">
                      Beneficiary: {matchingMember.fullName} ({matchingMember.relationToHead})
                    </p>
                  )}
                  <p className="text-amber-700 text-[10px] italic">Reason: {matchReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Active & Enrolled Schemes */}
      {enrolledSchemes.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>
              {lang === 'gu' ? 'હાલમાં મંજૂર થયેલ યોજનાઓ' : 'Active & Enrolled Schemes'} ({enrolledSchemes.length})
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enrolledSchemes.map(({ entitlementKey, scheme, scope, matchingMember }) => (
              <div 
                key={entitlementKey}
                className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold">
                      APP-GJ-2026-{scheme.id.slice(-4)}
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.2 rounded border border-purple-200">
                      {scope === 'MEMBER' ? `Beneficiary: ${matchingMember?.fullName}` : 'Household Quota Active'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{scheme.name}</h4>
                  <p className="text-xs text-slate-600 font-medium">{scheme.benefit}</p>
                  <span className="inline-block mt-1 text-[11px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    🟢 Disbursed to Bank Account via DBT
                  </span>
                </div>
                <div className="text-right">
                  <CheckCircle className="w-8 h-8 text-green-600 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
