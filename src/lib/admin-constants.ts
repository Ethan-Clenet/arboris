export const ADMIN_SKILL_ICONS = [
  'package',
  'lightning',
  'hexagon',
  'cpu',
  'shield-check',
  'broom',
  'book-open-text',
  'git-branch',
  'magic-wand',
  'image',
  'brackets-angle',
  'compass',
  'atom',
  'rocket-launch',
  'wrench',
  'database',
  'lock-key',
  'flask',
  'bug',
  'terminal-window',
  'paint-brush',
  'globe',
] as const

export const ADMIN_CAT_ICONS = [
  'lightning',
  'cpu',
  'brackets-angle',
  'shield-check',
  'broom',
  'book-open-text',
  'git-branch',
  'magic-wand',
  'image',
  'database',
  'globe',
  'flask',
] as const

export const ADMIN_CAT_COLORS = [
  '#43A047',
  '#3178C6',
  '#E5A53B',
  '#8B7FF7',
  '#E5484D',
  '#2DB8B0',
  '#F2789F',
  '#46C2E8',
  '#F08A4B',
  '#9BCB3C',
] as const

export const ADMIN_COMPAT = [
  { name: 'Claude', icon: 'sparkle', dot: '#D97757' },
  { name: 'Cursor', icon: 'cursor', dot: '#4F8FF7' },
  { name: 'Codex', icon: 'code', dot: '#10A37F' },
  { name: 'Copilot', icon: 'github-logo', dot: '#8B7FF7' },
] as const

export type AdminView = 'overview' | 'skills' | 'create' | 'cats' | 'technos'

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
