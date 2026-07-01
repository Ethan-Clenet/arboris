import type { Lang } from '#/lib/catalog'
import { useI18n } from '#/lib/i18n'

const LANGS: Lang[] = ['fr', 'en']

const LANG_LABELS: Record<Lang, 'langFr' | 'langEn'> = {
  fr: 'langFr',
  en: 'langEn',
}

export default function LangSwitch() {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      className="flex shrink-0 items-center rounded-md border border-[var(--border)] bg-[var(--surface)] p-0.5"
      role="group"
      aria-label={t.a11y.language}
    >
      {LANGS.map((l) => {
        const active = lang === l
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            aria-label={t.a11y[LANG_LABELS[l]]}
            className={`shrink-0 cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
              active
                ? 'bg-[var(--surface-hover)] text-[var(--text-1)]'
                : 'bg-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
          >
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
