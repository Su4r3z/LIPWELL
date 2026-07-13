/**
 * Utilitário para classificar suplementos no turno correto (manhã / noite / ambos)
 * baseado no campo `schedule` da tabela `supplements`.
 */

export type SupplementShift = 'morning' | 'evening' | 'both';

const MORNING_KEYWORDS = [
  'manhã', 'manha', 'acordar', 'jejum', 'café', 'cafe', 'am',
  '06', '07', '08', '09', '10', '11',
];

const EVENING_KEYWORDS = [
  'noite', 'dormir', 'jantar', 'ceia', 'pm',
  '18', '19', '20', '21', '22',
];

const BOTH_PATTERNS = [
  'manhã e noite', 'manha e noite', '2x ao dia', '2 vezes', 'twice',
  'manhã e à noite', 'manhã e a noite',
];

/**
 * Retorna o turno de um suplemento baseado no seu campo `schedule`.
 * - 'both' → aparece nos dois turnos
 * - 'morning' → apenas manhã
 * - 'evening' → apenas noite (ou sem horário definido)
 */
export function getSupplementShift(schedule: string | null | undefined): SupplementShift {
  if (!schedule || schedule.trim() === '') return 'evening';

  const normalized = schedule.toLowerCase().trim();

  // Verifica se é dos dois turnos primeiro
  if (BOTH_PATTERNS.some(p => normalized.includes(p))) {
    return 'both';
  }

  const isMorning = MORNING_KEYWORDS.some(k => normalized.includes(k));
  const isEvening = EVENING_KEYWORDS.some(k => normalized.includes(k));

  if (isMorning && isEvening) return 'both';
  if (isMorning) return 'morning';
  return 'evening'; // default
}

/**
 * Retorna true se o suplemento deve aparecer no turno informado.
 */
export function isVisibleInShift(
  schedule: string | null | undefined,
  shift: 'morning' | 'evening'
): boolean {
  const s = getSupplementShift(schedule);
  return s === 'both' || s === shift;
}
