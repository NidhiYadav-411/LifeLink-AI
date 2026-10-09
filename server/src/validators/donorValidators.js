import { BLOOD_GROUPS } from '../../../shared/constants/bloodGroups.js';

export function validateDonorProfileUpdate(data) {
  const errors = [];
  const { bloodGroup, city, isAvailable } = data;

  if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push(`Invalid blood group. Allowed: ${BLOOD_GROUPS.join(', ')}`);
  }

  if (city !== undefined && city.trim().length === 0) {
    errors.push('City cannot be empty.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
