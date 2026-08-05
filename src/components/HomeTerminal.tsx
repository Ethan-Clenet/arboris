import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '#/lib/i18n'

type Seg = { text: string; className?: string }

type TermLine =
  | { type: 'cmd'; segs: Seg[] }
  | { type: 'out'; text: string; className?: string }
  | { type: 'gap' }

function linePlain(line: TermLine): string {
  if (line.type === 'cmd') return line.segs.map((s) => s.text).join('')
  if (line.type === 'out') return line.text
  return ''
}

function renderPartialSegs(segs: Seg[], visibleChars: number) {
  let remaining = visibleChars
  const nodes: ReactNode[] = []
  for (let i = 0; i < segs.length; i++) {
    if (remaining <= 0) break
    const seg = segs[i]
    const take = Math.min(remaining, seg.text.length)
    nodes.push(
      <span key={i} className={seg.className}>
        {seg.text.slice(0, take)}
      </span>,
    )
    remaining -= take
  }
  return nodes
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** Terminal mockup home — typing progressif des commandes CLI. */
export default function HomeTerminal() {
  const { t } = useI18n()
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [done, setDone] = useState(false)

  const lines = useMemo<TermLine[]>(
    () => [
      {
        type: 'cmd',
        segs: [
          { text: '$ ', className: 'text-[#30A46C]' },
          { text: 'npm i ' },
          { text: 'arboris-cli', className: 'text-[#9BCB3C]' },
        ],
      },
      { type: 'out', text: `✓ ${t.home.termInstallOk}`, className: 'text-[#3ECF8E]' },
      { type: 'gap' },
      {
        type: 'cmd',
        segs: [
          { text: '$ ', className: 'text-[#30A46C]' },
          { text: 'npx ' },
          { text: 'arboris-cli', className: 'text-[#9BCB3C]' },
          { text: ' list' },
        ],
      },
      { type: 'out', text: t.home.termListLine1, className: 'text-[#6B7280]' },
      { type: 'out', text: t.home.termListLine2, className: 'text-[#6B7280]' },
      { type: 'out', text: t.home.termListMore, className: 'text-[#3ECF8E]' },
    ],
    [t.home.termInstallOk, t.home.termListLine1, t.home.termListLine2, t.home.termListMore],
  )

  // Démarre quand le terminal entre dans le viewport
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Reset si la langue change après démarrage
  useEffect(() => {
    if (!started) return
    setLineIdx(0)
    setCharIdx(0)
    setDone(false)
  }, [lines, started])

  useEffect(() => {
    if (!started) return
    if (reducedMotion) {
      setLineIdx(lines.length)
      setDone(true)
      return
    }

    if (lineIdx >= lines.length) {
      setDone(true)
      return
    }

    const line = lines[lineIdx]
    const plain = linePlain(line)

    // gap / out : pause puis ligne suivante
    if (line.type === 'gap' || line.type === 'out') {
      const delay = line.type === 'gap' ? 280 : charIdx === 0 ? 420 : 55
      if (line.type === 'out' && charIdx < plain.length) {
        const id = window.setTimeout(() => setCharIdx((c) => c + 1), delay)
        return () => window.clearTimeout(id)
      }
      const id = window.setTimeout(() => {
        setLineIdx((i) => i + 1)
        setCharIdx(0)
      }, line.type === 'gap' ? 280 : 380)
      return () => window.clearTimeout(id)
    }

    // cmd : typing caractère par caractère
    if (charIdx < plain.length) {
      const id = window.setTimeout(() => setCharIdx((c) => c + 1), 32)
      return () => window.clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      setLineIdx((i) => i + 1)
      setCharIdx(0)
    }, 480)
    return () => window.clearTimeout(id)
  }, [started, reducedMotion, lineIdx, charIdx, lines])

  const showCursor = started && !done && !reducedMotion

  return (
    <div
      ref={rootRef}
      className="rise-in overflow-hidden rounded-[14px] border border-[#20242c] bg-[#0d1117] shadow-[0_22px_60px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-[7px] border-b border-[#20242c] bg-[#161b22] px-3.5 py-[11px]">
        <span className="h-[11px] w-[11px] rounded-full bg-[#ED6A5E]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#F4BF4F]" />
        <span className="h-[11px] w-[11px] rounded-full bg-[#61C554]" />
        <span className="ml-2 font-mono text-[11.5px] text-[#6B7280]">agent — zsh</span>
      </div>
      <div
        className="min-h-[168px] p-5 font-mono text-[13.5px] leading-[1.95] text-[#C9D1D9]"
        aria-live="polite"
      >
        {lines.map((line, i) => {
          if (i > lineIdx && !(reducedMotion && done)) return null
          if (line.type === 'gap') {
            if (i < lineIdx || (reducedMotion && done)) return <div key={i} className="h-[1.95em]" />
            return null
          }

          const isCurrent = i === lineIdx && !done && !reducedMotion
          const plain = linePlain(line)
          const visible = reducedMotion || done || i < lineIdx ? plain.length : charIdx

          if (line.type === 'cmd') {
            return (
              <div key={i}>
                {renderPartialSegs(line.segs, visible)}
                {isCurrent ? <Caret /> : null}
              </div>
            )
          }

          return (
            <div key={i} className={line.className}>
              {line.text.slice(0, visible)}
              {isCurrent ? <Caret /> : null}
              {done && i === lines.length - 1 ? (
                <span className="ml-[5px] inline-block h-4 w-2 -translate-y-[2px] bg-[#3ECF8E] align-middle [animation:sp-blink_1.1s_steps(1)_infinite]" />
              ) : null}
            </div>
          )
        })}
        {showCursor && lineIdx >= lines.length ? <Caret /> : null}
      </div>
    </div>
  )
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-[2px] inline-block h-[1.05em] w-[0.55em] translate-y-[0.12em] bg-[#3ECF8E] align-baseline [animation:sp-blink_1.1s_steps(1)_infinite]"
    />
  )
}
