import React, { useState } from 'react';
import { 
  Heart, 
  Baby, 
  UserMinus, 
  ArrowRightLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function LifecycleManager({ 
  family, 
  onAddChild, 
  onMarriageTransfer, 
  onReportDeath,
  lang 
}) {
  const [activeModal, setActiveModal] = useState(null); // 'birth' | 'marriage' | 'death'

  // Birth state
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState("FEMALE");
  const [childDob, setChildDob] = useState(new Date().toISOString().split('T')[0]);
  const [childAadhaar, setChildAadhaar] = useState("");

  // Marriage state
  const [selectedBrideId, setSelectedBrideId] = useState("");
  const [groomFamilyId, setGroomFamilyId] = useState("GJ-SRT-2026-88219");
  const [marriageCertNumber, setMarriageCertNumber] = useState("");

  // Death state
  const [selectedDeceasedId, setSelectedDeceasedId] = useState("");
  const [deathCertNumber, setDeathCertNumber] = useState("");

  const activeMembers = (family.members || []).filter(m => m.isActive);
  const eligibleDaughters = activeMembers.filter(m => m.gender === 'FEMALE' && m.relationToHead === 'DAUGHTER');

  const handleBirthSubmit = (e) => {
    e.preventDefault();
    if (!childName || !childAadhaar || childAadhaar.length !== 12) {
      alert("Please enter child name and 12-digit valid Aadhaar.");
      return;
    }

    const newChild = {
      id: `MEM_CHILD_${Date.now()}`,
      aadhaarNumber: childAadhaar,
      fullName: childName,
      relationToHead: "DAUGHTER",
      gender: childGender,
      dob: childDob,
      maritalStatus: "Unmarried",
      educationLevel: "Primary (1-8)",
      occupation: "Child",
      isActive: true
    };

    onAddChild(family.id, newChild);
    setActiveModal(null);
    setChildName("");
    setChildAadhaar("");
  };

  const handleMarriageSubmit = (e) => {
    e.preventDefault();
    const brideId = selectedBrideId || (eligibleDaughters[0]?.id || "");
    if (!brideId) {
      alert("Please select a daughter to transfer.");
      return;
    }
    onMarriageTransfer(family.id, brideId, groomFamilyId, marriageCertNumber);
    setActiveModal(null);
    setMarriageCertNumber("");
  };

  const handleDeathSubmit = (e) => {
    e.preventDefault();
    const deceasedId = selectedDeceasedId || (activeMembers[0]?.id || "");
    if (!deceasedId || !deathCertNumber) {
      alert("Please select member and enter official Death Certificate number.");
      return;
    }
    onReportDeath(family.id, deceasedId, deathCertNumber);
    setActiveModal(null);
    setDeathCertNumber("");
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#0f2b5c] flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#ea580c]" />
            <span>Dynamic Family Lifecycle Event Simulator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how live real-world demographic changes update welfare quotas instantly without duplicate paperwork.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: Birth */}
          <button
            onClick={() => setActiveModal('birth')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded text-xs font-semibold transition"
          >
            <Baby className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Register Birth</span>
          </button>

          {/* Action 2: Marriage Transfer */}
          <button
            onClick={() => {
              if (eligibleDaughters.length > 0) {
                setSelectedBrideId(eligibleDaughters[0].id);
              }
              setActiveModal('marriage');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded text-xs font-semibold transition"
          >
            <Heart className="w-3.5 h-3.5 text-purple-600" />
            <span>Marriage Transfer</span>
          </button>

          {/* Action 3: Death Reporting */}
          <button
            onClick={() => {
              if (activeMembers.length > 0) {
                setSelectedDeceasedId(activeMembers[0].id);
              }
              setActiveModal('death');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold transition"
          >
            <UserMinus className="w-3.5 h-3.5 text-slate-600" />
            <span>Report Deceased</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Helper Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-lg space-y-1">
          <span className="font-bold text-blue-900 block flex items-center gap-1">
            <Baby className="w-3 h-3 text-blue-600" /> Birth Event Logic:
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Adds a newborn baby. Updates family size, recalculates ration quota, and triggers girl-child welfare tracking.
          </p>
        </div>

        <div className="bg-purple-50/50 border border-purple-100 p-2.5 rounded-lg space-y-1">
          <span className="font-bold text-purple-900 block flex items-center gap-1">
            <Heart className="w-3 h-3 text-purple-600" /> Marriage Transfer Logic:
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Transfers daughter from father's Family ID to husband's Family ID with zero duplicate documents.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-1">
          <span className="font-bold text-slate-900 block flex items-center gap-1">
            <UserMinus className="w-3 h-3 text-slate-600" /> Death Reporting Logic:
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Archives member to stop ghost pension claims and immediately unlocks <strong>Vidhva Sahay Yojana</strong> for surviving spouse.
          </p>
        </div>
      </div>

      {/* MODAL 1: Birth Registration */}
      {activeModal === 'birth' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-md p-5 space-y-4 shadow-xl text-xs">
            <h4 className="font-bold text-sm text-[#0f2b5c] border-b pb-2 flex items-center gap-2">
              <Baby className="w-4 h-4 text-blue-600" />
              <span>Register Newborn Child (નવજાત શિશુની નોંધણી)</span>
            </h4>

            <form onSubmit={handleBirthSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Child Full Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Rameshbhai Patel"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Gender*</label>
                <select
                  value={childGender}
                  onChange={(e) => setChildGender(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none bg-white"
                >
                  <option value="FEMALE">Female (દીકરી - Unlocks Girl Child Schemes)</option>
                  <option value="MALE">Male (દીકરો)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Date of Birth*</label>
                <input
                  type="date"
                  required
                  value={childDob}
                  onChange={(e) => setChildDob(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Child Aadhaar / Bal-Aadhaar (12 Digits)*</label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="12-digit unique number"
                  value={childAadhaar}
                  onChange={(e) => setChildAadhaar(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0f2b5c] text-white font-bold rounded hover:bg-[#091c3d]"
                >
                  Add to Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Marriage Transfer */}
      {activeModal === 'marriage' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-md p-5 space-y-4 shadow-xl text-xs">
            <h4 className="font-bold text-sm text-[#0f2b5c] border-b pb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Daughter Marriage Split & Transfer</span>
            </h4>

            {eligibleDaughters.length === 0 ? (
              <p className="text-slate-600 py-2">
                There are no registered daughters in this family profile available for marriage transfer.
              </p>
            ) : (
              <form onSubmit={handleMarriageSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Daughter to Transfer*</label>
                  <select
                    value={selectedBrideId}
                    onChange={(e) => setSelectedBrideId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none bg-white font-medium"
                  >
                    {eligibleDaughters.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} (Aadhaar: ...{d.aadhaarNumber?.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Husband / In-Law's Family ID*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GJ-SRT-2026-88219"
                    value={groomFamilyId}
                    onChange={(e) => setGroomFamilyId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none font-bold text-blue-900"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    System will automatically migrate her demographic and scholarship records to the new household.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Marriage Registration Certificate Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. GJ-MRG-2026-88192"
                    value={marriageCertNumber}
                    onChange={(e) => setMarriageCertNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none text-slate-800"
                  />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-700 text-white font-bold rounded hover:bg-purple-800"
                  >
                    Transfer to Groom's Family
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Death Reporting */}
      {activeModal === 'death' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-md p-5 space-y-4 shadow-xl text-xs">
            <h4 className="font-bold text-sm text-[#0f2b5c] border-b pb-2 flex items-center gap-2">
              <UserMinus className="w-4 h-4 text-slate-600" />
              <span>Report Deceased Family Member</span>
            </h4>

            <form onSubmit={handleDeathSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Deceased Member*</label>
                <select
                  value={selectedDeceasedId}
                  onChange={(e) => setSelectedDeceasedId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none bg-white"
                >
                  {activeMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.relationToHead})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Death Certificate Number*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GJ-DEATH-2026-98124"
                  value={deathCertNumber}
                  onChange={(e) => setDeathCertNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono outline-none"
                />
              </div>

              <div className="bg-amber-50 p-2 rounded border border-amber-200 text-[11px] text-amber-900">
                <strong>Automatic Welfare Adjustment:</strong> Member's Aadhaar will be archived to prevent ghost benefits, and the surviving spouse will be automatically evaluated for <strong>Ganga Swarupa Vidhva Sahay (Widow Pension)</strong>.
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 text-white font-bold rounded hover:bg-red-800"
                >
                  Archive & Cease Quotas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
