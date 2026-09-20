// Mock Database for Gujarat Kutumb Portal
// Stored in localStorage for live interactive persistence across reloads

export const GUJARAT_DISTRICTS = [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Bhavnagar",
  "Jamnagar",
  "Junagadh",
  "Gandhinagar",
  "Mehsana",
  "Banaskantha",
  "Patan",
  "Kutch",
  "Amreli",
  "Bharuch",
  "Anand",
  "Kheda",
  "Panchmahal",
  "Dahod",
  "Valsad",
  "Navsari",
  "Sabarkantha",
  "Aravalli",
  "Surendranagar",
  "Morbi",
  "Gir Somnath",
  "Porbandar",
  "Devbhumi Dwarka",
  "Botad",
  "Mahisagar",
  "Chhotaudepur",
  "Narmada",
  "Tapi",
  "Dang"
];

export const CASTE_CATEGORIES = [
  { id: "SEBC", label: "SEBC / OBC" },
  { id: "SC", label: "Scheduled Caste (SC)" },
  { id: "ST", label: "Scheduled Tribe (ST)" },
  { id: "EWS", label: "Economically Weaker Section (EWS)" },
  { id: "GENERAL", label: "General" }
];

export const RATION_CARD_TYPES = [
  { id: "AAY", label: "Antyodaya Anna Yojana (AAY)" },
  { id: "BPL", label: "Below Poverty Line (BPL)" },
  { id: "APL", label: "Above Poverty Line (APL)" },
  { id: "NONE", label: "No Ration Card" }
];

export const GUJARAT_SCHEMES = [
  {
    id: "SCH_NAMO_SARASWATI",
    code: "GJ-EDU-01",
    name: "Namo Saraswati Vigyan Sadhana Yojana",
    nameGu: "નમો સરસ્વતી વિજ્ઞાન સાધના યોજના",
    scope: "MEMBER", // Quota: 1 per eligible student (Multiple children allowed!)
    department: "Department of Education, Govt. of Gujarat",
    departmentGu: "શિક્ષણ વિભાગ, ગુજરાત સરકાર",
    benefit: "₹25,000 across 11th & 12th Science",
    benefitGu: "ધોરણ ૧૧ અને ૧૨ વિજ્ઞાન પ્રવાહ માટે ₹૨૫,૦૦૦ સહાય",
    maxIncome: 600000,
    targetGender: "FEMALE",
    targetEducation: ["11th Science", "12th Science"],
    requiresLand: false,
    requiresBpl: false,
    description: "Encouraging female students in Gujarat to pursue higher secondary education in Science streams.",
    descriptionGu: "ગુજરાતમાં કન્યાઓને ધોરણ ૧૧ અને ૧૨ માં વિજ્ઞાન પ્રવાહ પસંદ કરવા માટે પ્રોત્સાહન આપવા ₹૨૫,૦૦૦ ની સહાય."
  },
  {
    id: "SCH_NAMO_LAKSHMI",
    code: "GJ-EDU-02",
    name: "Namo Lakshmi Yojana",
    nameGu: "નમો લક્ષ્મી યોજના",
    scope: "MEMBER", // Quota: 1 per eligible student (Multiple children allowed!)
    department: "Women & Child Development Department",
    departmentGu: "મહિલા અને બાળ વિકાસ વિભાગ",
    benefit: "₹50,000 for secondary education (Grades 9 to 12)",
    benefitGu: "ધોરણ ૯ થી ૧૨ સુધીના અભ્યાસ માટે કુલ ₹૫૦,૦૦૦ સહાય",
    maxIncome: 600000,
    targetGender: "FEMALE",
    targetEducation: ["9th Class", "10th Class", "11th Arts/Commerce", "12th Arts/Commerce"],
    requiresLand: false,
    requiresBpl: false,
    description: "Financial assistance directly credited to girls enrolled in secondary & higher secondary schools.",
    descriptionGu: "કન્યા કેળવણીને વેગ આપવા ધોરણ ૯ થી ૧૨ ની વિદ્યાર્થીનીઓને આર્થિક સહાય."
  },
  {
    id: "SCH_KUNWARBAI",
    code: "GJ-SW-03",
    name: "Kunwarbai nu Mameru Yojana",
    nameGu: "કુંવરબાઈનું મામેરું યોજના",
    scope: "MEMBER", // Quota: 1 per eligible adult daughter
    department: "Social Justice & Empowerment Department",
    departmentGu: "સામાજિક ન્યાય અને અધિકારીતા વિભાગ",
    benefit: "₹12,000 direct bank transfer on daughter's marriage",
    benefitGu: "દીકરીના લગ્ન પ્રસંગે ₹૧૨,૦૦૦ ની સહાય",
    maxIncome: 120000, // Rural 1.2L, Urban 1.5L
    targetGender: "FEMALE",
    targetCaste: ["SC", "ST", "SEBC"],
    minAge: 18,
    targetMaritalStatus: ["Unmarried"],
    requiresLand: false,
    requiresBpl: false,
    description: "Financial grant provided to daughters belonging to economically backward classes at the time of marriage.",
    descriptionGu: "અનુસૂચિત જાતિ/જનજાતિ/SEBC ની પુત્રીઓના લગ્ન પ્રસંગે સરકાર દ્વારા સહાય."
  },
  {
    id: "SCH_KISAN_SAHAY",
    code: "GJ-AGRI-04",
    name: "Mukhyamantri Kisan Sahay Yojana",
    nameGu: "મુખ્યમંત્રી કિસાન સહાય યોજના",
    scope: "HOUSEHOLD", // Quota: Max 1 per Family ID (Agricultural land unit)
    department: "Agriculture, Farmers Welfare & Co-operation Department",
    departmentGu: "કૃષિ અને ખેડૂત કલ્યાણ વિભાગ",
    benefit: "Up to ₹20,000/hectare for crop loss (Drought/Flood/Unseasonal Rain)",
    benefitGu: "કુદરતી આપત્તિમાં પાક નુકસાન સામે હેક્ટર દીઠ ₹૨૦,૦૦૦ સુધી સહાય",
    maxIncome: null, // Open to all farmers
    targetGender: "ALL",
    requiresLand: true,
    minLandAcres: 0.1,
    description: "Comprehensive risk protection for all registered farmers in Gujarat without any premium payment.",
    descriptionGu: "કોઈપણ પ્રીમિયમ વગર ગુજરાતના તમામ ખેડૂતોને પાક નુકસાની સામે રક્ષણ."
  },
  {
    id: "SCH_VIDHVA_SAHAY",
    code: "GJ-WELF-05",
    name: "Ganga Swarupa (Vidhva Sahay) Yojana",
    nameGu: "ગંગા સ્વરૂપા (વિધવા સહાય) યોજના",
    scope: "MEMBER", // Quota: 1 per eligible widowed female
    department: "Women & Child Development Department",
    departmentGu: "મહિલા અને બાળ વિકાસ વિભાગ",
    benefit: "₹1,250 per month direct monthly pension",
    benefitGu: "દર મહિને ₹૧,૨૫૦ પેન્શન સહાય સીધી બેંક ખાતામાં",
    maxIncome: 120000,
    targetGender: "FEMALE",
    targetMaritalStatus: ["Widowed"],
    minAge: 18,
    requiresLand: false,
    description: "Monthly financial security allowance for widowed women in Gujarat until remarriage.",
    descriptionGu: "વિધવા બહેનોને આત્મનિર્ભર બનાવવા માસિક પેન્શન સહાય."
  },
  {
    id: "SCH_MAA_AMRUTAM",
    code: "GJ-HLTH-06",
    name: "Mukhyamantri Amrutam (MAA) / PMJAY Gujarat",
    nameGu: "મુખ્યમંત્રી અમૃતમ (મા) / પીએમજેએવાય ગુજરાત",
    scope: "HOUSEHOLD", // Quota: Max 1 per Family ID (₹10 Lakh aggregate cover)
    department: "Health and Family Welfare Department",
    departmentGu: "આરોગ્ય અને પરિવાર કલ્યાણ વિભાગ",
    benefit: "Cashless healthcare coverage up to ₹10 Lakh per family/year",
    benefitGu: "પરિવાર દીઠ વાર્ષિક ₹૧૦ લાખ સુધીની વિનામૂલ્યે સારવાર",
    maxIncome: 400000,
    targetGender: "ALL",
    requiresLand: false,
    description: "Cashless hospitalisation across all empanelled private and government super-specialty hospitals.",
    descriptionGu: "ગંભીર બીમારીઓ સામે ₹૧૦ લાખ સુધીની કેશલેસ હોસ્પિટલ સારવાર."
  },
  {
    id: "SCH_SHRAMIK_ANNAPURNA",
    code: "GJ-LAB-07",
    name: "Shramik Annapurna Yojana",
    nameGu: "શ્રમિક અન્નપૂર્ણા યોજના",
    scope: "MEMBER", // Quota: 1 per eligible worker
    department: "Labour, Skill Development and Employment Department",
    departmentGu: "શ્રમ અને રોજગાર વિભાગ",
    benefit: "Nutritious full meal at just ₹5 at Kadia Naka",
    benefitGu: "કડિયા નાકા પર માત્ર ₹૫ માં પૌષ્ટિક ગરમ ભોજન",
    maxIncome: 150000,
    targetGender: "ALL",
    targetOccupation: ["Daily Wage Laborer", "Construction Worker"],
    requiresLand: false,
    description: "Subsidized hot and hygienic cooked meals for registered construction workers and unorganized laborers.",
    descriptionGu: "બાંધકામ શ્રમિકો અને દૈનિક મજૂરો માટે ₹૫ માં પૌષ્ટિક ભોજન યોજના."
  }
];

// Initial Seed Data: Realistic Gujarat Families
export const INITIAL_FAMILIES = [
  {
    id: "FAM_GJ_001",
    familyIdNumber: "GJ-AMD-2026-10492",
    district: "Ahmedabad",
    taluka: "Daskroi",
    villageCity: "Bhadaj",
    address: "Plot 42, Gayatri Society, Near Canal Road",
    pincode: "380060",
    headMobile: "9825143210",
    casteCategory: "SEBC",
    rationCardType: "BPL",
    declaredAnnualIncome: 110000,
    incomeCertPdfUrl: "/documents/sample_income_cert_10492.pdf",
    incomeCertFileName: "Mamlatdar_Income_Certificate_2026_10492.pdf",
    incomeVerificationStatus: "VERIFIED", // Verified by Taluka Officer
    verifiedByAdmin: "K. R. Vaghela (TDO Daskroi)",
    verifiedAt: "2026-09-15T10:30:00Z",
    hasAgriLand: true,
    landSizeAcres: 1.8,
    createdAt: "2026-09-12T09:15:00Z",
    members: [
      {
        id: "MEM_001_1",
        aadhaarNumber: "782134569012",
        fullName: "Rameshbhai Kanubhai Patel",
        relationToHead: "HEAD",
        gender: "MALE",
        dob: "1979-06-14",
        mobileNumber: "9825143210",
        maritalStatus: "Married",
        educationLevel: "10th Class",
        occupation: "Farmer",
        isActive: true
      },
      {
        id: "MEM_001_2",
        aadhaarNumber: "914567230189",
        fullName: "Gitaben Rameshbhai Patel",
        relationToHead: "SPOUSE",
        gender: "FEMALE",
        dob: "1983-09-22",
        maritalStatus: "Married",
        educationLevel: "8th Class",
        occupation: "Homemaker",
        isActive: true
      },
      {
        id: "MEM_001_3",
        aadhaarNumber: "623489104578",
        fullName: "Priyaben Rameshbhai Patel",
        relationToHead: "DAUGHTER",
        gender: "FEMALE",
        dob: "2008-11-04",
        maritalStatus: "Unmarried",
        educationLevel: "11th Science",
        occupation: "Student",
        isActive: true
      },
      {
        id: "MEM_001_4",
        aadhaarNumber: "451290783456",
        fullName: "Maniba Kanubhai Patel",
        relationToHead: "MOTHER",
        gender: "FEMALE",
        dob: "1954-03-10",
        maritalStatus: "Widowed",
        educationLevel: "Illiterate",
        occupation: "Senior Citizen",
        isActive: true
      },
      {
        id: "MEM_001_5",
        aadhaarNumber: "881234907612",
        fullName: "Diyaben Rameshbhai Patel",
        relationToHead: "DAUGHTER",
        gender: "FEMALE",
        dob: "2007-04-12",
        maritalStatus: "Unmarried",
        educationLevel: "12th Science",
        occupation: "Student",
        isActive: true
      }
    ],
    appliedSchemes: ["SCH_MAA_AMRUTAM", "SCH_KISAN_SAHAY"]
  },
  {
    id: "FAM_GJ_002",
    familyIdNumber: "GJ-SRT-2026-88219",
    district: "Surat",
    taluka: "Choryasi",
    villageCity: "Bhestan",
    address: "Room 14, Shramik Colony, Near Railway Line",
    pincode: "395023",
    headMobile: "9978123456",
    casteCategory: "SC",
    rationCardType: "AAY",
    declaredAnnualIncome: 75000,
    incomeCertPdfUrl: "/documents/sample_income_cert_88219.pdf",
    incomeCertFileName: "Talati_Income_Proof_Surat_88219.pdf",
    incomeVerificationStatus: "PENDING", // PENDING Officer Review
    verifiedByAdmin: null,
    verifiedAt: null,
    hasAgriLand: false,
    landSizeAcres: 0,
    createdAt: "2026-09-19T14:40:00Z",
    members: [
      {
        id: "MEM_002_1",
        aadhaarNumber: "558912347601",
        fullName: "Devrajbhai Mohanbhai Solanki",
        relationToHead: "HEAD",
        gender: "MALE",
        dob: "1988-02-18",
        mobileNumber: "9978123456",
        maritalStatus: "Married",
        educationLevel: "5th Class",
        occupation: "Daily Wage Laborer",
        isActive: true
      },
      {
        id: "MEM_002_2",
        aadhaarNumber: "334589012378",
        fullName: "Kavitaben Devrajbhai Solanki",
        relationToHead: "SPOUSE",
        gender: "FEMALE",
        dob: "1991-07-29",
        maritalStatus: "Married",
        educationLevel: "7th Class",
        occupation: "Construction Worker",
        isActive: true
      },
      {
        id: "MEM_002_3",
        aadhaarNumber: "220198456734",
        fullName: "Anjali Devrajbhai Solanki",
        relationToHead: "DAUGHTER",
        gender: "FEMALE",
        dob: "2010-04-15",
        maritalStatus: "Unmarried",
        educationLevel: "9th Class",
        occupation: "Student",
        isActive: true
      }
    ],
    appliedSchemes: ["SCH_SHRAMIK_ANNAPURNA"]
  },
  {
    id: "FAM_GJ_003",
    familyIdNumber: "GJ-MEH-2026-30194",
    district: "Mehsana",
    taluka: "Kadi",
    villageCity: "Nandasan",
    address: "House 88, Vankar Vas, Village Center",
    pincode: "382705",
    headMobile: "9712345678",
    casteCategory: "SC",
    rationCardType: "BPL",
    declaredAnnualIncome: 95000,
    incomeCertPdfUrl: "/documents/sample_income_cert_30194.pdf",
    incomeCertFileName: "Mamlatdar_Kadi_Cert_30194.pdf",
    incomeVerificationStatus: "VERIFIED",
    verifiedByAdmin: "P. B. Joshi (Mamlatdar Kadi)",
    verifiedAt: "2026-09-17T11:00:00Z",
    hasAgriLand: false,
    landSizeAcres: 0,
    createdAt: "2026-09-16T11:20:00Z",
    members: [
      {
        id: "MEM_003_1",
        aadhaarNumber: "889012345671",
        fullName: "Sarojben Jayantibhai Vankar",
        relationToHead: "HEAD",
        gender: "FEMALE",
        dob: "1972-12-05",
        mobileNumber: "9712345678",
        maritalStatus: "Widowed",
        educationLevel: "Primary",
        occupation: "Tailor",
        isActive: true
      },
      {
        id: "MEM_003_2",
        aadhaarNumber: "667890123452",
        fullName: "Bhavik Jayantibhai Vankar",
        relationToHead: "SON",
        gender: "MALE",
        dob: "2002-05-18",
        maritalStatus: "Unmarried",
        educationLevel: "Graduate",
        occupation: "Private Service",
        isActive: true
      }
    ],
    appliedSchemes: ["SCH_VIDHVA_SAHAY"]
  }
];

// Seeded Fraud / Anomaly Alerts for Government Admin
export const INITIAL_FRAUD_ALERTS = [
  {
    id: "ALERT_01",
    type: "DUPLICATE_AADHAAR_ATTEMPT",
    severity: "HIGH",
    detectedAt: "2026-09-20T09:12:00Z",
    title: "Duplicate Aadhaar Registration Attempt Blocked",
    description: "Citizen attempted to register Aadhaar 7821-3456-9012 in Surat, but this Aadhaar is already bound to Family ID #GJ-AMD-2026-10492 in Ahmedabad.",
    familyIdNumber: "GJ-AMD-2026-10492",
    status: "BLOCKED"
  },
  {
    id: "ALERT_02",
    type: "INCOME_ASSET_DISPARITY",
    severity: "MEDIUM",
    detectedAt: "2026-09-18T16:45:00Z",
    title: "Income & Landholding Disparity Detected",
    description: "Family declared Annual Income of ₹45,000 (claiming BPL ration) while owning 18.5 Acres of commercial agricultural land in Rajkot.",
    familyIdNumber: "GJ-RJK-2026-99120",
    status: "UNDER_REVIEW"
  }
];
