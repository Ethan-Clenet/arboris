import type { AdminCatState, AdminFormState, AdminSkillState } from '#/lib/admin-state'
import type { Stack } from '#/lib/catalog'

export const catSecurity: AdminCatState = {
  id: 'security',
  fr: 'Sécurité',
  en: 'Security',
  color: '#0D9488',
  icon: 'shield',
}

export const skillGate: AdminSkillState = {
  id: 'gateguard',
  cat: 'security',
  icon: 'shield-check',
  tech: ['ts'],
  compat: ['Cursor'],
  stacks: ['ts'],
  tag: { fr: 'Garde', en: 'Guard' },
  score: 88,
  securityRecommendation: 'SAFE',
}

export const skillRisky: AdminSkillState = {
  id: 'risky',
  cat: 'security',
  icon: 'warning-circle',
  tech: [],
  compat: ['Claude'],
  stacks: [],
  tag: { fr: 'Risqué', en: 'Risky' },
  score: 12,
  securityRecommendation: 'UNSAFE',
}

export const stackTs: Stack = {
  id: 'ts',
  label: 'TypeScript',
  icon: 'code',
  color: '#3178C6',
  brief: { fr: 'ts', en: 'ts' },
  skillIds: ['gateguard'],
}

export const formT = {
  fId: 'Identifiant',
  fIcon: 'Icône',
  fCat: 'Catégorie',
  fDescFr: 'Description (FR)',
  fDescEn: 'Description (EN)',
  descPh: 'Ce que fait le skill…',
  fBody: 'Contenu SKILL.md',
  bodyPh: 'body',
  bodyHint: 'Markdown',
  fDoesFr: 'Ce que ça fait (FR)',
  fDoesEn: 'Ce que ça fait (EN)',
  fTriggersFr: 'Quand l’utiliser (FR)',
  fTriggersEn: 'Quand l’utiliser (EN)',
  listPh: '- Point',
  listHint: 'Une ligne',
  fTech: 'Technologies',
  techHint: 'virgules',
  fCompat: 'Compatibilité',
  fStacks: 'Technos associées',
  cancel: 'Annuler',
  save: 'Enregistrer',
  create: 'Créer le skill',
}

export function filledForm(patch: Partial<AdminFormState> = {}): AdminFormState {
  return {
    id: 'gateguard',
    cat: 'security',
    icon: 'shield-check',
    descFr: 'Garde',
    descEn: 'Guard',
    tech: 'ts',
    compat: ['Cursor'],
    stacks: ['ts'],
    doesFr: '- filtre',
    doesEn: '- filters',
    triggersFr: '- merge',
    triggersEn: '- merge',
    bodyMd: '# body',
    ...patch,
  }
}
