import { ROLES } from '../../../shared/constants/roles.js';
import { BLOOD_GROUPS } from '../../../shared/constants/bloodGroups.js';

export function validateRegisterInput(data) {
  const errors = [];
  const { email, password, role, fullName, phone } = data;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (!role || !Object.values(ROLES).includes(role)) {
    errors.push(`Role must be one of: ${Object.values(ROLES).join(', ')}`);
  }

  if (!fullName || fullName.trim().length < 2) {
    errors.push('Full name is required (minimum 2 characters).');
  }

  // Role-specific validation
  if (role === ROLES.DONOR) {
    if (!data.bloodGroup || !BLOOD_GROUPS.includes(data.bloodGroup)) {
      errors.push(`Valid blood group is required for donor registration (${BLOOD_GROUPS.join(', ')}).`);
    }
    if (!data.city || data.city.trim().length === 0) {
      errors.push('City is required.');
    }
  }

  if (role === ROLES.HOSPITAL) {
    if (!data.hospitalName || data.hospitalName.trim().length < 2) {
      errors.push('Hospital official name is required.');
    }
    if (!data.registrationNumber || data.registrationNumber.trim().length < 3) {
      errors.push('Hospital official registration license number is required.');
    }
    if (!data.address || data.address.trim().length < 5) {
      errors.push('Complete physical address is required.');
    }
    if (!data.city || data.city.trim().length === 0) {
      errors.push('City is required.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateLoginInput(data) {
  const errors = [];
  const { email, password } = data;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
