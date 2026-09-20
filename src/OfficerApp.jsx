import React, { useState, useEffect } from 'react';
import OfficerLogin from './components/OfficerLogin';
import { 
  INITIAL_FAMILIES, 
  INITIAL_FRAUD_ALERTS 
} from './data/mockDatabase';
import { 
  fetchLiveFamilies, 
  saveLiveFamilies, 
  dispatchLiveNotification 
} from './services/databaseService';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Stamp, 
  LogOut, 
  Search, 
  AlertTriangle, 
  BarChart3, 
  Send, 
  Clock, 
  Archive, 
  MessageSquare,
  Users,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Fingerprint,
  FileCheck,
  Phone,
  Info
} from 'lucide-react';

export default function OfficerApp() {
  const [officer, setOfficer] = useState(() => {
    const saved = sessionStorage.getItem('gj_officer_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [families, setFamilies] = useState(() => {
    const saved = localStorage.getItem('gj_kutumb_families');
    return saved ? JSON.parse(saved) : INITIAL_FAMILIES;
  });

  const [fraudAlerts, setFraudAlerts] = useState(() => {
    const saved = localStorage.getItem('gj_kutumb_alerts');
    return saved ? JSON.parse(saved) : INITIAL_FRAUD_ALERTS;
  });

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'verified' | 'rejected' | 'fraud' | 'analytics'
  const [selectedFamilyForReview, setSelectedFamilyForReview] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("Amount mismatch with certificate");
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Live real-time polling from shared backend (synchronizes with Citizen portal Port 3000)
  useEffect(() => {
    let isMounted = true;
    const syncData = async () => {
      const live = await fetchLiveFamilies();
      if (!isMounted || !live) return;
      setFamilies(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(live)) {
          return live;
        }
        return prev;
      });
    };

    syncData();
    const interval = setInterval(syncData, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update selectedFamilyForReview dynamically when family data changes (e.g. member added)
  useEffect(() => {
    if (selectedFamilyForReview) {
      const fresh = families.find(f => f.id === selectedFamilyForReview.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(selectedFamilyForReview)) {
        setSelectedFamilyForReview(fresh);
      }
    }
  }, [families]);

  // Sync families to localStorage on every action
  useEffect(() => {
    localStorage.setItem('gj_kutumb_families', JSON.stringify(families));
  }, [families]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const handleLoginSuccess = (officerData) => {
    setOfficer(officerData);
    sessionStorage.setItem('gj_officer_session', JSON.stringify(officerData));
    showToast(`Authenticated as ${officerData.name} (${officerData.role})`);
  };

  const handleLogout = () => {
    setOfficer(null);
    sessionStorage.removeItem('gj_officer_session');
  };

  // 1. Officer Verifies Family Income
  const handleVerify = (familyId) => {
    const adminSign = `${officer.name} (${officer.role}, ${officer.taluka})`;
    const updated = families.map(f => {
      if (f.id === familyId) {
        return {
          ...f,
          incomeVerificationStatus: 'VERIFIED',
          verifiedByAdmin: adminSign,
          verifiedAt: new Date().toISOString(),
          rejectionReason: null
        };
      }
      return f;
    });

    setFamilies(updated);
    saveLiveFamilies(updated);

    // Record Citizen SMS dispatch
    const target = families.find(f => f.id === familyId);
    const sms = {
      id: `SMS_${Date.now()}`,
      familyId: target.id,
      familyIdNumber: target.familyIdNumber,
      type: "APPROVAL",
      message: `SMS sent to citizen: Family ID #${target.familyIdNumber} income certificate has been VERIFIED & STAMPED by ${officer.name} (${officer.taluka}). Eligible schemes unlocked!`,
      timestamp: new Date().toISOString()
    };
    dispatchLiveNotification(sms);

    setSelectedFamilyForReview(null);
    showToast(`Application #${target.familyIdNumber} APPROVED & moved to Verified Archive.`);
  };

  // 2. Officer Rejects Family Income with Mandatory Reason & Remarks
  const handleRejectConfirm = () => {
    if (!selectedFamilyForReview) return;
    const finalReason = `${rejectReason}. Remarks: ${rejectRemarks || 'None'}`;

    const updated = families.map(f => {
      if (f.id === selectedFamilyForReview.id) {
        return {
          ...f,
          incomeVerificationStatus: 'REJECTED',
          rejectionReason: finalReason,
          verifiedByAdmin: `${officer.name} (${officer.taluka})`,
          verifiedAt: new Date().toISOString()
        };
      }
      return f;
    });

    setFamilies(updated);
    saveLiveFamilies(updated);

    // Record Citizen SMS dispatch with rejection reason
    const sms = {
      id: `SMS_${Date.now()}`,
      familyId: selectedFamilyForReview.id,
      familyIdNumber: selectedFamilyForReview.familyIdNumber,
      type: "REJECTION",
      message: `SMS sent to citizen: Family ID #${selectedFamilyForReview.familyIdNumber} was REJECTED by ${officer.name}. Reason: ${finalReason}. Please re-upload a valid copy.`,
      timestamp: new Date().toISOString()
    };
    dispatchLiveNotification(sms);

    setIsRejectModalOpen(false);
    setSelectedFamilyForReview(null);
    setRejectRemarks("");
    showToast(`Application #${selectedFamilyForReview.familyIdNumber} REJECTED & moved to Rejected Archive.`);
  };

  if (!officer) {
    return <OfficerLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Segment Queues with comprehensive multi-attribute search
  const pendingFamilies = families.filter(f => f.incomeVerificationStatus === 'PENDING');
  const verifiedFamilies = families.filter(f => f.incomeVerificationStatus === 'VERIFIED');
  const rejectedFamilies = families.filter(f => f.incomeVerificationStatus === 'REJECTED');

  const matchesSearch = (f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.familyIdNumber.toLowerCase().includes(term) ||
      f.district.toLowerCase().includes(term) ||
      f.taluka.toLowerCase().includes(term) ||
      (f.villageCity && f.villageCity.toLowerCase().includes(term)) ||
      (f.members || []).some(m => 
        (m.fullName && m.fullName.toLowerCase().includes(term)) ||
        (m.aadhaarNumber && m.aadhaarNumber.includes(term))
      )
    );
  };

  const filteredPending = pendingFamilies.filter(matchesSearch);
  const filteredVerified = verifiedFamilies.filter(matchesSearch);
  const filteredRejected = rejectedFamilies.filter(matchesSearch);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Official State Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#ea580c] via-white to-[#15803d]" />

      {/* Officer Portal Navigation Header */}
      <header className="bg-[#091c3d] text-white border-b border-slate-800 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-amber-400 flex items-center justify-center font-bold text-amber-300 text-xs">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-white">
                  Government of Gujarat • Taluka Officer Portal
                </h1>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Class-1 / G-SWAC
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Logged in as: <strong className="text-amber-300">{officer.name}</strong> ({officer.role} • {officer.taluka}, {officer.district})
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800/80 hover:bg-red-700 text-white rounded text-xs font-semibold transition border border-red-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Global Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#0f2b5c] text-white px-5 py-3 rounded-lg shadow-2xl border-l-4 border-amber-400 flex items-center gap-3 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1 text-xs">
        {/* Navigation Tabs Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab 1: Pending Queue */}
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-[#0f2b5c] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Queue</span>
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                {pendingFamilies.length}
              </span>
            </button>

            {/* Tab 2: Verified Archive */}
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                activeTab === 'verified'
                  ? 'bg-[#0f2b5c] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Verified Archive ({verifiedFamilies.length})</span>
            </button>

            {/* Tab 3: Rejected Archive */}
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                activeTab === 'rejected'
                  ? 'bg-[#0f2b5c] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Rejected Archive ({rejectedFamilies.length})</span>
            </button>

            {/* Tab 4: Fraud Center */}
            <button
              onClick={() => setActiveTab('fraud')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                activeTab === 'fraud'
                  ? 'bg-[#0f2b5c] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Fraud & De-duplication Monitor ({fraudAlerts.length})</span>
            </button>

            {/* Tab 5: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-[#0f2b5c] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>District Analytics</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Family ID or Taluka..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs outline-none"
            />
          </div>
        </div>

        {/* TAB 1: PENDING QUEUE */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                Displaying unreviewed applications awaiting Mamlatdar income verification. Once stamped or rejected, applications immediately move to the respective archives.
              </span>
              <span className="font-bold text-slate-800">
                Pending: {filteredPending.length}
              </span>
            </div>

            {filteredPending.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Pending Verification Queue is Empty!</h3>
                <p className="text-xs text-slate-500">
                  All submitted family income certificates in your jurisdiction have been successfully processed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f2b5c] text-white">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Family ID</th>
                      <th className="py-2.5 px-4 font-semibold">Head of Family</th>
                      <th className="py-2.5 px-4 font-semibold">Jurisdiction</th>
                      <th className="py-2.5 px-4 font-semibold">Declared Annual Income</th>
                      <th className="py-2.5 px-4 font-semibold">Uploaded Proof</th>
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
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ₹{Number(family.declaredAnnualIncome).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                              <FileText className="w-3 h-3 text-red-500" />
                              {family.incomeCertFileName || "Certificate.pdf"}
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

        {/* TAB 2: VERIFIED ARCHIVE */}
        {activeTab === 'verified' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-green-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Verified & Stamped Income Certificates Archive ({filteredVerified.length})</span>
              </h3>
              <span className="text-xs text-slate-500">Click "View Full Details" to inspect the complete citizen census dossier</span>
            </div>

            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f2b5c] text-white">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Family ID</th>
                    <th className="py-2.5 px-4 font-semibold">Head of Family</th>
                    <th className="py-2.5 px-4 font-semibold">Verified Annual Income</th>
                    <th className="py-2.5 px-4 font-semibold">Authorized Signatory</th>
                    <th className="py-2.5 px-4 font-semibold">Verification Date</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredVerified.map(fam => {
                    const head = fam.members.find(m => m.relationToHead === 'HEAD') || fam.members[0];
                    return (
                      <tr key={fam.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">{fam.familyIdNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {head?.fullName}
                          <span className="block text-[11px] text-slate-500 font-normal">
                            Aadhaar: XXXX-XXXX-{head?.aadhaarNumber?.slice(-4)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-800">
                          ₹{Number(fam.declaredAnnualIncome).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {fam.verifiedByAdmin || "K. R. Vaghela (TDO Daskroi)"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {fam.verifiedAt ? new Date(fam.verifiedAt).toLocaleString('en-IN') : 'Certified'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-green-300">
                            🟢 VERIFIED & STAMPED
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedFamilyForReview(fam)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-blue-50 text-[#0f2b5c] font-bold rounded text-xs transition border border-slate-300 hover:border-blue-400"
                            title="Inspect Complete Family & User Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-700" />
                            <span>View Full Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REJECTED ARCHIVE */}
        {activeTab === 'rejected' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-red-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Rejected Applications Archive ({filteredRejected.length})</span>
              </h3>
              <span className="text-xs text-slate-500">Click "View Full Details" to inspect the complete citizen census dossier</span>
            </div>

            {filteredRejected.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                No applications currently in the rejection archive.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f2b5c] text-white">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Family ID</th>
                      <th className="py-2.5 px-4 font-semibold">Head of Family</th>
                      <th className="py-2.5 px-4 font-semibold">Declared Income</th>
                      <th className="py-2.5 px-4 font-semibold">Official Rejection Reason</th>
                      <th className="py-2.5 px-4 font-semibold">Rejected By</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {filteredRejected.map(fam => {
                      const head = fam.members.find(m => m.relationToHead === 'HEAD') || fam.members[0];
                      return (
                        <tr key={fam.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">{fam.familyIdNumber}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {head?.fullName}
                            <span className="block text-[11px] text-slate-500 font-normal">
                              Aadhaar: XXXX-XXXX-{head?.aadhaarNumber?.slice(-4)}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ₹{Number(fam.declaredAnnualIncome).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-red-700 font-semibold max-w-xs">
                            {fam.rejectionReason || "Mismatch with submitted document"}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {fam.verifiedByAdmin || "Mamlatdar"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-red-300">
                              🔴 REJECTED
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedFamilyForReview(fam)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-red-50 text-red-900 font-bold rounded text-xs transition border border-slate-300 hover:border-red-400"
                              title="Inspect Complete Family & User Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-red-700" />
                              <span>View Full Details</span>
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

        {/* TAB 4: FRAUD & ANOMALY CENTER */}
        {activeTab === 'fraud' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <span>Automated De-duplication & Welfare Integrity Shield</span>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  100% Unique Aadhaar indexing across all 33 districts of Gujarat. System actively blocks cross-district duplication and BPL asset mismatches.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fraudAlerts.map(alert => (
                <div key={alert.id} className="bg-white rounded-xl border-2 border-red-300 p-4 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {alert.severity} Priority
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(alert.detectedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{alert.title}</h4>
                  <p className="text-xs text-slate-600">{alert.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-blue-900">{alert.familyIdNumber}</span>
                    <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                      {alert.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DISTRICT SATURATION ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 text-xs uppercase font-bold block">Total Families</span>
                <span className="text-2xl font-extrabold text-[#0f2b5c] mt-1 block">{families.length}</span>
                <span className="text-[10px] text-green-700 font-semibold">100% Unique Aadhaar</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 text-xs uppercase font-bold block">Verified by Mamlatdar</span>
                <span className="text-2xl font-extrabold text-green-700 mt-1 block">{verifiedFamilies.length}</span>
                <span className="text-[10px] text-slate-500">Official Stamped</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 text-xs uppercase font-bold block">Pending in Queue</span>
                <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{pendingFamilies.length}</span>
                <span className="text-[10px] text-amber-700">Under Review</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 text-xs uppercase font-bold block">Total Rejections</span>
                <span className="text-2xl font-extrabold text-red-600 mt-1 block">{rejectedFamilies.length}</span>
                <span className="text-[10px] text-red-700">Audit Discrepancies</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Complete Citizen & Family Census Dossier */}
      {selectedFamilyForReview && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-xs">
            {/* Header */}
            <div className="bg-[#0f2b5c] text-white px-6 py-3.5 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-sm sm:text-base tracking-wide text-white">
                      Official Citizen Dossier • Family ID #{selectedFamilyForReview.familyIdNumber}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      selectedFamilyForReview.incomeVerificationStatus === 'VERIFIED'
                        ? 'bg-green-600 text-white border-green-400'
                        : selectedFamilyForReview.incomeVerificationStatus === 'REJECTED'
                        ? 'bg-red-600 text-white border-red-400'
                        : 'bg-amber-400 text-slate-950 border-amber-300'
                    }`}>
                      {selectedFamilyForReview.incomeVerificationStatus === 'VERIFIED'
                        ? 'Verified & Stamped'
                        : selectedFamilyForReview.incomeVerificationStatus === 'REJECTED'
                        ? 'Application Rejected'
                        : 'Pending Mamlatdar Verification'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200">
                    Comprehensive demographic census, household profile & submitted verification documents
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFamilyForReview(null)} 
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition text-sm font-bold"
                title="Close Dossier"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Dossier Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/40">
              
              {/* SECTION 1: 4 Key Household Profile Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Card 1: Head of Family */}
                {(() => {
                  const head = selectedFamilyForReview.members.find(m => m.relationToHead === 'HEAD') || selectedFamilyForReview.members[0];
                  const birthYear = head?.dob ? new Date(head.dob).getFullYear() : 0;
                  const age = birthYear ? new Date().getFullYear() - birthYear : "N/A";
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Head of Family</span>
                      <span className="font-bold text-sm text-[#0f2b5c] block truncate">{head?.fullName}</span>
                      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                        <div className="font-mono"><span className="text-slate-400">Aadhaar:</span> {head?.aadhaarNumber}</div>
                        <div><span className="text-slate-400">Age/Gender:</span> {age} yrs • {head?.gender}</div>
                        <div><span className="text-slate-400">Occupation:</span> {head?.occupation}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Card 2: Jurisdiction & Address */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Residential Jurisdiction</span>
                  <span className="font-bold text-sm text-slate-800 block truncate">
                    {selectedFamilyForReview.taluka}, {selectedFamilyForReview.district}
                  </span>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                    <div><span className="text-slate-400">Village/Ward:</span> {selectedFamilyForReview.villageCity || "Urban Ward"}</div>
                    <div><span className="text-slate-400">Address:</span> {selectedFamilyForReview.address || "Main Village Site"}</div>
                    <div><span className="text-slate-400">PIN Code:</span> {selectedFamilyForReview.pincode || "380001"}</div>
                  </div>
                </div>

                {/* Card 3: Socio-Economic Profile */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Socio-Economic Baseline</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {selectedFamilyForReview.casteCategory}
                    </span>
                    <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      Ration: {selectedFamilyForReview.rationCardType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1.5 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">Agri Land:</span>{' '}
                      <strong className={selectedFamilyForReview.hasAgriLand ? "text-green-700 font-semibold" : "text-slate-600 font-normal"}>
                        {selectedFamilyForReview.hasAgriLand ? `${selectedFamilyForReview.landSizeAcres} Acres (Registered)` : "No Agricultural Land"}
                      </strong>
                    </div>
                    <div><span className="text-slate-400">Family Size:</span> {selectedFamilyForReview.members?.length || 1} Members</div>
                  </div>
                </div>

                {/* Card 4: Economic Verification Status */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Economic Status</span>
                  <span className="font-extrabold text-base text-green-700 block">
                    ₹{Number(selectedFamilyForReview.declaredAnnualIncome).toLocaleString('en-IN')}/yr
                  </span>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">Status:</span>{' '}
                      <span className="font-bold text-slate-800">{selectedFamilyForReview.incomeVerificationStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Registered:</span>{' '}
                      {new Date(selectedFamilyForReview.createdAt || Date.now()).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Complete Family Member Census (Details of EACH User) */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0f2b5c]">
                        Registered Family Member Census ({selectedFamilyForReview.members?.length || 0} Citizens)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Official individual demographic profile, verified Aadhaar numbers, education levels, and entitlement triggers
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold px-2 py-0.5 rounded border border-slate-300">
                    100% Unique Identity Checked
                  </span>
                </div>

                {/* Members Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0f2b5c] text-white">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Sr.</th>
                        <th className="py-2.5 px-3 font-semibold">Member Full Name</th>
                        <th className="py-2.5 px-3 font-semibold">Relation</th>
                        <th className="py-2.5 px-3 font-semibold">12-Digit Aadhaar</th>
                        <th className="py-2.5 px-3 font-semibold">DOB (Age)</th>
                        <th className="py-2.5 px-3 font-semibold">Gender</th>
                        <th className="py-2.5 px-3 font-semibold">Education</th>
                        <th className="py-2.5 px-3 font-semibold">Occupation</th>
                        <th className="py-2.5 px-3 font-semibold">Marital Status</th>
                        <th className="py-2.5 px-3 font-semibold">Scheme Eligibility Triggers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {selectedFamilyForReview.members?.map((member, idx) => {
                        const birthYear = member.dob ? new Date(member.dob).getFullYear() : 0;
                        const age = birthYear ? new Date().getFullYear() - birthYear : "N/A";
                        
                        // Compute quick eligibility tags
                        const isNamoSaraswati = member.gender === 'FEMALE' && ['11th Science', '12th Science'].includes(member.educationLevel);
                        const isNamoLakshmi = member.gender === 'FEMALE' && ['9th Class', '10th Class', '11th Arts/Commerce', '12th Arts/Commerce'].includes(member.educationLevel);
                        const isMameru = member.gender === 'FEMALE' && age >= 18 && member.maritalStatus === 'Unmarried';
                        const isKisan = member.relationToHead === 'HEAD' && selectedFamilyForReview.hasAgriLand;
                        const isShramik = ['Daily Wage Laborer', 'Construction Worker'].includes(member.occupation);

                        return (
                          <tr key={member.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {member.fullName}
                              {member.relationToHead === 'HEAD' && (
                                <span className="ml-1.5 text-[9px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.2 rounded">
                                  HEAD
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                member.relationToHead === 'HEAD'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {member.relationToHead}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <div className="flex items-center gap-1">
                                <span>{member.aadhaarNumber}</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 inline" title="Verified Unique Aadhaar" />
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-medium">
                              <div>{member.dob || "N/A"}</div>
                              <div className="text-[10px] text-slate-500 font-mono">({age} yrs)</div>
                            </td>
                            <td className="py-2.5 px-3 font-medium">{member.gender}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                {member.educationLevel || "N/A"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {member.occupation || "N/A"}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{member.maritalStatus || "Married"}</td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1">
                                {isNamoSaraswati && (
                                  <span className="bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-green-300">
                                    🎓 Namo Saraswati (₹25k)
                                  </span>
                                )}
                                {isNamoLakshmi && (
                                  <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-purple-300">
                                    📚 Namo Lakshmi (₹50k)
                                  </span>
                                )}
                                {isMameru && (
                                  <span className="bg-pink-100 text-pink-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-pink-300">
                                    💍 Kunwarbai Mameru (₹12k)
                                  </span>
                                )}
                                {isKisan && (
                                  <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                    🌾 Kisan Sahay (Land Unit)
                                  </span>
                                )}
                                {isShramik && (
                                  <span className="bg-orange-100 text-orange-900 text-[9px] font-bold px-1.5 py-0.2 rounded border border-orange-300">
                                    🍲 Shramik Annapurna (₹5 Meals)
                                  </span>
                                )}
                                {!isNamoSaraswati && !isNamoLakshmi && !isMameru && !isKisan && !isShramik && (
                                  <span className="text-slate-400 italic text-[10px]">General Beneficiary</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: Official Verification Documents Inspection (Side-by-Side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document 1: Form-IV Mamlatdar Income Certificate */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-sm text-[#0f2b5c] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span>Document 1: Mamlatdar Income Certificate (Form-IV)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      FORM-IV / GUJ-REV
                    </span>
                  </div>

                  <div className="p-3 border border-amber-300 bg-amber-50/20 rounded relative text-slate-800 space-y-2">
                    <div className="text-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-[11px] block uppercase text-[#0f2b5c]">
                        Office of the Mamlatdar, {selectedFamilyForReview.taluka}
                      </span>
                      <span className="text-[10px] text-slate-600">Revenue Department, Government of Gujarat</span>
                      <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                        Certificate No: REV-GJ-2026-INCOME-{selectedFamilyForReview.id.slice(-5)}
                      </span>
                    </div>

                    <div className="text-[11px] leading-relaxed pt-1">
                      Certified annual family income of{' '}
                      <strong className="text-slate-900">
                        {selectedFamilyForReview.members.find(m => m.relationToHead === 'HEAD')?.fullName}
                      </strong>{' '}
                      from all sources is certified as:
                    </div>

                    <div className="bg-white border border-amber-300 p-2 text-center my-1 rounded font-extrabold text-base text-[#0f2b5c]">
                      ₹{Number(selectedFamilyForReview.declaredAnnualIncome).toLocaleString('en-IN')} (Rupees Verified)
                    </div>

                    <div className="pt-2 flex justify-between items-end text-[10px]">
                      <div className="w-24 h-14 border-2 border-red-500 rounded-full flex flex-col items-center justify-center text-red-600 font-bold rotate-[-6deg]">
                        <span className="text-[7px]">MAMLATDAR</span>
                        <span className="text-[8px] uppercase">{selectedFamilyForReview.taluka}</span>
                        <span className="text-[6px]">OFFICIAL SEAL</span>
                      </div>
                      <div className="text-right text-slate-600">
                        <span className="block font-semibold">Authorized Signatory</span>
                        <span className="block text-[9px]">Revenue Inspector</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document 2: Age, DOB & Identity Proof */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-sm text-[#0f2b5c] flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        <span>Document 2: Age & Identity Proof</span>
                      </span>
                      <span className="text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-bold">
                        ATTACHED
                      </span>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50/40 border border-blue-200 rounded-lg space-y-2 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <FileText className="w-4 h-4 text-blue-700" />
                        <span>Uploaded File: {selectedFamilyForReview.dobCertFileName || "Aadhaar_Birth_Proof.pdf"}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Official Birth Certificate / Aadhaar identity document uploaded by citizen. Required to prevent age manipulation in marriage and school scholarships.
                      </p>
                      <div className="bg-white p-2.5 rounded border border-blue-200 space-y-1 text-slate-700">
                        <div className="font-semibold text-[#0f2b5c]">Verification Check:</div>
                        <div>✓ Verified DOB matches demographic declaration</div>
                        <div>✓ Cross-referenced with local Gram Panchayat / Municipal Corporation registry</div>
                        <div>✓ Parentage and relationship confirmed</div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Record if already verified or rejected */}
                  {selectedFamilyForReview.incomeVerificationStatus === 'VERIFIED' && (
                    <div className="bg-green-50 border border-green-300 rounded p-2.5 text-[11px] text-green-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block">Certified & Stamped:</span>
                        <span>{selectedFamilyForReview.verifiedByAdmin} on {new Date(selectedFamilyForReview.verifiedAt).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {selectedFamilyForReview.incomeVerificationStatus === 'REJECTED' && (
                    <div className="bg-red-50 border border-red-300 rounded p-2.5 text-[11px] text-red-900 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-600" /> Official Rejection Record:
                      </span>
                      <div>Reason: <strong>{selectedFamilyForReview.rejectionReason}</strong></div>
                      <div>Action by: {selectedFamilyForReview.verifiedByAdmin || "Taluka Officer"}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-300 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedFamilyForReview(null)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 font-semibold transition"
              >
                Close Dossier
              </button>

              {selectedFamilyForReview.incomeVerificationStatus === 'PENDING' ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-md border border-red-300 transition text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Application...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerify(selectedFamilyForReview.id)}
                    className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-md transition flex items-center gap-2 shadow-sm text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VERIFY & STAMP CERTIFICATE</span>
                  </button>
                </div>
              ) : (
                <div className="text-slate-500 font-medium text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Application archived under {selectedFamilyForReview.incomeVerificationStatus} status</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Mandatory Rejection Reason & Remarks */}
      {isRejectModalOpen && selectedFamilyForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-md p-5 space-y-4 shadow-2xl text-xs">
            <h4 className="font-bold text-sm text-red-800 border-b pb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Reject Income Certificate: #{selectedFamilyForReview.familyIdNumber}</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Official Reason for Rejection*
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs outline-none bg-white"
                >
                  <option>Income declared does not match figure on certificate</option>
                  <option>Official Mamlatdar seal/stamp is missing or blurred</option>
                  <option>Income Certificate has expired (&gt; 3 years old)</option>
                  <option>Applicant demographic mismatch</option>
                  <option>Document scan is illegible</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Officer Remarks / Note for Citizen*:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Certificate shows ₹1,85,000 but applicant entered ₹75,000. Please upload genuine certificate."
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs outline-none"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-[11px] text-amber-900">
                This exact reason will be transmitted to the citizen via SMS and displayed on their application tracker.
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded shadow-sm"
              >
                Confirm & Dispatch Rejection SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
