import { useState } from 'react'
import Icon from '#/components/Icon'
import Toast from '#/components/Toast'
import { useCopy } from '#/lib/useCopy'
import {
  buildWebInstallCommand,
  parseWebInstallArgs,
  type WebInstallOs,
} from '#/lib/web-install-command'

type CliCommandBarProps = {
  /** Arguments après le binaire CLI (ex. `node`, `install mon-skill`, `collection ux-ui-pro`). */
  args: string
  copyLabel: string
  copiedLabel: string
  className?: string
}

const CLI_BIN = 'arboris-cli@latest'

function CommandDisplay({ args, os }: { args: string; os: WebInstallOs }) {
  const parsed = parseWebInstallArgs(args)
  if (parsed) {
    const command = buildWebInstallCommand({ kind: parsed.kind, id: parsed.id, os })
    const highlight = `install-${parsed.kind}.mjs`
    const idx = command.indexOf(highlight)
    if (idx === -1) {
      return <>{command}</>
    }
    const before = command.slice(0, idx)
    const after = command.slice(idx + highlight.length)
    return (
      <>
        {before}
        <span className="text-[#9BCB3C]">{highlight}</span>
        {after.slice(0, after.indexOf(parsed.id))}
        <span className="text-[#9BCB3C]">{parsed.id}</span>
        {after.slice(after.indexOf(parsed.id) + parsed.id.length)}
      </>
    )
  }

  if (args.startsWith('publisher ') || args.startsWith('creator ')) {
    const [cmd, ...rest] = args.split(' ')
    const publisher = rest.join(' ')
    return (
      <>
        npx <span className="text-[#9BCB3C]">{CLI_BIN}</span> {cmd}{' '}
        <span className="text-[#9BCB3C]">{publisher}</span>
      </>
    )
  }

  return (
    <>
      npx <span className="text-[#9BCB3C]">{CLI_BIN}</span> <span className="text-[#9BCB3C]">{args}</span>
    </>
  )
}

function buildCommand(args: string, os: WebInstallOs): string {
  const parsed = parseWebInstallArgs(args)
  if (parsed) {
    return buildWebInstallCommand({ kind: parsed.kind, id: parsed.id, os })
  }
  return `npx ${CLI_BIN} ${args}`
}

function OsToggle({
  os,
  onChange,
}: {
  os: WebInstallOs
  onChange: (next: WebInstallOs) => void
}) {
  const options: Array<{ id: WebInstallOs; label: string; hint: string }> = [
    { id: 'unix', label: 'Unix', hint: 'macOS, Linux, Git Bash' },
    { id: 'windows', label: 'Windows', hint: 'PowerShell' },
  ]
  return (
    <div className="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="Système">
      {options.map((opt) => {
        const active = os === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={opt.hint}
            onClick={() => onChange(opt.id)}
            className={`cursor-pointer rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
              active
                ? 'border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]'
                : 'border-[#30363d] text-[#8B949E] hover:border-[#484f58] hover:text-[#C9D1D9]'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function CliCommandBar({ args, copyLabel, copiedLabel, className = '' }: CliCommandBarProps) {
  const { copiedKey, copy } = useCopy(1600)
  const parsed = parseWebInstallArgs(args)
  const [os, setOs] = useState<WebInstallOs>('unix')
  const command = buildCommand(args, os)
  const copied = copiedKey === command

  return (
    <>
      {parsed ? <OsToggle os={os} onChange={setOs} /> : null}
      <div
        className={`flex w-full max-w-[420px] items-start gap-2 rounded-[10px] border border-[#20242c] bg-[#0d1117] px-3 py-2 ${className}`}
      >
        <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-[12px] leading-[1.45] text-[#C9D1D9]">
          <span className="text-[#30A46C]">{os === 'windows' ? '>' : '$'}</span>{' '}
          <CommandDisplay args={args} os={os} />
        </code>
        <button
          type="button"
          onClick={() => copy(command, command, copiedLabel)}
          aria-label={copyLabel}
          title={copyLabel}
          className={`mt-0.5 grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md border transition-colors ${
            copied
              ? 'border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]'
              : 'border-[#30363d] text-[#8B949E] hover:border-[#484f58] hover:text-[#C9D1D9]'
          }`}
        >
          <Icon name={copied ? 'check' : 'copy'} size={13} />
        </button>
      </div>
      <Toast show={copied} text={copiedLabel} />
    </>
  )
}
