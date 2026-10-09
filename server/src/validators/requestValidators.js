import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../../shared/constants/bloodGroups.js';
import { REQUEST_STATUS, VALID_STATUS_TRANSITIONS } from '../../../shared/constants/requestStatus.js';
import { URGENCY_LEVELS } from '../../../shared/constants/urgencyLevels.js';

export function validateBloodRequestInput(data) {
  const errors = [];
  const {
    hospitalName,
    requiredBloodGroup,
    unitsRequired,
    urgencyLevel,
    requiredDatetime
  } = data;

  if (!hospitalName || hospitalName.trim().length === 0) {
    errors.push('Hospital or facility name is required.');
  }

  if (!requiredBloodGroup || !BLOOD_GROUPS.includes(requiredBloodGroup)) {
    errors.push(`A valid blood group is required (${BLOOD_GROUPS.join(', ')}).`);
  }

  const units = parseInt(unitsRequired, 10);
  if (isNaN(units) || units < 1 || units > 20) {
    errors.push('Units required must be an integer between 1 and 20.');
  }

  if (urgencyLevel && !['Critical', 'Urgent', 'Normal'].includes(urgencyLevel)) {
    errors.push('Urgency level must be Critical, Urgent, or Normal.');
  }

  if (!requiredDatetime) {
    errors.push('Required date and time is mandatory.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateStatusTransition(currentStatus, nextStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}
