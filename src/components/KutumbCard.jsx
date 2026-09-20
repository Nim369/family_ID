import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Shield, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Users, 
  MapPin, 
  IndianRupee, 
  FileText,
  Phone,
  UserPlus
} from 'lucide-react';
import AddMemberModal from './AddMemberModal';

export default function KutumbCard({ 
  family, 
  lang, 
  onPrint, 
  onTriggerLifecycle, 
  onInspectDocument,
  onAddMember,
  existingFamilies = []
}) {
  if (!family) return null;

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const activeMembers = (family.members || []).filter(m => m.isActive);
  const headMember = activeMembers.find(m => m.relationToHead === 'HEAD') || activeMembers[0];
  const isVerified = family.incomeVerificationStatus === 'VERIFIED';

  // Format Aadhaar masking (e.g. XXXX-XXXX-9012)
  const maskAadhaar = (aadhaar) => {
    if (!aadhaar || aadhaar.length < 4) return 'XXXX-XXXX-0000';
    const last4 = aadhaar.slice(-4);
    return `XXXX-XXXX-${last4}`;
  };

  const qrData = JSON.stringify({
    fid: family.familyIdNumber,
    head: headMember?.fullName,
    members: activeMembers.length,
    district: family.district,
    incomeStatus: family.incomeVerificationStatus,
    verifiedBy: family.verifiedByAdmin || "Pending",
    portal: "gujarat.gov.in/kutumb"
  });

  return (
    <div className="space-y-4">
      {/* Top Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Shield className="w-5 h-5 text-[#0f2b5c]" />
          <span className="font-semibold text-[#0f2b5c]">
            {lang === 'gu' ? 'સત્તાવાર ડિજિટલ કુટુંબ કાર્ડ' : 'Official Digital Gujarat Kutumb Card'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onInspectDocument(family)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'gu' ? 'આવક પ્રમાણપત્ર જુઓ' : 'View Income Certificate'}</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0f2b5c] hover:bg-[#091c3d] rounded transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'gu' ? 'કાર્ડ પ્રિન્ટ કરો' : 'Print / Download Card'}</span>
          </button>
        </div>
      </div>

      {/* The Printable Official Card Container */}
      <div 
        id="printable-kutumb-card" 
        className="bg-white rounded-xl border-2 border-[#0f2b5c] overflow-hidden shadow-md"
      >
        {/* Card Header with State Tricolor & Branding */}
        <div className="bg-[#0f2b5c] text-white px-5 py-3.5 relative">
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 absolute top-0 left-0" />
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-amber-400/50 flex items-center justify-center font-bold text-amber-300 text-xs">
                ગુજરાત
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight text-white tracking-wide">
                  GOVERNMENT OF GUJARAT • ગુજરાત સરકાર
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  Gujarat Kutumb ID Card • ગુજરાત કુટુંબ ઓળખપત્ર
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-300 block uppercase tracking-wider">Family ID No.</span>
              <span className="font-mono text-sm sm:text-base font-bold text-amber-400 bg-white/10 px-2 py-0.5 rounded border border-amber-400/30">
                {family.familyIdNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status & Socio-Economic Badge Strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {/* Income Verification Badge */}
            {isVerified ? (
              <span className="flex items-center gap-1 font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full border border-green-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                {lang === 'gu' ? 'આવક પ્રમાણિત થયેલ છે (Mamlatdar Verified)' : 'Income Verified by Mamlatdar'}
              </span>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                {lang === 'gu' ? 'આવક ચકાસણી બાકી (Pending Officer Review)' : 'Income Verification Pending'}
              </span>
            )}

            <span className="bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded border border-blue-200">
              Ration: {family.rationCardType}
            </span>

            <span className="bg-purple-100 text-purple-800 font-medium px-2 py-0.5 rounded border border-purple-200">
              Category: {family.casteCategory}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>{family.villageCity}, {family.taluka}, {family.district}</span>
          </div>
        </div>

        {/* Middle Section: Head of Family Profile + Live QR Code */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white border-b border-slate-200">
          {/* Head Photo & Name */}
          <div className="md:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-20 h-24 bg-slate-200 border-2 border-slate-300 rounded flex flex-col items-center justify-center text-slate-500 font-semibold text-xs flex-shrink-0 shadow-inner">
              <Users className="w-8 h-8 text-slate-400 mb-1" />
              <span>HEAD</span>
            </div>

            <div className="space-y-1 text-sm">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-medium">Head of Family</span>
                <span className="text-base sm:text-lg font-bold text-[#0f2b5c]">
                  {headMember?.fullName}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block">Aadhaar No:</span>
                  <span className="font-mono font-semibold text-slate-800">{maskAadhaar(headMember?.aadhaarNumber)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Registered Mobile:</span>
                  <span className="font-mono font-semibold text-blue-900 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-green-600" />
                    +91 {family.headMobile || headMember?.mobileNumber || "9825143210"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Annual Income:</span>
                  <span className="font-semibold text-slate-800">₹{Number(family.declaredAnnualIncome).toLocaleString('en-IN')}/yr</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Agri Land:</span>
                  <span className="font-semibold text-slate-800">
                    {family.hasAgriLand ? `${family.landSizeAcres} Acres` : 'No Land'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Verification QR Code */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <QRCodeSVG value={qrData} size={84} level="M" />
            <span className="text-[10px] font-semibold text-[#0f2b5c] mt-1.5 uppercase tracking-wider">
              Scan to Verify
            </span>
            <span className="text-[8px] text-slate-500">Government Portal Authenticated</span>
          </div>
        </div>

        {/* Bottom Section: Verified Family Members Table */}
        <div className="p-5 bg-[#f8fafc]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#0f2b5c]" />
              <span>Registered Family Members ({activeMembers.length})</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded text-xs font-bold transition shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Family Member</span>
              </button>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {lang === 'gu' ? 'સર્વેક્ષણ કરાયેલા સભ્યો' : 'Demographically linked members'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f2b5c] text-white">
                <tr>
                  <th className="py-2 px-3 font-semibold">Sr.</th>
                  <th className="py-2 px-3 font-semibold">Member Name</th>
                  <th className="py-2 px-3 font-semibold">Relation</th>
                  <th className="py-2 px-3 font-semibold">Gender</th>
                  <th className="py-2 px-3 font-semibold">Age / DOB</th>
                  <th className="py-2 px-3 font-semibold">Aadhaar (Masked)</th>
                  <th className="py-2 px-3 font-semibold">Mobile No.</th>
                  <th className="py-2 px-3 font-semibold">Education / Status</th>
                  <th className="py-2 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {activeMembers.map((member, idx) => {
                  const birthYear = new Date(member.dob).getFullYear();
                  const age = new Date().getFullYear() - birthYear;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-mono font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {member.fullName}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          member.relationToHead === 'HEAD' 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {member.relationToHead}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium">{member.gender}</td>
                      <td className="py-2 px-3">{age} yrs ({member.dob})</td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-800">
                        {maskAadhaar(member.aadhaarNumber)}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        +91 {member.mobileNumber || family.headMobile || '9825143210'}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {member.educationLevel || member.occupation}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-2 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Issued by Revenue & Social Welfare Dept, Govt. of Gujarat</span>
          <span>Digital Verification Reference: {family.id}</span>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        family={family}
        existingFamilies={existingFamilies}
        onAddMember={onAddMember}
      />
    </div>
  );
}
