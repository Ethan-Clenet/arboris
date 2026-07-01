import type { Lang } from '#/lib/catalog'
import { useI18n } from '#/lib/i18n'

const LANGS: Lang[] = ['fr', 'en']

export default function LangSwitch() {
  const { lang, setLang } = useI18n()

  return (
    <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
      {LANGS.map((l) => {
        const active = lang === l
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={`cursor-pointer rounded-md px-[9px] py-[5px] font-mono text-[11px] font-semibold transition-colors ${
              active ? 'bg-[var(--accent)] text-white' : 'bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)]'
            }`}
          >
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
