import type { Catalog } from '#/lib/catalog'
import { slugify } from '#/lib/admin-constants'

export type AdminSkillState = {
  id: string
  cat: string
  icon: string
  tech: string[]
  compat: string[]
  stacks: string[]
  tag: { fr: string; en: string }
}

export type AdminCatState = {
  id: string
  fr: string
  en: string
  color: string
  icon: string
}

export type AdminFormState = {
  id: string
  cat: string
  icon: string
  descFr: string
  descEn: string
  tech: string
  compat: string[]
  stacks: string[]
}

export type AdminNewCatState = {
  name: string
  color: string
  icon: string
}

export function catalogToAdminState(catalog: Catalog) {
  const skills: AdminSkillState[] = catalog.skills.map((s) => ({
    id: s.id,
    cat: s.categoryId,
    icon: s.icon,
    tech: s.tech.slice(),
    compat: s.compat.slice(),
    stacks: s.stacks.slice(),
    tag: { fr: s.tag.fr, en: s.tag.en },
  }))

  const cats: AdminCatState[] = catalog.categories.map((c) => ({
    id: c.id,
    fr: c.label.fr,
    en: c.label.en,
    color: c.color,
    icon: c.icon,
  }))

  return { skills, cats }
}

export function emptyForm(cats: AdminCatState[]): AdminFormState {
  return {
    id: '',
    cat: cats[0]?.id ?? '',
    icon: 'package',
    descFr: '',
    descEn: '',
    tech: '',
    compat: [],
    stacks: [],
  }
}

export function formFromSkill(skill: AdminSkillState): AdminFormState {
  return {
    id: skill.id,
    cat: skill.cat,
    icon: skill.icon,
    descFr: skill.tag.fr,
    descEn: skill.tag.en,
    tech: skill.tech.join(', '),
    compat: skill.compat.slice(),
    stacks: skill.stacks.slice(),
  }
}

export function formToSkill(form: AdminFormState): AdminSkillState | null {
  const id = slugify(form.id)
  if (!id || !form.descFr.trim()) return null
  const tech = form.tech
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  return {
    id,
    cat: form.cat,
    icon: form.icon,
    tech,
    compat: form.compat.slice(),
    stacks: form.stacks.slice(),
    tag: {
      fr: form.descFr.trim(),
      en: (form.descEn.trim() || form.descFr.trim()),
    },
  }
}

export function newCatRecord(name: string, color: string, icon: string): AdminCatState | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const id = slugify(trimmed)
  if (!id) return null
  return { id, fr: trimmed, en: trimmed, color, icon }
}
