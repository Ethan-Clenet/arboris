import { looksEnglish } from '#/lib/seo'
import type { ElementType } from 'react'

/** Marque `lang="en"` si le texte n’est pas du français (page `html lang=fr`). */
export default function LangText({
  text,
  as: Tag = 'span',
  className,
}: {
  text: string
  as?: ElementType
  className?: string
}) {
  return (
    <Tag className={className} lang={looksEnglish(text) ? 'en' : undefined}>
      {text}
    </Tag>
  )
}
