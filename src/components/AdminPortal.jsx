import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Search,
  Eye,
  CheckCircle2,
  Filter,
  BarChart3,
  Stamp
} from 'lucide-react';

export default function AdminPortal({ 
  families, 
  onVerifyIncome, 
  onRejectIncome,
  fraudAlerts,
  lang 
}) {
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'fraud' | 'analytics'
  const [selectedFamilyForReview, setSelectedFamilyForReview] = useState(null);
  const [rejectReason, setRejectReason] = useState("Amount mismatch with certificate");
  const [searchTerm, setSearchTerm] = useState("");

  const pendingFamilies = families.filter(f => f.incomeVerificationStatus === 'PENDING');
  const verifiedFamilies = families.filter(f => f.incomeVerificationStatus === 'VERIFIED');

  const filteredPending = pendingFamilies.filter(f => 
    f.familyIdNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Title & Tab Navigation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-[#0f2b5c]">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#0f2b5c]">
                {lang === 'gu' ? 'તાલુકા વિકાસ અધિકારી (TDO) ચકાસણી પોર્ટલ' : 'Taluka Development Officer (TDO) Admin Center'}
              </h2>
              <p className="text-xs text-slate-500">
                Jurisdiction: State of Gujarat • Mamlatdar Welfare Verification Node
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'bg-[#0f2b5c] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Income Verification Queue ({pendingFamilies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'fraud'
                ? 'bg-[#0f2b5c] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Fraud & Anomaly Center ({fraudAlerts?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-[#0f2b5c] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>District Analytics</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Income Certificate Verification Queue */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by Family ID or District..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-800"
              />
            </div>
            <span className="text-xs text-slate-600">
              Showing <strong>{filteredPending.length}</strong> pending income certificates
            </span>
          </div>

          {filteredPending.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">All Income Certificates Verified!</h3>
              <p className="text-xs text-slate-500">
                There are no pending submissions awaiting Mamlatdar verification in your jurisdiction.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f2b5c] text-white">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Family ID</th>
                    <th className="py-2.5 px-4 font-semibold">Head of Family</th>
                    <th className="py-2.5 px-4 font-semibold">District & Taluka</th>
                    <th className="py-2.5 px-4 font-semibold">Declared Income</th>
                    <th className="py-2.5 px-4 font-semibold">Uploaded Document</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredPending.map(family => {
                    const head = family.members.find(m => m.relationToHead === 'HEAD') || family.members[0];
                    return (
                      <tr key={family.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">
                          {family.familyIdNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {head?.fullName}
                          <span className="block text-[11px] text-slate-500 font-normal">
                            Aadhaar: XXXX-XXXX-{head?.aadhaarNumber?.slice(-4)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{family.taluka}</span>
                          <span className="block text-[11px] text-slate-500">{family.district}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900">
                            ₹{Number(family.declaredAnnualIncome).toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-slate-500">per annum</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            <FileText className="w-3 h-3 text-red-500" />
                            {family.incomeCertFileName || "Certificate.pdf"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 font-semibold text-[10px]">
                            🟡 Review Required
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedFamilyForReview(family)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2b5c] hover:bg-[#091c3d] text-white font-bold rounded text-xs transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect & Verify</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Fraud & Anomaly Center */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <span>Gujarat State Welfare Integrity & De-duplication Monitor</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Active automated algorithms cross-check Aadhaar unique registrations and income-to-asset disparities across Gujarat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(fraudAlerts || []).map(alert => (
              <div 
                key={alert.id}
                className="bg-white rounded-xl border-2 border-red-300 p-4 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 uppercase">
                    {alert.severity} Severity
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(alert.detectedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{alert.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-blue-900">
                    Ref: {alert.familyIdNumber}
                  </span>
                  <span className="bg-red-600 text-white font-bold px-2.5 py-0.5 rounded text-[10px]">
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: District Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs uppercase font-bold block">Total Families</span>
              <span className="text-2xl font-extrabold text-[#0f2b5c] mt-1 block">
                {families.length}
              </span>
              <span className="text-[10px] text-green-700 font-semibold">100% Unique Aadhaar</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs uppercase font-bold block">Verified Incomes</span>
              <span className="text-2xl font-extrabold text-green-700 mt-1 block">
                {verifiedFamilies.length}
              </span>
              <span className="text-[10px] text-slate-500">Certified by Mamlatdar</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs uppercase font-bold block">Pending Incomes</span>
              <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                {pendingFamilies.length}
              </span>
              <span className="text-[10px] text-amber-700">Awaiting TDO Queue</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-500 text-xs uppercase font-bold block">Integrity Score</span>
              <span className="text-2xl font-extrabold text-blue-900 mt-1 block">
                99.4%
              </span>
              <span className="text-[10px] text-slate-500">Zero Ghost Duplicates</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#0f2b5c] uppercase tracking-wider">
              District-wise Family ID Saturation (Gujarat State)
            </h3>
            <div className="space-y-3 pt-2 text-xs">
              {[
                { name: "Ahmedabad (અમદાવાદ)", pct: 88, count: "14,210 Families" },
                { name: "Surat (સુરત)", pct: 79, count: "11,840 Families" },
                { name: "Rajkot (રાજકોટ)", pct: 84, count: "8,920 Families" },
                { name: "Mehsana (મહેસાણા)", pct: 92, count: "6,410 Families" }
              ].map(d => (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{d.name}</span>
                    <span>{d.count} ({d.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0f2b5c] rounded-full" 
                      style={{ width: `${d.pct}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Side-by-Side Document Inspection & Stamping */}
      {selectedFamilyForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-[#0f2b5c] text-white px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  Official Verification: Family ID #{selectedFamilyForReview.familyIdNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFamilyForReview(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Split Screen Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto text-xs flex-1">
              {/* Left Column: Declared Citizen Data */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <h4 className="font-bold text-sm text-[#0f2b5c] border-b border-slate-200 pb-2">
                  1. Declared Household Information
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Head of Family:</span>
                    <span className="font-bold text-slate-800">
                      {selectedFamilyForReview.members.find(m => m.relationToHead === 'HEAD')?.fullName}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">District / Taluka:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedFamilyForReview.district} • {selectedFamilyForReview.taluka}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Caste Category:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedFamilyForReview.casteCategory}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Ration Card Type:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedFamilyForReview.rationCardType}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Agricultural Land:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedFamilyForReview.hasAgriLand 
                        ? `${selectedFamilyForReview.landSizeAcres} Acres` 
                        : 'No Land'}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 bg-amber-100 px-3 rounded border border-amber-300">
                    <span className="font-bold text-amber-900">Declared Annual Income:</span>
                    <span className="font-extrabold text-base text-amber-950">
                      ₹{Number(selectedFamilyForReview.declaredAnnualIncome).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-600">
                  <span className="font-bold block">Officer Checklist:</span>
                  <ul className="list-disc pl-4 space-y-1 mt-1">
                    <li>Verify official stamp of the Mamlatdar/Talati.</li>
                    <li>Ensure stated income matches the declared figure exactly.</li>
                    <li>Check that certificate issue date is within the last 3 financial years.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Simulated Stamped Government PDF Document */}
              <div className="border-2 border-slate-300 rounded-lg p-4 bg-white space-y-3 flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-[#0f2b5c] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span>Mamlatdar Stamped Income Certificate</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      FORM-IV / GUJ-REV
                    </span>
                  </div>

                  {/* Simulated Official Gujarat Government Document */}
                  <div className="mt-3 p-4 border border-slate-300 bg-amber-50/20 rounded relative text-slate-800 space-y-2">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-4xl font-extrabold text-[#0f2b5c] rotate-[-20deg]">
                      GOVT OF GUJARAT
                    </div>

                    <div className="text-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-[11px] block uppercase text-[#0f2b5c]">
                        Office of the Mamlatdar, {selectedFamilyForReview.taluka}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        Revenue Department, Government of Gujarat
                      </span>
                      <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                        Certificate No: REV-GJ-2026-INCOME-{selectedFamilyForReview.id.slice(-5)}
                      </span>
                    </div>

                    <div className="text-[11px] leading-relaxed pt-1">
                      This is to certify that as per revenue records and local inquiry, the total annual family income of 
                      <strong className="text-slate-900 mx-1">
                        {selectedFamilyForReview.members.find(m => m.relationToHead === 'HEAD')?.fullName}
                      </strong> 
                      residing at {selectedFamilyForReview.villageCity}, Taluka {selectedFamilyForReview.taluka}, District {selectedFamilyForReview.district} 
                      from all sources is evaluated at:
                    </div>

                    <div className="bg-white border border-amber-300 p-2 text-center my-2 rounded font-bold text-sm text-[#0f2b5c]">
                      ₹{Number(selectedFamilyForReview.declaredAnnualIncome).toLocaleString('en-IN')} (Rupees Verified)
                    </div>

                    {/* Official Stamp Representation */}
                    <div className="pt-2 flex justify-between items-end text-[10px]">
                      <div className="w-24 h-16 border-2 border-red-500 rounded-full flex flex-col items-center justify-center text-red-600 font-bold rotate-[-8deg] opacity-85">
                        <span className="text-[7px]">MAMLATDAR</span>
                        <span className="text-[8px] uppercase">{selectedFamilyForReview.taluka}</span>
                        <span className="text-[6px]">OFFICIAL SEAL</span>
                      </div>

                      <div className="text-right text-slate-600">
                        <span className="block font-semibold">Authorized Signatory</span>
                        <span className="block text-[9px]">Revenue Inspector / Mamlatdar</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <button
                    onClick={() => {
                      onVerifyIncome(selectedFamilyForReview.id, "K. R. Vaghela (TDO Daskroi)");
                      setSelectedFamilyForReview(null);
                    }}
                    className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-md transition flex items-center justify-center gap-2 shadow-sm text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>VERIFY & STAMP INCOME CERTIFICATE (પ્રમાણિત કરો)</span>
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1.5 text-xs outline-none bg-white flex-1"
                    >
                      <option>Amount mismatch with certificate</option>
                      <option>Official Mamlatdar seal illegible or missing</option>
                      <option>Expired certificate (&gt; 3 years old)</option>
                      <option>Document blurred / illegible scan</option>
                    </select>

                    <button
                      onClick={() => {
                        onRejectIncome(selectedFamilyForReview.id, rejectReason);
                        setSelectedFamilyForReview(null);
                      }}
                      className="py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded text-xs border border-red-300 transition flex-shrink-0"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
