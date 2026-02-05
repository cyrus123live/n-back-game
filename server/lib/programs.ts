// Server-side program template IDs and validation
// Session definitions live in the frontend; server just tracks enrollment and progress

export const VALID_TEMPLATE_IDS = ['beginner', 'intermediate', 'advanced'];

export const TEMPLATE_TOTAL_DAYS: Record<string, number> = {
  beginner: 20,
  intermediate: 20,
  advanced: 20,
};

export const DEFAULT_REQUIRED_SCORE = 0.7;
export const SKIP_THRESHOLD = 0.9;

// Phase boundaries: [startDay, nLevel, stimuliKey]
// Used to compute skip targets when a user scores above SKIP_THRESHOLD
const TEMPLATE_PHASES: Record<string, [number, number, string][]> = {
  beginner: [
    [1, 2, 'color,position'],
    [6, 2, 'color,position,shape'],
    [11, 3, 'color,position'],
    [16, 3, 'color,position,shape'],
  ],
  intermediate: [
    [1, 3, 'color,position'],
    [2, 3, 'color,position,shape'],
    [4, 3, 'color,number,position,shape'],
    [8, 4, 'color,position'],
    [12, 4, 'color,position,shape'],
    [16, 4, 'color,number,position,shape'],
  ],
  advanced: [
    [1, 4, 'color,position,shape'],
    [2, 4, 'color,number,position,shape'],
    [7, 5, 'color,position'],
    [10, 5, 'color,position,shape'],
    [13, 5, 'color,number,position,shape'],
  ],
};

export function isValidTemplateId(id: string): boolean {
  return VALID_TEMPLATE_IDS.includes(id);
}

// Get the day to skip to when score >= SKIP_THRESHOLD
// Returns the start day of the next phase, or the last day if no next phase
export function getSkipTarget(templateId: string, currentDay: number): number {
  const phases = TEMPLATE_PHASES[templateId];
  const totalDays = TEMPLATE_TOTAL_DAYS[templateId] || 20;
  if (!phases) return Math.min(currentDay + 1, totalDays);

  for (const [startDay] of phases) {
    if (startDay > currentDay) {
      return startDay;
    }
  }

  // No next phase - skip to last day
  return totalDays;
}
