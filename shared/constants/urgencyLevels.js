// Urgency level definitions
export const URGENCY_LEVELS = {
  CRITICAL: 'Critical',
  URGENT: 'Urgent',
  NORMAL: 'Normal'
};

export const URGENCY_COLORS = {
  [URGENCY_LEVELS.CRITICAL]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    dot: 'bg-red-500'
  },
  [URGENCY_LEVELS.URGENT]: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    dot: 'bg-amber-500'
  },
  [URGENCY_LEVELS.NORMAL]: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500'
  }
};

// Radius search stages in kilometers
export const SEARCH_RADIUS_STAGES = [5, 10, 25];
