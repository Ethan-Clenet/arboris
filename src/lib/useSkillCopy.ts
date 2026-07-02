import { useCallback } from 'react'
import { useServerFn } from '@tanstack/react-start'
import type { Lang } from '#/lib/catalog'
import { buildSkillMarkdown, type SkillDetail } from '#/lib/catalog'
import { getSkillCopyContent } from '#/server/functions'
import { useCopy } from '#/lib/useCopy'

type CopySkillInput = {
  id: string
  lang: Lang
  announceMsg: string
  /** Contenu déjà chargé (fiche skill) — évite un aller-retour serveur. */
  fallback?: SkillDetail
  fileContent?: string | null
}

/** Copie le contenu markdown/txt d'un skill dans le presse-papiers. */
export function useSkillCopy(resetMs = 1600) {
  const { copiedKey, copy } = useCopy(resetMs)
  const fetchCopy = useServerFn(getSkillCopyContent)

  const copySkill = useCallback(
    async ({ id, lang, announceMsg, fallback, fileContent }: CopySkillInput) => {
      let text = fileContent ?? null
      if (!text && fallback) {
        text = buildSkillMarkdown(fallback, lang)
      }
      if (!text) {
        text = await fetchCopy({ data: { id, lang } })
      }
      if (!text) return
      copy(text, id, announceMsg)
    },
    [copy, fetchCopy],
  )

  return { copiedKey, copySkill }
}
