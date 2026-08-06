import Icon from '#/components/Icon'
import { useCopy } from '#/lib/useCopy'

type CliCommandBarProps = {
  /** Arguments après `npx arboris-cli` (ex. `node` ou `install mon-skill`). */
  args: string
  copyLabel: string
  copiedLabel: string
  className?: string
}

function CommandDisplay({ args }: { args: string }) {
  if (args.startsWith('install ')) {
    const skillId = args.slice('install '.length)
    return (
      <>
        npx <span className="text-[#9BCB3C]">arboris-cli</span> install{' '}
        <span className="text-[#9BCB3C]">{skillId}</span>
      </>
    )
  }

  if (args.startsWith('publisher ') || args.startsWith('creator ')) {
    const [cmd, ...rest] = args.split(' ')
    const publisher = rest.join(' ')
    return (
      <>
        npx <span className="text-[#9BCB3C]">arboris-cli</span> {cmd}{' '}
        <span className="text-[#9BCB3C]">{publisher}</span>
      </>
    )
  }

  return (
    <>
      npx <span className="text-[#9BCB3C]">arboris-cli</span> <span className="text-[#9BCB3C]">{args}</span>
    </>
  )
}

export default function CliCommandBar({ args, copyLabel, copiedLabel, className = '' }: CliCommandBarProps) {
  const { copiedKey, copy } = useCopy(1600)
  const command = `npx arboris-cli ${args}`
  const copied = copiedKey === command

  return (
    <div
      className={`flex w-full max-w-[420px] items-center gap-2 rounded-[10px] border border-[#20242c] bg-[#0d1117] px-3 py-2 ${className}`}
    >
      <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] leading-none text-[#C9D1D9]">
        <span className="text-[#30A46C]">$</span> <CommandDisplay args={args} />
      </code>
      <button
        type="button"
        onClick={() => copy(command, command, copiedLabel)}
        aria-label={copyLabel}
        title={copyLabel}
        className={`grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md border transition-colors ${
          copied
            ? 'border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]'
            : 'border-[#30363d] text-[#8B949E] hover:border-[#484f58] hover:text-[#C9D1D9]'
        }`}
      >
        <Icon name={copied ? 'check' : 'copy'} size={13} />
      </button>
    </div>
  )
}
