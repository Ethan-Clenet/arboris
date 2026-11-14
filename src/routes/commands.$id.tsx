import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useMemo } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import LangText from '#/components/LangText'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getCommand } from '#/server/functions'
import { AgentBadge } from '#/components/AgentLogo'
import CommandInstallButtons from '#/components/CommandInstallButtons'
import CloudInstallPanel from '#/components/CloudInstallPanel'
import { commandInstallContent } from '#/lib/command-types'
import {
  commandSeoTitle,
  frenchEntityDescription,
  localizedVisibleDescription,
  seoHead,
  commandJsonLd,
} from '#/lib/seo'
import { privateNoStoreHeaders, publicHtmlCacheHeaders } from '#/lib/http-cache'

export const Route = createFileRoute('/commands/$id')({
  loader: async ({ params }) => {
    const command = await getCommand({ data: { id: params.id } })
    if (!command) throw notFound()
    return { command }
  },
  headers: ({ loaderData }) => (loaderData ? publicHtmlCacheHeaders() : privateNoStoreHeaders()),
  head: ({ loaderData }) => {
    const command = loaderData?.command
    if (!command) return seoHead({ title: 'Commande', path: '/commands' })
    const description = frenchEntityDescription(command.description.fr, 'command', command.id)
    return seoHead({
      title: commandSeoTitle(command.id),
      path: `/commands/${command.id}`,
      description,
      type: 'article',
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Commandes', path: '/commands' },
        { name: `/${command.id}`, path: `/commands/${command.id}` },
      ],
      jsonLd: commandJsonLd({ id: command.id, description }),
    })
  },
  component: CommandDetailPage,
})

function CommandDetailPage() {
  const { command } = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy(1700)
  const content = useMemo(() => commandInstallContent(command), [command])
  const copied = copiedKey === command.id

  const handleCopy = () =>
    copySkill({
      id: command.id,
      lang,
      announceMsg: t.commands.copied,
      fileContent: content,
    })

  return (
    <PageShell className="pt-6 pb-20">
      <nav className="mb-[26px] flex items-center gap-2 text-[13px] text-[var(--text-3)]" aria-label={t.a11y.breadcrumb}>
        <Link to="/commands" className="cursor-pointer text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
          {t.commands.back}
        </Link>
        <Icon name="caret-right" size={12} />
        <span className="font-mono text-[var(--text-2)]" aria-current="page">
          /{command.id}
        </span>
      </nav>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-[22px]">
          <div className="grid h-16 w-16 flex-none place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
            <Icon name="terminal-window" bold size={32} />
          </div>
          <div className="min-w-[240px] flex-1">
            <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-[11px] py-1 text-[12px] font-semibold text-[var(--accent-text)]">
                <Icon name="terminal" bold size={13} />
                {t.commands.slash}
              </span>
            </div>
            <h1 className="mb-3 break-words font-mono text-[30px] font-semibold leading-[1.1] tracking-[-0.01em]">
              /{command.id}
            </h1>
            <p className="mb-[18px] max-w-[640px] text-[16px] text-[var(--text-2)]">
              <LangText
                text={localizedVisibleDescription(command.description, 'command', command.id, lang)}
              />
            </p>
            <p className="mb-5 max-w-[640px] text-[14px] leading-relaxed text-[var(--text-2)]">
              {t.commands.aboutBody(command.id)}
            </p>
            {command.skillIds.length > 0 ? (
              <div className="mb-5 max-w-[640px]">
                <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
                  {t.commands.companionSkills}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {command.skillIds.map((id) => (
                    <li key={id}>
                      <Link
                        to="/skills/$id"
                        params={{ id }}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[12.5px] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]"
                      >
                        <Icon name="sparkle" size={12} className="text-[var(--accent-text)]" />
                        {id}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3.5">
              <Button variant="primary" size="lg" copied={copied} onClick={handleCopy}>
                <Icon name={copied ? 'check' : 'copy'} size={16} />
                {copied ? t.commands.copied : t.commands.copy}
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full shrink-0 lg:mt-1 lg:max-w-[440px]">
          <CloudInstallPanel
            mode="command"
            targetId={command.id}
            lang={lang}
            agents={command.compat}
            cliArgs={`command ${command.id}`}
            t={t.cloudInstall}
            localSlot={
              <CommandInstallButtons
                commandId={command.id}
                agents={command.compat}
                lang={lang}
                t={{
                  installTitle: t.commands.installTitle,
                  install: t.commands.install,
                  installed: t.commands.installed,
                  usageHint: t.commands.usageHint,
                  errors: t.commands.installErrors,
                }}
              />
            }
          />
        </div>
      </div>

      <div className="mt-[30px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-[18px] py-[13px]">
          <h2 className="m-0 flex items-center gap-2.5 font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)]">
            <Icon name="cursor-text" bold size={14} className="text-[var(--accent-text)]" />
            {t.commands.promptHeading(command.id)}
          </h2>
          <Button variant="copy" size="sm" copied={copied} onClick={handleCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={14} />
            {copied ? t.commands.copied : t.commands.copy}
          </Button>
        </div>
        <div className="px-5 py-[18px]">
          <pre
            tabIndex={0}
            className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-[12.5px] leading-[1.65] text-[var(--text-1)]"
          >
            {content}
          </pre>
        </div>
        <div className="px-5 pb-4 text-[12.5px] text-[var(--text-3)]">{t.commands.promptHint}</div>
      </div>

      <aside className="mt-8 max-w-[420px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow-card)]">
        <h2 className="mb-3.5 font-display text-[15px] font-semibold text-[var(--text-1)]">
          {t.commands.usageHeading(command.id)}
        </h2>
        <div className="mb-1.5 text-[12px] text-[var(--text-3)]">{t.commands.compat}</div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {command.compat.map((name) => (
            <AgentBadge key={name} agent={name} size={15} />
          ))}
        </div>
        <p className="text-[13px] leading-[1.5] text-[var(--text-2)]">{t.commands.howItWorks}</p>
      </aside>
    </PageShell>
  )
}
