import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CitizenLogin from './components/CitizenLogin';
import KutumbCard from './components/KutumbCard';
import ApplicationProgressTracker from './components/ApplicationProgressTracker';
import SchemePassbook from './components/SchemePassbook';
import LifecycleManager from './components/LifecycleManager';
import RegistrationModal from './components/RegistrationModal';
import NotificationInbox from './components/NotificationInbox';
import SahayakAssistant from './components/SahayakAssistant';
import SmsGatewayModal from './components/SmsGatewayModal';
import { 
  INITIAL_FAMILIES, 
  GUJARAT_SCHEMES 
} from './data/mockDatabase';
import { 
  fetchLiveFamilies, 
  saveLiveFamilies, 
  fetchLiveNotifications, 
  dispatchLiveNotification 
} from './services/databaseService';
import { 
  UserPlus, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [families, setFamilies] = useState(() => {
    const saved = localStorage.getItem('gj_kutumb_families');
    return saved ? JSON.parse(saved) : INITIAL_FAMILIES;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('gj_kutumb_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Logged-in Citizen state
  const [loggedCitizen, setLoggedCitizen] = useState(() => {
    const saved = sessionStorage.getItem('gj_citizen_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [lang, setLang] = useState('en');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSmsGatewayModalOpen, setIsSmsGatewayModalOpen] = useState(false);
  const [inspectedDocFamily, setInspectedDocFamily] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Real-time synchronization with Backend & Taluka Officer Portal (Port 3001)
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

      const notifs = await fetchLiveNotifications();
      if (isMounted && notifs) {
        setNotifications(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(notifs)) {
            return notifs;
          }
          return prev;
        });
      }
    };

    syncData();
    const interval = setInterval(syncData, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Synchronize logged citizen if family details change in real time (e.g. verified by officer or new member added)
  useEffect(() => {
    if (loggedCitizen) {
      const fresh = families.find(f => f.id === loggedCitizen.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(loggedCitizen)) {
        setLoggedCitizen(fresh);
        sessionStorage.setItem('gj_citizen_session', JSON.stringify(fresh));
      }
    }
  }, [families]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleLoginSuccess = (family) => {
    setLoggedCitizen(family);
    sessionStorage.setItem('gj_citizen_session', JSON.stringify(family));
    showToast(`Welcome! Logged in to Family ID #${family.familyIdNumber}`);
  };

  const handleLogout = () => {
    setLoggedCitizen(null);
    sessionStorage.removeItem('gj_citizen_session');
  };

  // Add New Family
  const handleSaveFamily = (newFamily) => {
    const updated = [newFamily, ...families];
    setFamilies(updated);
    saveLiveFamilies(updated);
    setLoggedCitizen(newFamily);
    sessionStorage.setItem('gj_citizen_session', JSON.stringify(newFamily));

    // Dispatch Official Welcome & Confirmation SMS
    const smsReg = {
      id: `SMS_${Date.now()}_REG`,
      familyId: newFamily.id,
      familyIdNumber: newFamily.familyIdNumber,
      mobileNumber: newFamily.headMobile || "9825143210",
      type: "APPROVAL",
      message: `Welcome to Gujarat Kutumb Portal! Family ID #${newFamily.familyIdNumber} has been successfully registered on Mobile +91 ${newFamily.headMobile || "9825143210"}. Submitted to Taluka Mamlatdar for income verification.`,
      timestamp: new Date().toISOString()
    };
    dispatchLiveNotification(smsReg);

    showToast(
      lang === 'gu'
        ? `નવા પરિવાર ID #${newFamily.familyIdNumber} ની નોંધણી સફળ! તાલુકા મામલતદાર સમક્ષ ચકાસણી માટે મોકલાયેલ છે.`
        : `Family ID #${newFamily.familyIdNumber} registered! Submitted to Taluka Mamlatdar for verification.`
    );
  };

  // Add Family Member directly to Household
  const handleAddMember = (newMember) => {
    if (!loggedCitizen) return;

    const updated = families.map(f => {
      if (f.id === loggedCitizen.id) {
        return {
          ...f,
          members: [...(f.members || []), newMember]
        };
      }
      return f;
    });

    setFamilies(updated);
    saveLiveFamilies(updated);

    const updatedLogged = updated.find(f => f.id === loggedCitizen.id);
    setLoggedCitizen(updatedLogged);
    sessionStorage.setItem('gj_citizen_session', JSON.stringify(updatedLogged));

    // Dispatch Government SMS Alert to Mobile
    const targetMobile = newMember.mobileNumber || loggedCitizen.headMobile || "9825143210";
    const smsEnrollment = {
      id: `SMS_${Date.now()}_MEMBER_ENROLLED`,
      familyId: loggedCitizen.id,
      familyIdNumber: loggedCitizen.familyIdNumber,
      mobileNumber: targetMobile,
      type: "APPROVAL",
      message: `GJ-GOVT ALERT: ${newMember.fullName} (Aadhaar ending ...${newMember.aadhaarNumber.slice(-4)}) successfully enrolled into Family ID #${loggedCitizen.familyIdNumber} as ${newMember.relationToHead}. PDS food grain quota and scheme entitlements updated.`,
      timestamp: new Date().toISOString()
    };
    dispatchLiveNotification(smsEnrollment);

    showToast(`${newMember.fullName} successfully enrolled into Family ID #${loggedCitizen.familyIdNumber}!`);
  };

  // 1-Click Scheme Application
  const handleApplyScheme = (schemeId) => {
    if (!loggedCitizen) return;
    const appliedList = loggedCitizen.appliedSchemes || [];
    if (appliedList.includes(schemeId)) return;

    const updated = families.map(f => {
      if (f.id === loggedCitizen.id) {
        return {
          ...f,
          appliedSchemes: [...appliedList, schemeId]
        };
      }
      return f;
    });

    setFamilies(updated);
    saveLiveFamilies(updated);

    const updatedLogged = updated.find(f => f.id === loggedCitizen.id);
    setLoggedCitizen(updatedLogged);
    sessionStorage.setItem('gj_citizen_session', JSON.stringify(updatedLogged));

    showToast(
      lang === 'gu'
        ? `અરજી સફળ! યોજના લાભ સીધા બેંક ખાતામાં DBT મારફતે મંજૂર કરવામાં આવ્યો છે.`
        : `1-Click Application Approved! Welfare grant approved via Direct Benefit Transfer (DBT).`
    );
  };

  // Lifecycle Event: Add Child
  const handleAddChild = (familyId, newChild) => {
    const updated = families.map(f => {
      if (f.id === familyId) {
        return {
          ...f,
          members: [...(f.members || []), newChild]
        };
      }
      return f;
    });
    setFamilies(updated);
    saveLiveFamilies(updated);

    const updatedLogged = updated.find(f => f.id === familyId);
    setLoggedCitizen(updatedLogged);
    sessionStorage.setItem('gj_citizen_session', JSON.stringify(updatedLogged));

    showToast(`Newborn ${newChild.fullName} added to Family ID! Quotas updated automatically.`);
  };

  // Lifecycle Event: Marriage Transfer (Cross-Household Dynamic Migration)
  const handleMarriageTransfer = (sourceFamilyId, daughterId, targetGroomFamilyId, marriageCertNo = "") => {
    const sourceFamily = families.find(f => f.id === sourceFamilyId);
    if (!sourceFamily) return;

    const trimmedTargetId = (targetGroomFamilyId || "").trim();
    if (!trimmedTargetId) {
      alert("Please enter the Husband / In-Law's Family ID.");
      return;
    }

    if (sourceFamily.familyIdNumber.toLowerCase() === trimmedTargetId.toLowerCase()) {
      alert("Invalid Transfer: You cannot transfer a daughter into her own existing Family ID.");
      return;
    }

    // 1. Validate that Target Groom Family exists in Gujarat State Database
    const targetFamily = families.find(f => 
      f.familyIdNumber.toLowerCase() === trimmedTargetId.toLowerCase() ||
      f.id.toLowerCase() === trimmedTargetId.toLowerCase()
    );

    if (!targetFamily) {
      alert(`Groom's Family ID "${trimmedTargetId}" was NOT found in the Gujarat State Database. Please enter a valid registered Family ID.`);
      return;
    }

    const bride = sourceFamily.members.find(m => m.id === daughterId);
    if (!bride) {
      alert("Selected member not found in this family.");
      return;
    }

    // 2. Determine Smart Relation in Target Household
    const groomHead = targetFamily.members.find(m => m.relationToHead === 'HEAD');
    let newRelation = "DAUGHTER_IN_LAW";
    if (groomHead && groomHead.gender === 'MALE' && groomHead.maritalStatus !== 'Married') {
      newRelation = "SPOUSE";
    }

    const transferredMember = {
      ...bride,
      id: `MEM_${targetFamily.id}_${Date.now()}`,
      relationToHead: newRelation,
      maritalStatus: "Married",
      remarks: `Migrated from Family ID #${sourceFamily.familyIdNumber} on Marriage Cert #${marriageCertNo || 'REG-2026-M'}`
    };

    // 3. Atomically migrate: remove from father's family & add to husband's family
    const updated = families.map(f => {
      if (f.id === sourceFamily.id) {
        return {
          ...f,
          members: f.members.filter(m => m.id !== daughterId)
        };
      }
      if (f.id === targetFamily.id) {
        return {
          ...f,
          members: [...f.members, transferredMember]
        };
      }
      return f;
    });

    setFamilies(updated);
    saveLiveFamilies(updated);

    // Update active citizen session
    const updatedLogged = updated.find(f => f.id === sourceFamily.id);
    setLoggedCitizen(updatedLogged);
    sessionStorage.setItem('gj_citizen_session', JSON.stringify(updatedLogged));

    // 4. Dispatch Official Government SMS Notifications to BOTH Families
    const smsFather = {
      id: `SMS_${Date.now()}_FATHER`,
      familyId: sourceFamily.id,
      familyIdNumber: sourceFamily.familyIdNumber,
      type: "LIFECYCLE_TRANSFER",
      message: `Marriage Migration Certified: ${bride.fullName} has been transferred to In-Law Family ID #${targetFamily.familyIdNumber}. Name successfully de-linked from father's household.`,
      timestamp: new Date().toISOString()
    };

    const smsGroom = {
      id: `SMS_${Date.now()}_GROOM`,
      familyId: targetFamily.id,
      familyIdNumber: targetFamily.familyIdNumber,
      type: "LIFECYCLE_ARRIVAL",
      message: `Welcome to Family ID #${targetFamily.familyIdNumber}: ${bride.fullName} has joined the household as ${newRelation}. Food grain and health quotas updated.`,
      timestamp: new Date().toISOString()
    };

    dispatchLiveNotification(smsFather);
    dispatchLiveNotification(smsGroom);

    showToast(
      `Marriage migration successful! ${bride.fullName} transferred to Family ID #${targetFamily.familyIdNumber} as ${newRelation}.`
    );
  };

  // Lifecycle Event: Death Reporting
  const handleReportDeath = (familyId, deceasedMemberId, deathCertNumber) => {
    let deceasedName = "";
    const updated = families.map(f => {
      if (f.id === familyId) {
        const membersUpdated = f.members.map(m => {
          if (m.id === deceasedMemberId) {
            deceasedName = m.fullName;
            return { ...m, isActive: false };
          }
          if (m.relationToHead === 'SPOUSE' && m.gender === 'FEMALE') {
            return { ...m, maritalStatus: 'Widowed' };
          }
          return m;
        });

        return {
          ...f,
          members: membersUpdated
        };
      }
      return f;
    });

    setFamilies(updated);
    saveLiveFamilies(updated);

    const updatedLogged = updated.find(f => f.id === familyId);
    setLoggedCitizen(updatedLogged);
    sessionStorage.setItem('gj_citizen_session', JSON.stringify(updatedLogged));

    showToast(
      `Deceased record archived for ${deceasedName}. Ghost benefits stopped. Ganga Swarupa (Widow Pension) unlocked for spouse!`
    );
  };

  // If citizen is NOT logged in, show Aadhaar + SMS OTP Login Screen
  if (!loggedCitizen) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
        <Header 
          lang={lang} 
          setLang={setLang} 
          loggedCitizen={null}
          onLogout={() => {}}
          unreadNotificationsCount={0}
          onOpenNotifications={() => {}}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <CitizenLogin 
            families={families} 
            onLoginSuccess={handleLoginSuccess} 
            lang={lang} 
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="text-xs font-bold text-[#0f2b5c] hover:underline flex items-center gap-1.5 mx-auto bg-white px-4 py-2 rounded-lg border border-slate-300 shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-[#ea580c]" />
              <span>{lang === 'gu' ? 'નવા પરિવાર માટે નોંધણી કરો (New Family Registration)' : 'Not Registered? Create New Gujarat Family ID'}</span>
            </button>
          </div>
        </main>

        <RegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSaveFamily={handleSaveFamily}
          existingFamilies={families}
          lang={lang}
        />
      </div>
    );
  }

  // Count unread notifications for logged family
  const familyNotifs = notifications.filter(n => n.familyIdNumber === loggedCitizen.familyIdNumber);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        lang={lang}
        setLang={setLang}
        loggedCitizen={loggedCitizen}
        onLogout={handleLogout}
        unreadNotificationsCount={familyNotifs.length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenSmsGateway={() => setIsSmsGatewayModalOpen(true)}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0f2b5c] text-white px-5 py-3 rounded-lg shadow-2xl border-l-4 border-amber-400 flex items-center gap-3 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Citizen Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Live 4-Stage Application Progress Tracker */}
        <ApplicationProgressTracker
          family={loggedCitizen}
          lang={lang}
          onReuploadClick={() => setIsRegisterModalOpen(true)}
        />

        {/* Official Digital Gujarat Kutumb Card */}
        <KutumbCard
          family={loggedCitizen}
          lang={lang}
          onPrint={() => window.print()}
          onTriggerLifecycle={() => {}}
          onInspectDocument={(fam) => setInspectedDocFamily(fam)}
          onAddMember={handleAddMember}
          existingFamilies={families}
        />

        {/* Dynamic Family Lifecycle Event Simulator */}
        <LifecycleManager
          family={loggedCitizen}
          onAddChild={handleAddChild}
          onMarriageTransfer={handleMarriageTransfer}
          onReportDeath={handleReportDeath}
          lang={lang}
        />

        {/* Proactive Scheme Entitlement Passbook */}
        <SchemePassbook
          family={loggedCitizen}
          lang={lang}
          onApplyScheme={handleApplyScheme}
          onSwitchToAdmin={() => {}}
        />
      </main>

      {/* Footer */}
      <footer className="bg-[#091c3d] text-slate-300 border-t border-slate-800 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white block">
              Government of Gujarat • ગુજરાત સરકાર
            </span>
            <span className="text-slate-400 text-[11px]">
              Kutumb Beneficiary Administration Node • Designed as per GIGW Standards
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>100% Unique Aadhaar Validation</span>
            <span>•</span>
            <span>Mamlatdar Document Verification</span>
            <span>•</span>
            <span>DBT Direct Credit</span>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSaveFamily={handleSaveFamily}
        existingFamilies={families}
        lang={lang}
      />

      {/* Notification Inbox Modal */}
      <NotificationInbox
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        familyIdNumber={loggedCitizen.familyIdNumber}
      />

      {/* Inspect Document Preview Modal */}
      {inspectedDocFamily && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-lg p-5 space-y-3 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm text-[#0f2b5c]">
                Official Income Certificate: {inspectedDocFamily.familyIdNumber}
              </span>
              <button 
                onClick={() => setInspectedDocFamily(null)} 
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded space-y-2">
              <div className="text-center font-bold text-slate-800 text-xs uppercase border-b border-amber-200 pb-1">
                Office of the Mamlatdar, {inspectedDocFamily.taluka}
              </div>
              <p className="text-[11px] text-slate-700">
                Certified annual family income: <strong className="text-slate-900">₹{Number(inspectedDocFamily.declaredAnnualIncome).toLocaleString('en-IN')}</strong>
              </p>
              <div className="flex justify-between text-[10px] text-slate-500 pt-2">
                <span>Verification Status: <strong>{inspectedDocFamily.incomeVerificationStatus}</strong></span>
                <span>File: {inspectedDocFamily.incomeCertFileName || "Income_Proof.pdf"}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectedDocFamily(null)}
                className="px-4 py-1.5 bg-[#0f2b5c] text-white font-bold rounded"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live SMS Gateway Configuration Modal */}
      <SmsGatewayModal
        isOpen={isSmsGatewayModalOpen}
        onClose={() => setIsSmsGatewayModalOpen(false)}
      />

      {/* Floating Sahayak AI Assistant */}
      <SahayakAssistant family={loggedCitizen} lang={lang} />
    </div>
  );
}
