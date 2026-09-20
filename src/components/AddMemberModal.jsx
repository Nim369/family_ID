import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Phone, 
  Calendar, 
  CreditCard,
  ShieldCheck
} from 'lucide-react';

export default function AddMemberModal({ 
  isOpen, 
  onClose, 
  family, 
  existingFamilies = [], 
  onAddMember 
}) {
  if (!isOpen || !family) return null;

  const [fullName, setFullName] = useState("");
  const [relationToHead, setRelationToHead] = useState("SPOUSE");
  const [gender, setGender] = useState("FEMALE");
  const [dob, setDob] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState(family.headMobile || "");
  const [educationLevel, setEducationLevel] = useState("Graduate");
  const [occupation, setOccupation] = useState("Homemaker");
  const [otherOccupation, setOtherOccupation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Married");
  const [docFile, setDocFile] = useState(null);
  const [docFileError, setDocFileError] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

  // Build index of all registered Aadhaars across Gujarat for real-time de-duplication
  const registeredAadhaars = useMemo(() => {
    const map = new Map();
    (existingFamilies || []).forEach(f => {
      (f.members || []).forEach(m => {
        if (m.aadhaarNumber) {
          map.set(m.aadhaarNumber, f.familyIdNumber);
        }
      });
    });
    return map;
  }, [existingFamilies]);

  // Real-time Aadhaar validation
  useEffect(() => {
    const clean = (aadhaarNumber || "").trim();
    if (clean.length === 12) {
      // 1. Check if registered in another family or this family
      if (registeredAadhaars.has(clean)) {
        const registeredFamilyId = registeredAadhaars.get(clean);
        setDuplicateError(
          `De-Duplication Alert: Aadhaar (${clean}) is ALREADY registered under Family ID #${registeredFamilyId}. A citizen can strictly belong to only ONE household in the State of Gujarat.`
        );
        return;
      }
      // 2. Check within current family's active members
      const existsInCurrent = (family.members || []).some(m => m.aadhaarNumber === clean);
      if (existsInCurrent) {
        setDuplicateError(`This Aadhaar is already registered in your family profile.`);
        return;
      }
      setDuplicateError("");
    } else {
      setDuplicateError("");
    }
  }, [aadhaarNumber, registeredAadhaars, family]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setDocFileError("Document exceeds 5MB limit.");
      setDocFile(null);
      return;
    }
    setDocFileError("");
    setDocFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      previewUrl: URL.createObjectURL(file)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter member's full legal name.");
      return;
    }

    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (duplicateError) {
      alert("Cannot enroll member: Duplicate Aadhaar detected. Please resolve errors.");
      return;
    }

    if (!dob) {
      alert("Please select Date of Birth.");
      return;
    }

    if (mobileNumber && mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (occupation === 'Other' && !otherOccupation.trim()) {
      alert("Please specify the exact occupation under 'Other'.");
      return;
    }

    const newMember = {
      id: `MEM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: fullName.trim(),
      relationToHead,
      gender,
      dob,
      aadhaarNumber,
      mobileNumber: mobileNumber || family.headMobile || "",
      educationLevel,
      occupation: occupation === 'Other' ? otherOccupation.trim() : occupation,
      maritalStatus,
      idProofFileName: docFile ? docFile.name : "Aadhaar_Enrollment_Proof.pdf",
      enrollmentDate: new Date().toISOString(),
      isActive: true
    };

    onAddMember(newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-300 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0f2b5c] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Add Family Member</span>
                <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20 text-amber-300">
                  {family.familyIdNumber}
                </span>
              </h2>
              <p className="text-slate-300 text-xs">
                Demographic Enrollment into Gujarat State Household Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#f8fafc]">
          {/* De-duplication Error Warning */}
          {duplicateError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Registration Prohibited:</strong>
                <span>{duplicateError}</span>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" /> Member Demographic Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Full Legal Name (as per Aadhaar)*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyaben Nimit Mistry"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-800"
                />
              </div>

              {/* Relation */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Relationship to Head of Family*
                </label>
                <select
                  value={relationToHead}
                  onChange={(e) => {
                    const rel = e.target.value;
                    setRelationToHead(rel);
                    if (rel === 'SPOUSE' || rel === 'MOTHER' || rel === 'DAUGHTER' || rel === 'SISTER') {
                      setGender('FEMALE');
                    } else if (rel === 'SON' || rel === 'FATHER' || rel === 'BROTHER') {
                      setGender('MALE');
                    }
                  }}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none bg-white font-medium text-slate-800"
                >
                  <option value="SPOUSE">Spouse (Wife / Husband)</option>
                  <option value="SON">Son</option>
                  <option value="DAUGHTER">Daughter</option>
                  <option value="MOTHER">Mother</option>
                  <option value="FATHER">Father</option>
                  <option value="BROTHER">Brother</option>
                  <option value="SISTER">Sister</option>
                  <option value="DAUGHTER-IN-LAW">Daughter-in-Law</option>
                  <option value="SON-IN-LAW">Son-in-Law</option>
                  <option value="GRANDSON">Grandson</option>
                  <option value="GRANDDAUGHTER">Granddaughter</option>
                  <option value="OTHER">Other Relative</option>
                </select>
              </div>

              {/* Aadhaar Number */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Aadhaar Number (12 Digits)*
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="12-digit Unique Aadhaar"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                  className={`w-full border rounded px-2.5 py-1.5 text-xs font-mono outline-none ${
                    duplicateError ? 'border-red-500 bg-red-50 text-red-900 font-bold' : 'border-slate-300 focus:ring-1 focus:ring-blue-800'
                  }`}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mobile Number (10 Digits)*
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-500 font-bold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9825143210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full border border-slate-300 rounded pl-9 pr-2.5 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Direct SMS alerts will be dispatched to this number.
                </span>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Gender*
                </label>
                <div className="flex items-center gap-4 py-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="memberGender"
                      checked={gender === 'MALE'}
                      onChange={() => setGender('MALE')}
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="memberGender"
                      checked={gender === 'FEMALE'}
                      onChange={() => setGender('FEMALE')}
                    />
                    <span>Female</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="memberGender"
                      checked={gender === 'OTHER'}
                      onChange={() => setGender('OTHER')}
                    />
                    <span>Other</span>
                  </label>
                </div>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Marital Status*
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none bg-white"
                >
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Education Level*
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none bg-white"
                >
                  <option>Primary (1-8)</option>
                  <option>9th Class</option>
                  <option>10th Class</option>
                  <option>11th Science</option>
                  <option>12th Science</option>
                  <option>11th Arts/Commerce</option>
                  <option>12th Arts/Commerce</option>
                  <option>Graduate</option>
                  <option>Post Graduate</option>
                  <option>Illiterate</option>
                </select>
              </div>

              {/* Occupation */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  Occupation*
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none bg-white"
                  >
                    <option value="Homemaker">Homemaker</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Daily Wage Laborer">Daily Wage Laborer</option>
                    <option value="Construction Worker">Construction Worker</option>
                    <option value="Salaried / Private Job">Salaried / Private Job</option>
                    <option value="Self Employed / Shopkeeper">Self Employed / Shopkeeper</option>
                    <option value="Student">Student</option>
                    <option value="Child">Child</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                    <option value="Other">Other (Please specify)</option>
                  </select>

                  {occupation === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Specify occupation (e.g. Teacher, Nurse, Tailor)"
                      value={otherOccupation}
                      onChange={(e) => setOtherOccupation(e.target.value)}
                      className="w-full border border-amber-400 bg-amber-50 rounded px-2.5 py-1.5 text-xs outline-none"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Document Verification Proof */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Identity & Relationship Proof (Aadhaar / Birth Certificate)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Upload official government ID proof for verification by the Taluka Mamlatdar.
            </p>

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0f2b5c] file:text-white hover:file:bg-blue-900 cursor-pointer"
            />
            {docFileError && (
              <p className="text-[11px] text-red-600 font-bold mt-1">{docFileError}</p>
            )}
            {docFile && (
              <div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 rounded">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-medium">{docFile.name} ({docFile.size})</span>
              </div>
            )}
          </div>

          {/* Notice of Automatic Welfare Recalculation */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px] space-y-1">
            <span className="font-bold block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" /> Proactive Government Recalculation:
            </span>
            <p className="text-slate-600">
              Upon adding this member, your household unit count will increase. PDS food grain allocations (NFSA) and health coverage (PMJAY/MAA) will automatically reflect the newly enrolled member.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!duplicateError}
              className={`px-5 py-2 text-white font-bold rounded shadow transition flex items-center gap-1.5 ${
                duplicateError 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-[#0f2b5c] hover:bg-[#091c3d]'
              }`}
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Enroll & Update Family Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
