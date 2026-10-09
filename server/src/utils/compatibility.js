import {
  BLOOD_GROUPS,
  BLOOD_COMPONENTS,
  RBC_COMPATIBILITY,
  PLASMA_COMPATIBILITY,
  isBloodCompatible
} from '../../../shared/constants/bloodGroups.js';

export { BLOOD_GROUPS, BLOOD_COMPONENTS, isBloodCompatible };

/**
 * Generates an informative clinical compatibility explanation for matching report
 */
export function getCompatibilityExplanation(donorGroup, recipientGroup, component = 'Whole Blood') {
  if (donorGroup === recipientGroup) {
    return `Exact ${donorGroup} group match for ${component}`;
  }

  if (donorGroup === 'O-' && (component === 'Whole Blood' || component.includes('Red Blood'))) {
    return `O- Universal Red Blood Cell Donor compatible with ${recipientGroup} recipient`;
  }

  if (donorGroup === 'AB+' && component.includes('Plasma')) {
    return `AB+ Universal Plasma Donor compatible with ${recipientGroup} recipient`;
  }

  if (donorGroup === 'O+' && recipientGroup.includes('+')) {
    return `O+ Rh-positive compatible donor for ${recipientGroup} recipient`;
  }

  return `Compatible ${donorGroup} donor for ${recipientGroup} (${component})`;
}
