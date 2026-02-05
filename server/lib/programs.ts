// Server-side program template IDs and validation
// Session definitions live in the frontend; server just tracks enrollment and progress

export const VALID_TEMPLATE_IDS = ['beginner', 'intermediate', 'advanced'];

export const TEMPLATE_TOTAL_DAYS: Record<string, number> = {
  beginner: 20,
  intermediate: 20,
  advanced: 20,
};

export function isValidTemplateId(id: string): boolean {
  return VALID_TEMPLATE_IDS.includes(id);
}
