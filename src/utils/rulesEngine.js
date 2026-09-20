import { GUJARAT_SCHEMES } from '../data/mockDatabase';

/**
 * Gujarat Welfare Scheme Rules Engine
 * Implements 2-Tier Entitlement Logic:
 *  1. HOUSEHOLD-LEVEL: Strict 1 quota per Family ID (Ration Card, Kisan Sahay, PMJAY).
 *  2. MEMBER-LEVEL: Multi-beneficiary allocation per eligible individual (Namo Saraswati, Namo Lakshmi).
 */
export function evaluateFamilySchemes(family) {
  const results = [];
  const members = (family.members || []).filter(m => m.isActive);
  const isIncomeVerified = family.incomeVerificationStatus === 'VERIFIED';
  const familyIncome = Number(family.declaredAnnualIncome) || 0;
  const appliedList = family.appliedSchemes || [];

  // Helper to check if an entitlement key or scheme is already claimed
  const isClaimed = (schemeId, memberId = null) => {
    if (memberId) {
      const specificKey = `${schemeId}:${memberId}`;
      return appliedList.includes(specificKey) || (appliedList.includes(schemeId) && members.length === 1);
    }
    return appliedList.includes(schemeId) || appliedList.some(k => typeof k === 'string' && k.startsWith(`${schemeId}:`));
  };

  for (const scheme of GUJARAT_SCHEMES) {
    const isHouseholdScope = scheme.scope === 'HOUSEHOLD';

    // 1. Check Family Income Threshold
    const passesIncome = scheme.maxIncome === null || familyIncome <= scheme.maxIncome;
    if (!passesIncome) {
      results.push({
        entitlementKey: `${scheme.id}:HOUSEHOLD`,
        scheme,
        scope: scheme.scope,
        status: 'NOT_ELIGIBLE',
        matchingMember: null,
        matchReason: "",
        blockReason: `Annual household income (₹${familyIncome.toLocaleString('en-IN')}) exceeds scheme limit of ₹${scheme.maxIncome.toLocaleString('en-IN')}`
      });
      continue;
    }

    // 2. TIER 1: HOUSEHOLD-LEVEL SCHEMES (Max 1 per Family ID)
    if (isHouseholdScope) {
      const head = members.find(m => m.relationToHead === 'HEAD') || members[0];
      let isEligible = false;
      let blockReason = "";
      let matchReason = "";

      if (scheme.requiresLand) {
        if (!family.hasAgriLand || (Number(family.landSizeAcres) || 0) <= 0) {
          blockReason = "Requires active registered agricultural landholding in Gujarat.";
        } else {
          isEligible = true;
          matchReason = `Family holds ${family.landSizeAcres} acres of verified agricultural land. (1 Quota per Household)`;
        }
      } else if (scheme.id === 'SCH_MAA_AMRUTAM') {
        isEligible = true;
        matchReason = `Entire household of ${members.length} members covered up to ₹10 Lakhs cashless hospitalization.`;
      }

      const alreadyEnrolled = isClaimed(scheme.id);

      if (alreadyEnrolled) {
        results.push({
          entitlementKey: scheme.id,
          scheme,
          scope: 'HOUSEHOLD',
          status: 'ENROLLED',
          matchingMember: head,
          matchReason: `Active Household Benefit • Family ID #${family.familyIdNumber}`,
          blockReason: ""
        });
      } else if (isEligible) {
        if (scheme.maxIncome !== null && !isIncomeVerified) {
          results.push({
            entitlementKey: scheme.id,
            scheme,
            scope: 'HOUSEHOLD',
            status: 'PENDING_INCOME_VERIFICATION',
            matchingMember: head,
            matchReason,
            blockReason: "Held: Income Certificate requires official Mamlatdar verification."
          });
        } else {
          results.push({
            entitlementKey: scheme.id,
            scheme,
            scope: 'HOUSEHOLD',
            status: 'ELIGIBLE',
            matchingMember: head,
            matchReason,
            blockReason: ""
          });
        }
      } else {
        results.push({
          entitlementKey: scheme.id,
          scheme,
          scope: 'HOUSEHOLD',
          status: 'NOT_ELIGIBLE',
          matchingMember: null,
          matchReason: "",
          blockReason: blockReason || "Household does not meet required criteria."
        });
      }

      continue; // Move to next scheme
    }

    // 3. TIER 2: MEMBER-LEVEL SCHEMES (Allows Multiple Eligible Children/Members!)
    let qualifyingMembers = [];
    let schemeBlockReason = "";

    if (scheme.id === 'SCH_NAMO_SARASWATI') {
      // Find ALL female students enrolled in 11th or 12th Science
      qualifyingMembers = members.filter(m => 
        m.gender === 'FEMALE' && 
        (m.educationLevel === '11th Science' || m.educationLevel === '12th Science')
      );
      if (qualifyingMembers.length === 0) {
        schemeBlockReason = "Requires female family member(s) enrolled in 11th or 12th Science stream.";
      }
    } else if (scheme.id === 'SCH_NAMO_LAKSHMI') {
      // Find ALL female students in Grades 9 through 12
      qualifyingMembers = members.filter(m => 
        m.gender === 'FEMALE' && 
        ['9th Class', '10th Class', '11th Arts/Commerce', '12th Arts/Commerce', '11th Science', '12th Science'].includes(m.educationLevel)
      );
      if (qualifyingMembers.length === 0) {
        schemeBlockReason = "Requires female student(s) in Grades 9 through 12.";
      }
    } else if (scheme.id === 'SCH_KUNWARBAI') {
      // Find ALL adult unmarried daughters in SC/ST/SEBC
      const casteMatches = scheme.targetCaste.includes(family.casteCategory);
      if (!casteMatches) {
        schemeBlockReason = `Applicable for SC, ST, and SEBC categories. (Family is ${family.casteCategory})`;
      } else {
        qualifyingMembers = members.filter(m => {
          if (m.gender !== 'FEMALE' || m.maritalStatus !== 'Unmarried') return false;
          const birthYear = new Date(m.dob).getFullYear();
          const age = new Date().getFullYear() - birthYear;
          return age >= 18;
        });
        if (qualifyingMembers.length === 0) {
          schemeBlockReason = "Requires an unmarried adult daughter (age 18+) in the household.";
        }
      }
    } else if (scheme.id === 'SCH_VIDHVA_SAHAY') {
      // Find ALL widowed female members
      qualifyingMembers = members.filter(m => m.gender === 'FEMALE' && m.maritalStatus === 'Widowed');
      if (qualifyingMembers.length === 0) {
        schemeBlockReason = "No widowed female member recorded in this family.";
      }
    } else if (scheme.id === 'SCH_SHRAMIK_ANNAPURNA') {
      // Find ALL unorganized/construction laborers
      qualifyingMembers = members.filter(m => ['Daily Wage Laborer', 'Construction Worker'].includes(m.occupation));
      if (qualifyingMembers.length === 0) {
        schemeBlockReason = "Requires a registered daily wage or construction worker in the family.";
      }
    }

    // IF NO MEMBERS QUALIFY:
    if (qualifyingMembers.length === 0) {
      results.push({
        entitlementKey: `${scheme.id}:NONE`,
        scheme,
        scope: 'MEMBER',
        status: 'NOT_ELIGIBLE',
        matchingMember: null,
        matchReason: "",
        blockReason: schemeBlockReason || "No family member meets the eligibility constraints."
      });
    } else {
      // IF ONE OR MORE MEMBERS QUALIFY (e.g. 2 daughters for Namo Saraswati!):
      // Emit an entitlement card for EACH qualifying individual child/member!
      for (const qMember of qualifyingMembers) {
        const memberKey = `${scheme.id}:${qMember.id}`;
        const alreadyClaimedByMember = isClaimed(scheme.id, qMember.id);

        let matchReason = "";
        if (scheme.id === 'SCH_NAMO_SARASWATI') {
          matchReason = `${qMember.fullName} is enrolled in ${qMember.educationLevel}. Individual student scholarship grant.`;
        } else if (scheme.id === 'SCH_NAMO_LAKSHMI') {
          matchReason = `${qMember.fullName} is enrolled in secondary education (${qMember.educationLevel}).`;
        } else if (scheme.id === 'SCH_KUNWARBAI') {
          matchReason = `${qMember.fullName} is an eligible adult unmarried daughter (${family.casteCategory}).`;
        } else if (scheme.id === 'SCH_VIDHVA_SAHAY') {
          matchReason = `${qMember.fullName} (${qMember.relationToHead}) is eligible for monthly widow pension.`;
        } else if (scheme.id === 'SCH_SHRAMIK_ANNAPURNA') {
          matchReason = `${qMember.fullName} is an unorganized/construction worker.`;
        }

        if (alreadyClaimedByMember) {
          results.push({
            entitlementKey: memberKey,
            scheme,
            scope: 'MEMBER',
            status: 'ENROLLED',
            matchingMember: qMember,
            matchReason,
            blockReason: ""
          });
        } else if (scheme.maxIncome !== null && !isIncomeVerified) {
          results.push({
            entitlementKey: memberKey,
            scheme,
            scope: 'MEMBER',
            status: 'PENDING_INCOME_VERIFICATION',
            matchingMember: qMember,
            matchReason,
            blockReason: "Held: Household income certificate requires Mamlatdar verification."
          });
        } else {
          results.push({
            entitlementKey: memberKey,
            scheme,
            scope: 'MEMBER',
            status: 'ELIGIBLE',
            matchingMember: qMember,
            matchReason,
            blockReason: ""
          });
        }
      }
    }
  }

  return results;
}
