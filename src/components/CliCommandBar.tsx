import Icon from '#/components/Icon'
import Toast from '#/components/Toast'
import { SITE_URL } from '#/lib/site'
import { useCopy } from '#/lib/useCopy'

type CliCommandBarProps = {
  /** Arguments après le binaire CLI (ex. `node`, `install mon-skill`, `collection ux-ui-pro`). */
  args: string
  copyLabel: string
  copiedLabel: string
  className?: string
}

const CLI_BIN = 'arboris-cli@latest'
/** Installateur web — toujours à jour avec le catalogue déployé (pas le cache npm). */
const COLLECTION_INSTALLER = `${SITE_URL}/cli/install-collection.mjs`

function isCollectionArgs(args: string): boolean {
  return args.startsWith('collection ')
}

function CommandDisplay({ args }: { args: string }) {
  if (isCollectionArgs(args)) {
    const id = args.slice('collection '.length).trim()
    return (
      <>
        npx --yes <span className="text-[#9BCB3C]">{COLLECTION_INSTALLER}</span>{' '}
        <span className="text-[#9BCB3C]">{id}</span>
      </>
    )
  }

  if (args.startsWith('install ')) {
    const skillId = args.slice('install '.length)
    return (
      <>
        npx <span className="text-[#9BCB3C]">{CLI_BIN}</span> install{' '}
        <span className="text-[#9BCB3C]">{skillId}</span>
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

function buildCommand(args: string): string {
  if (isCollectionArgs(args)) {
    const id = args.slice('collection '.length).trim()
    return `npx --yes ${COLLECTION_INSTALLER} ${id}`
  }
  return `npx ${CLI_BIN} ${args}`
}

export default function CliCommandBar({ args, copyLabel, copiedLabel, className = '' }: CliCommandBarProps) {
  const { copiedKey, copy } = useCopy(1600)
  const command = buildCommand(args)
  const copied = copiedKey === command

  return (
    <>
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
      <Toast show={copied} text={copiedLabel} />
    </>
  )
}
