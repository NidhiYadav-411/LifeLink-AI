// Standard blood groups and component compatibility rules
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPONENTS = {
  WHOLE_BLOOD: 'Whole Blood',
  RED_BLOOD_CELLS: 'Red Blood Cells (PRBC)',
  PLATELETS: 'Platelets (RDP/SDP)',
  PLASMA: 'Fresh Frozen Plasma (FFP)',
  CRYOPRECIPITATE: 'Cryoprecipitate'
};

// Red blood cells / Whole blood compatibility matrix (Key = Recipient, Value = Allowed Donors)
export const RBC_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient for RBC
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal Donor for RBC
};

// Plasma compatibility matrix (Plasma is inverted: AB is Universal Donor, O is Universal Recipient)
export const PLASMA_COMPATIBILITY = {
  'O+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], // Universal Recipient for Plasma
  'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'A+': ['A+', 'A-', 'AB+', 'AB-'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'B-', 'AB+', 'AB-'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+', 'AB-'], // AB only receives AB plasma
  'AB-': ['AB+', 'AB-']
};

// Platelets Compatibility
export const PLATELET_COMPATIBILITY = RBC_COMPATIBILITY;

// Determine compatibility between donor and recipient given component
export function isBloodCompatible(donorGroup, recipientGroup, component = BLOOD_COMPONENTS.WHOLE_BLOOD) {
  if (!donorGroup || !recipientGroup) return false;
  
  if (component === BLOOD_COMPONENTS.PLASMA || component === BLOOD_COMPONENTS.CRYOPRECIPITATE) {
    return PLASMA_COMPATIBILITY[recipientGroup]?.includes(donorGroup) || false;
  }
  
  return RBC_COMPATIBILITY[recipientGroup]?.includes(donorGroup) || false;
}
