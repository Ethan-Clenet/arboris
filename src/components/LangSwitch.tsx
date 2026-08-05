import type { Lang } from '#/lib/catalog'
import { useI18n } from '#/lib/i18n'

const LANGS: Lang[] = ['fr', 'en']

export default function LangSwitch({ accent = false }: { accent?: boolean }) {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      className="flex shrink-0 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5"
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
            className={`shrink-0 cursor-pointer rounded-md px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
              active
                ? accent
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-hover)] text-[var(--text-1)]'
                : 'bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)]'
            }`}
          >
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
