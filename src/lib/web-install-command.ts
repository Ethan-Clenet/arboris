import { SITE_URL } from '#/lib/site'

export type WebInstallKind = 'collection' | 'skill' | 'command'
export type WebInstallOs = 'unix' | 'windows'

export function webInstallerFile(kind: WebInstallKind): string {
  return `arboris-install-${kind}.mjs`
}

export function webInstallerUrl(kind: WebInstallKind, siteUrl = SITE_URL): string {
  return `${siteUrl}/cli/install-${kind}.mjs`
}

export function buildWebInstallCommand(input: {
  kind: WebInstallKind
  id: string
  os: WebInstallOs
  extraArgs?: string
  siteUrl?: string
}): string {
  const url = webInstallerUrl(input.kind, input.siteUrl)
  const file = webInstallerFile(input.kind)
  const extra = input.extraArgs ? ` ${input.extraArgs}` : ''
  switch (input.os) {
    case 'unix':
      return `curl -fsSL ${url} -o /tmp/${file} && node /tmp/${file} ${input.id}${extra}`
    case 'windows':
      return `iwr -UseBasicParsing ${url} -OutFile "$env:TEMP\\${file}"; node "$env:TEMP\\${file}" ${input.id}${extra}`
    default: {
      const _exhaustive: never = input.os
      return _exhaustive
    }
  }
}

export function parseWebInstallArgs(args: string): { kind: WebInstallKind; id: string } | null {
  if (args.startsWith('collection ')) {
    const id = args.slice('collection '.length).trim()
    return id ? { kind: 'collection', id } : null
  }
  if (args.startsWith('install-command ')) {
    const id = args.slice('install-command '.length).trim()
    return id ? { kind: 'command', id } : null
  }
  if (args.startsWith('install ')) {
    const id = args.slice('install '.length).trim()
    return id ? { kind: 'skill', id } : null
  }
  if (args.startsWith('command ')) {
    const id = args.slice('command '.length).trim()
    return id ? { kind: 'command', id } : null
  }
  return null
}
