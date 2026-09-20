import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  FileText, 
  FileCheck,
  UserPlus,
  Save,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { GUJARAT_DISTRICTS, CASTE_CATEGORIES, RATION_CARD_TYPES } from '../data/mockDatabase';

export default function RegistrationModal({ 
  isOpen, 
  onClose, 
  onSaveFamily, 
  existingFamilies,
  lang 
}) {
  if (!isOpen) return null;

  // Form State with LocalStorage Autosave
  const DRAFT_KEY = 'gj_kutumb_registration_draft';

  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  const draft = getSavedDraft();

  const [district, setDistrict] = useState(draft?.district || GUJARAT_DISTRICTS[0]);
  const [taluka, setTaluka] = useState(draft?.taluka || "Daskroi");
  const [villageCity, setVillageCity] = useState(draft?.villageCity || "");
  const [address, setAddress] = useState(draft?.address || "");
  const [pincode, setPincode] = useState(draft?.pincode || "");
  const [casteCategory, setCasteCategory] = useState(draft?.casteCategory || "SEBC");
  const [rationCardType, setRationCardType] = useState(draft?.rationCardType || "BPL");
  const [hasAgriLand, setHasAgriLand] = useState(draft?.hasAgriLand ?? false);
  const [landSizeAcres, setLandSizeAcres] = useState(draft?.landSizeAcres || "");
  const [declaredAnnualIncome, setDeclaredAnnualIncome] = useState(draft?.declaredAnnualIncome || "");

  // Head details
  const [headName, setHeadName] = useState(draft?.headName || "");
  const [headAadhaar, setHeadAadhaar] = useState(draft?.headAadhaar || "");
  const [headMobile, setHeadMobile] = useState(draft?.headMobile || "");
  const [headDob, setHeadDob] = useState(draft?.headDob || "");
  const [headGender, setHeadGender] = useState(draft?.headGender || "MALE");
  const [headOccupation, setHeadOccupation] = useState(draft?.headOccupation || "Farmer");
  const [headOtherOccupation, setHeadOtherOccupation] = useState(draft?.headOtherOccupation || "");
  const [headEducation, setHeadEducation] = useState(draft?.headEducation || "10th Class");

  // Document Uploads
  const [incomeFile, setIncomeFile] = useState(null);
  const [dobFile, setDobFile] = useState(null); // Birth Certificate / Aadhaar copy
  const [incomeFileError, setIncomeFileError] = useState("");
  const [dobFileError, setDobFileError] = useState("");

  // Additional Members
  const [additionalMembers, setAdditionalMembers] = useState(draft?.additionalMembers || []);

  // Validation
  const [duplicateAadhaarError, setDuplicateAadhaarError] = useState("");
  const [hasAutosaved, setHasAutosaved] = useState(false);

  // Autosave to localStorage on any form field change
  useEffect(() => {
    const draftData = {
      district,
      taluka,
      villageCity,
      address,
      pincode,
      casteCategory,
      rationCardType,
      hasAgriLand,
      landSizeAcres,
      declaredAnnualIncome,
      headName,
      headAadhaar,
      headMobile,
      headDob,
      headGender,
      headOccupation,
      headOtherOccupation,
      headEducation,
      additionalMembers
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    setHasAutosaved(true);
    const timer = setTimeout(() => setHasAutosaved(false), 2000);
    return () => clearTimeout(timer);
  }, [
    district, taluka, villageCity, address, pincode, casteCategory,
    rationCardType, hasAgriLand, landSizeAcres, declaredAnnualIncome,
    headName, headAadhaar, headMobile, headDob, headGender,
    headOccupation, headOtherOccupation, headEducation, additionalMembers
  ]);

  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to reset this form? Saved draft will be cleared.")) {
      localStorage.removeItem(DRAFT_KEY);
      window.location.reload();
    }
  };

  // Extract all existing Aadhaars across Gujarat
  const getAllRegisteredAadhaars = () => {
    const map = new Map();
    (existingFamilies || []).forEach(f => {
      (f.members || []).forEach(m => {
        if (m.aadhaarNumber) {
          map.set(m.aadhaarNumber, f.familyIdNumber);
        }
      });
    });
    return map;
  };

  const aadhaarDatabase = getAllRegisteredAadhaars();

  // Real-time comprehensive duplicate Aadhaar check (both global DB and within-family)
  useEffect(() => {
    // 1. Check head aadhaar against database
    if (headAadhaar && headAadhaar.length === 12) {
      if (aadhaarDatabase.has(headAadhaar)) {
        setDuplicateAadhaarError(
          `Head's Aadhaar (${headAadhaar}) is ALREADY registered under Family ID #${aadhaarDatabase.get(headAadhaar)}. Duplicate registrations are strictly prohibited by Gujarat State Law.`
        );
        return;
      }
    }

    // 2. Check additional members against database
    for (const m of additionalMembers) {
      if (m.aadhaarNumber && m.aadhaarNumber.length === 12) {
        if (aadhaarDatabase.has(m.aadhaarNumber)) {
          setDuplicateAadhaarError(
            `Member's Aadhaar (${m.aadhaarNumber}) is ALREADY registered under Family ID #${aadhaarDatabase.get(m.aadhaarNumber)}. Duplicate registrations are strictly prohibited by Gujarat State Law.`
          );
          return;
        }
      }
    }

    // 3. Check for duplicate Aadhaar entries within the current family
    const allAadhaars = [headAadhaar, ...additionalMembers.map(m => m.aadhaarNumber)]
      .map(a => (a || '').trim())
      .filter(a => a.length === 12);
    
    const seen = new Set();
    for (const a of allAadhaars) {
      if (seen.has(a)) {
        setDuplicateAadhaarError(
          `Duplicate Aadhaar (${a}) entered twice within this family! Each member must have a unique Aadhaar.`
        );
        return;
      }
      seen.add(a);
    }

    setDuplicateAadhaarError("");
  }, [headAadhaar, additionalMembers]);

  const handleAddMember = () => {
    setAdditionalMembers([
      ...additionalMembers,
      {
        id: `MEM_NEW_${Date.now()}_${additionalMembers.length + 1}`,
        fullName: "",
        relationToHead: "SPOUSE",
        gender: "FEMALE",
        dob: "",
        aadhaarNumber: "",
        educationLevel: "10th Class",
        occupation: "Homemaker",
        otherOccupation: "",
        maritalStatus: "Married",
        isActive: true
      }
    ]);
  };

  const handleRemoveMember = (index) => {
    setAdditionalMembers(additionalMembers.filter((_, i) => i !== index));
  };

  const handleUpdateMember = (index, field, value) => {
    const updated = [...additionalMembers];
    updated[index][field] = value;
    setAdditionalMembers(updated);
  };

  const handleIncomeFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setIncomeFileError("File exceeds 5MB limit. Please upload a smaller PDF or image.");
      setIncomeFile(null);
      return;
    }
    setIncomeFileError("");
    setIncomeFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      previewUrl: URL.createObjectURL(file)
    });
  };

  const handleDobFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setDobFileError("File exceeds 5MB limit.");
      setDobFile(null);
      return;
    }
    setDobFileError("");
    setDobFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      previewUrl: URL.createObjectURL(file)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!headName || !headAadhaar || headAadhaar.length !== 12 || !headDob) {
      alert("Please fill all compulsory fields for the Head of Family.");
      return;
    }

    if (!headMobile || headMobile.length !== 10) {
      alert("Please enter a valid 10-digit Registered Mobile Number for Government SMS notifications and authentication.");
      return;
    }

    if (headOccupation === 'Other' && !headOtherOccupation.trim()) {
      alert("Please specify your exact occupation under 'Other'.");
      return;
    }

    if (!incomeFile) {
      setIncomeFileError("Mandatory: Please upload the official Income Certificate PDF/Image.");
      return;
    }

    if (duplicateAadhaarError) {
      alert("Cannot register: Duplicate Aadhaar detected. Please resolve errors.");
      return;
    }

    const distCode = district.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const generatedFamilyId = `GJ-${distCode}-2026-${randomNum}`;

    const newFamily = {
      id: `FAM_GJ_${Date.now()}`,
      familyIdNumber: generatedFamilyId,
      district,
      taluka,
      villageCity,
      address,
      pincode,
      headMobile,
      casteCategory,
      rationCardType,
      declaredAnnualIncome: Number(declaredAnnualIncome) || 0,
      incomeCertPdfUrl: incomeFile.previewUrl,
      incomeCertFileName: incomeFile.name,
      dobCertFileName: dobFile ? dobFile.name : "Aadhaar_DOB_Verification.pdf",
      incomeVerificationStatus: "PENDING",
      verifiedByAdmin: null,
      verifiedAt: null,
      rejectionReason: null,
      hasAgriLand,
      landSizeAcres: hasAgriLand ? Number(landSizeAcres) || 0 : 0,
      createdAt: new Date().toISOString(),
      members: [
        {
          id: `MEM_${Date.now()}_HEAD`,
          fullName: headName,
          relationToHead: "HEAD",
          gender: headGender,
          dob: headDob,
          aadhaarNumber: headAadhaar,
          mobileNumber: headMobile,
          educationLevel: headEducation,
          occupation: headOccupation === 'Other' ? headOtherOccupation : headOccupation,
          maritalStatus: "Married",
          isActive: true
        },
        ...additionalMembers.map(m => ({
          ...m,
          mobileNumber: m.mobileNumber || headMobile,
          occupation: m.occupation === 'Other' ? m.otherOccupation : m.occupation
        }))
      ],
      appliedSchemes: []
    };

    localStorage.removeItem(DRAFT_KEY);
    onSaveFamily(newFamily);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-300 w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0f2b5c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>New Gujarat Family Registration Form</span>
                {hasAutosaved && (
                  <span className="text-[10px] bg-green-500/30 text-green-300 px-2 py-0.5 rounded font-normal flex items-center gap-1">
                    <Save className="w-3 h-3" /> Autosaved
                  </span>
                )}
              </h2>
              <p className="text-xs text-amber-200">
                Form GJ-KUTUMB-01 (Mandatory Mamlatdar Verification Protocol)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearDraft}
              title="Clear Autosaved Draft"
              className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Duplicate Aadhaar Alert Banner */}
        {duplicateAadhaarError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-2 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="font-semibold">{duplicateAadhaarError}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Head of Family */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-[#0f2b5c] flex items-center gap-1.5">
                <span>1. Head of Family Details</span>
                <span className="text-red-500 font-bold">*</span>
              </h3>
              <span className="text-[11px] text-slate-500">All fields marked (*) are mandatory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh K. Patel"
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Aadhaar Number (12 Digits)*
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="12-digit number"
                  value={headAadhaar}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setHeadAadhaar(val);
                  }}
                  className={`w-full border rounded px-3 py-1.5 text-xs font-mono outline-none ${
                    duplicateAadhaarError ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-1 focus:ring-blue-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Registered Mobile Number (10 Digits)*
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500 font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Mobile"
                    value={headMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setHeadMobile(val);
                    }}
                    className="w-full border border-slate-300 rounded pl-10 pr-3 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Official SMS alerts & OTP login will be sent here.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  required
                  value={headDob}
                  onChange={(e) => setHeadDob(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Gender*
                </label>
                <div className="flex items-center gap-4 py-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="headGender"
                      checked={headGender === 'MALE'}
                      onChange={() => setHeadGender('MALE')}
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="headGender"
                      checked={headGender === 'FEMALE'}
                      onChange={() => setHeadGender('FEMALE')}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Education Level*
                </label>
                <select
                  value={headEducation}
                  onChange={(e) => setHeadEducation(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none bg-white"
                >
                  <option>Primary (1-8)</option>
                  <option>9th Class</option>
                  <option>10th Class</option>
                  <option>11th Science</option>
                  <option>12th Science</option>
                  <option>11th Arts/Commerce</option>
                  <option>12th Arts/Commerce</option>
                  <option>Graduate</option>
                  <option>Illiterate</option>
                </select>
              </div>

              {/* Occupation with "Other" and dynamic text field */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Occupation*
                </label>
                <select
                  value={headOccupation}
                  onChange={(e) => setHeadOccupation(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none bg-white"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Daily Wage Laborer">Daily Wage Laborer</option>
                  <option value="Construction Worker">Construction Worker</option>
                  <option value="Salaried / Private Job">Salaried / Private Job</option>
                  <option value="Self Employed / Shopkeeper">Self Employed / Shopkeeper</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Other">Other (Please specify)</option>
                </select>

                {headOccupation === 'Other' && (
                  <div className="mt-2 animate-in fade-in">
                    <label className="block text-slate-700 font-semibold mb-0.5 text-[11px]">
                      Please specify your occupation*:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Auto Driver, Electrician, Tailor, Carpenter"
                      value={headOtherOccupation}
                      onChange={(e) => setHeadOtherOccupation(e.target.value)}
                      className="w-full border border-amber-400 bg-amber-50/50 rounded px-2.5 py-1 text-xs outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Household & Socio-Economic Profile */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-sm text-[#0f2b5c] border-b border-slate-200 pb-2">
              2. Household & Socio-Economic Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  District*
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none bg-white"
                >
                  {GUJARAT_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Taluka*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daskroi / Choryasi"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Village / Ward / City*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhadaj"
                  value={villageCity}
                  onChange={(e) => setVillageCity(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Social Category / Caste*
                </label>
                <select
                  value={casteCategory}
                  onChange={(e) => setCasteCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none bg-white"
                >
                  {CASTE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Ration Card Category*
                </label>
                <select
                  value={rationCardType}
                  onChange={(e) => setRationCardType(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none bg-white"
                >
                  {RATION_CARD_TYPES.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Pincode*
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-digit PIN"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none font-mono"
                />
              </div>
            </div>

            {/* Land Ownership */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-6">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Does family own agricultural land?*
                </label>
                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="hasAgriLand"
                      checked={hasAgriLand === true}
                      onChange={() => setHasAgriLand(true)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="hasAgriLand"
                      checked={hasAgriLand === false}
                      onChange={() => {
                        setHasAgriLand(false);
                        setLandSizeAcres("");
                      }}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {hasAgriLand && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Land Size (in Acres)*
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 2.5"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(e.target.value)}
                    className="border border-slate-300 rounded px-3 py-1 text-xs outline-none w-32"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Document Uploads (Income Certificate + Age/DOB Proof) */}
          <div className="border-2 border-amber-300 rounded-lg p-4 bg-amber-50/40 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-bold text-sm text-[#0f2b5c] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>3. Mandatory Verification Documents (Income & Age Proof)</span>
                <span className="text-red-500 font-bold">*</span>
              </h3>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                Mamlatdar Verification Queue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document 1: Income Certificate */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Declared Total Annual Income (in ₹)*
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 110000"
                  value={declaredAnnualIncome}
                  onChange={(e) => setDeclaredAnnualIncome(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-800"
                />

                <label className="block text-slate-700 font-bold mt-2 mb-1">
                  Upload Stamped Income Certificate (PDF / Image)*
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleIncomeFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0f2b5c] file:text-white hover:file:bg-blue-900 cursor-pointer"
                />
                {incomeFileError && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">{incomeFileError}</p>
                )}
                {incomeFile && (
                  <div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 rounded">
                    <FileCheck className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{incomeFile.name} ({incomeFile.size})</span>
                  </div>
                )}
              </div>

              {/* Document 2: Age & DOB Verification Proof (Birth Cert / Aadhaar copy) */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Age & Identity Proof (Birth Certificate / Aadhaar Copy)*
                </label>
                <p className="text-[11px] text-slate-500">
                  Required to prevent age manipulation in marriage and school scholarships.
                </p>

                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleDobFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0f2b5c] file:text-white hover:file:bg-blue-900 cursor-pointer"
                />
                {dobFileError && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">{dobFileError}</p>
                )}
                {dobFile && (
                  <div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 rounded">
                    <FileCheck className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{dobFile.name} ({dobFile.size})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Add Additional Family Members */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-[#0f2b5c]">
                4. Other Family Members ({additionalMembers.length})
              </h3>
              <button
                type="button"
                onClick={handleAddMember}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#0f2b5c] text-white text-xs font-semibold rounded hover:bg-[#091c3d] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Family Member</span>
              </button>
            </div>

            {additionalMembers.length === 0 ? (
              <p className="text-slate-500 italic text-center py-2">
                No additional members added yet. Click "+ Add Family Member" to add spouse, children, or elderly parents.
              </p>
            ) : (
              <div className="space-y-3">
                {additionalMembers.map((member, idx) => (
                  <div 
                    key={member.id} 
                    className="bg-white border border-slate-300 rounded-lg p-3 space-y-3 relative shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        Member #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-600 mb-0.5">Full Name*</label>
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={member.fullName}
                          onChange={(e) => handleUpdateMember(idx, 'fullName', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5">Relation*</label>
                        <select
                          value={member.relationToHead}
                          onChange={(e) => handleUpdateMember(idx, 'relationToHead', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none bg-white"
                        >
                          <option value="SPOUSE">Spouse</option>
                          <option value="DAUGHTER">Daughter</option>
                          <option value="SON">Son</option>
                          <option value="MOTHER">Mother</option>
                          <option value="FATHER">Father</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5">Aadhaar (12 Digits)*</label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          placeholder="Unique Aadhaar"
                          value={member.aadhaarNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            handleUpdateMember(idx, 'aadhaarNumber', val);
                          }}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5">Date of Birth*</label>
                        <input
                          type="date"
                          required
                          value={member.dob}
                          onChange={(e) => handleUpdateMember(idx, 'dob', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5">Gender*</label>
                        <select
                          value={member.gender}
                          onChange={(e) => handleUpdateMember(idx, 'gender', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none bg-white"
                        >
                          <option value="FEMALE">Female</option>
                          <option value="MALE">Male</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5">Education*</label>
                        <select
                          value={member.educationLevel}
                          onChange={(e) => handleUpdateMember(idx, 'educationLevel', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none bg-white"
                        >
                          <option>Primary (1-8)</option>
                          <option>9th Class</option>
                          <option>10th Class</option>
                          <option>11th Science</option>
                          <option>12th Science</option>
                          <option>11th Arts/Commerce</option>
                          <option>12th Arts/Commerce</option>
                          <option>Graduate</option>
                          <option>Illiterate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-0.5">Occupation*</label>
                        <select
                          value={member.occupation}
                          onChange={(e) => handleUpdateMember(idx, 'occupation', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs outline-none bg-white"
                        >
                          <option>Student</option>
                          <option>Homemaker</option>
                          <option>Farmer</option>
                          <option>Daily Wage Laborer</option>
                          <option>Private Job</option>
                          <option>Unemployed</option>
                          <option value="Other">Other (Please specify)</option>
                        </select>
                        {member.occupation === 'Other' && (
                          <input
                            type="text"
                            required
                            placeholder="Specify occupation"
                            value={member.otherOccupation || ''}
                            onChange={(e) => handleUpdateMember(idx, 'otherOccupation', e.target.value)}
                            className="mt-1 w-full border border-amber-400 bg-amber-50/50 rounded px-2 py-0.5 text-xs outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={Boolean(duplicateAadhaarError)}
              className={`px-6 py-2 rounded-md font-bold text-white shadow-sm flex items-center gap-2 ${
                duplicateAadhaarError 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-[#0f2b5c] hover:bg-[#091c3d]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit & Generate Family ID</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
