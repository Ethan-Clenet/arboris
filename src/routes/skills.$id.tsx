import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useMemo } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getSkillFileContent, getSkillPageContext } from '#/server/functions'
import { buildSkillMarkdown, hexToRgba, skillLabel } from '#/lib/catalog'
import { resolveSkillGithubUrl } from '#/lib/skill-github'
import { AgentBadge } from '#/components/AgentLogo'
import SkillInstallButtons from '#/components/SkillInstallButtons'
import CliCommandBar from '#/components/CliCommandBar'
import SecurityBadge from '#/components/SecurityBadge'
import NvidiaLogo from '#/components/NvidiaLogo'
import PublisherLogo from '#/components/PublisherLogo'
import { hasPublisherLogo } from '#/lib/publisher-logos'
import { seoHead, entityDescription, skillSeoTitle, isIndexableSkill } from '#/lib/seo'

export const Route = createFileRoute('/skills/$id')({
  loader: async ({ params }) => {
    const [ctx, fileContent] = await Promise.all([
      getSkillPageContext({ data: { id: params.id } }),
      getSkillFileContent({ data: { id: params.id } }),
    ])
    if (!ctx) throw notFound()
    return { ...ctx, fileContent }
  },
  head: ({ loaderData }) => {
    const skill = loaderData?.skill
    if (!skill) return seoHead({ title: 'Skill', path: '/skills', noIndex: true })
    return seoHead({
      title: skillSeoTitle(skillLabel(skill)),
      path: `/skills/${skill.id}`,
      description: entityDescription(skill.tag.fr, 'skill', skillLabel(skill)),
      type: 'article',
      noIndex: !isIndexableSkill(skill),
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Skills', path: '/skills' },
        { name: skillLabel(skill), path: `/skills/${skill.id}` },
      ],
    })
  },
  component: SkillDetailPage,
})

function SkillDetailPage() {
  const { skill, category, related, fileContent } = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy(1700)

  const color = category?.color ?? 'var(--text-3)'
  const tint = category ? hexToRgba(category.color, 0.14) : 'var(--surface-2)'
  const publisher = skill.publisher
  const showPublisherLogo = Boolean(publisher && hasPublisherLogo(publisher))
  const github = useMemo(() => resolveSkillGithubUrl(skill.id), [skill.id])
  const githubLabel = github.kind === 'upstream' ? t.skill.githubUpstream : t.skill.githubMirror
  const copyContent = useMemo(
    () => fileContent ?? buildSkillMarkdown(skill, lang),
    [fileContent, skill, lang],
  )
  const copied = copiedKey === skill.id
  const handleCopy = () =>
    copySkill({
      id: skill.id,
      lang,
      announceMsg: t.skill.copied,
      fallback: skill,
      fileContent,
    })

  return (
    <PageShell className="pt-6 pb-20">
      {/* Fil d'ariane */}
      <nav className="mb-[26px] flex items-center gap-2 text-[13px] text-[var(--text-3)]" aria-label={t.a11y.breadcrumb}>
        <Link to="/skills" className="cursor-pointer text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
          {t.skill.back}
        </Link>
        <Icon name="caret-right" size={12} />
        <span className={`text-[var(--text-2)] ${skillLabel(skill) === skill.id ? 'font-mono' : ''}`} aria-current="page">
          {skillLabel(skill)}
        </span>
      </nav>

      {/* En-tête */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-[22px]">
          <div
            className={`grid h-16 w-16 flex-none place-items-center ${
              showPublisherLogo ? '' : 'rounded-2xl'
            }`}
            style={showPublisherLogo ? undefined : { background: tint, color }}
          >
            {showPublisherLogo && publisher ? (
              <PublisherLogo name={publisher} size={40} />
            ) : (
              <Icon name={skill.icon} bold size={32} />
            )}
          </div>
          <div className="min-w-[240px] flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-[11px] py-1 text-[12px] font-semibold"
              style={{ background: tint, color, borderColor: category ? hexToRgba(category.color, 0.3) : 'var(--border)' }}
            >
              <Icon name={category?.icon ?? 'squares-four'} bold size={13} />
              {category ? category.label[lang] : ''}
            </span>
            <SecurityBadge
              score={skill.score}
              recommendation={skill.securityRecommendation}
              size="md"
              labels={{
                unscanned: t.skills.securityUnscanned,
                safe: t.skills.securitySafe,
                caution: t.skills.securityCaution,
                unsafe: t.skills.securityUnsafe,
                score: t.skills.securityScore,
              }}
            />
            {skill.score != null ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 font-mono text-[12px] font-semibold tabular-nums text-[var(--text-1)]">
                <Icon name="shield-check" bold size={12} className="text-[var(--accent)]" />
                {skill.score}/100
              </span>
            ) : null}
          </div>
          <h1 className={`mb-3 break-words text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] ${skillLabel(skill) === skill.id ? 'font-mono' : ''}`}>
            {skillLabel(skill)}
          </h1>
          <p className="mb-[18px] max-w-[640px] text-[16px] text-[var(--text-2)]">{skill.tag[lang]}</p>
          <div className="mb-4">
            <a
              href={github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
            >
              <Icon name="arrow-square-out" size={14} />
              <span>{githubLabel}</span>
              {github.repo ? (
                <span className="font-mono text-[11px] text-[var(--text-3)]">{github.repo}</span>
              ) : null}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <Button variant="primary" size="lg" copied={copied} onClick={handleCopy}>
              <Icon name={copied ? 'check' : 'copy'} size={16} />
              {copied ? t.skill.copied : t.skill.copy}
            </Button>
            <span className="max-w-[260px] text-[13px] text-[var(--text-3)]">{t.skill.ctaHint}</span>
          </div>
          <SkillInstallButtons
            skillId={skill.id}
            score={skill.score}
            agents={skill.compat}
            lang={lang}
            t={{
              installTitle: t.skill.installTitle,
              install: t.skill.install,
              installed: t.skill.installed,
              installWarn: t.skill.installWarn,
              installConfirm: t.skill.installConfirm,
              installConfirmYes: t.skill.installConfirmYes,
              installConfirmNo: t.skill.installConfirmNo,
              errors: t.skill.installErrors,
            }}
          />
          </div>
        </div>
        <CliCommandBar
          args={`install ${skill.id}`}
          copyLabel={t.skill.copyCommand}
          copiedLabel={t.skill.copiedCommand}
          className="w-full shrink-0 lg:mt-1 lg:max-w-[440px]"
        />
      </div>

      {/* Prompt */}
      <div className="mt-[30px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-[18px] py-[13px]">
          <div className="flex items-center gap-2.5 font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-3)]">
            <Icon name="cursor-text" bold size={14} className="text-[var(--accent)]" />
            {t.skill.promptTitle}
          </div>
          <Button variant="copy" size="sm" copied={copied} onClick={handleCopy}>
            <Icon name={copied ? 'check' : 'copy'} size={14} />
            {copied ? t.skill.copied : t.skill.copy}
          </Button>
        </div>
        <div className="px-5 py-[18px]">
          <pre
            tabIndex={0}
            className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-[12.5px] leading-[1.65] text-[var(--text-1)]"
          >
            {copyContent}
          </pre>
        </div>
        <div className="px-5 pb-4 text-[12.5px] text-[var(--text-3)]">{t.skill.promptHint}</div>
      </div>

      {/* Corps : détails + méta */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <section className="mb-[34px]">
            <h2 className="mb-4 font-display text-[19px] font-semibold">
              {t.skill.doesTitle(skillLabel(skill))}
            </h2>
            <div className="flex flex-col gap-[11px]">
              {skill.does[lang].map((text) => (
                <div key={text} className="flex items-start gap-[11px]">
                  <Icon name="check-circle" bold size={18} className="mt-px flex-none text-[var(--accent)]" />
                  <span className="text-[14.5px] text-[var(--text-1)]">{text}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-[34px]">
            <h2 className="mb-4 font-display text-[19px] font-semibold">
              {t.skill.howTitle(skillLabel(skill))}
            </h2>
            <div className="flex flex-col gap-3.5">
              {t.skill.how.map((h, i) => (
                <div key={h.t} className="flex items-start gap-3.5">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[var(--accent-soft)] font-mono text-[13px] font-semibold text-[var(--accent)]">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <div className="mb-0.5 text-[14.5px] font-semibold text-[var(--text-1)]">{h.t}</div>
                    <div className="text-[13.5px] text-[var(--text-2)]">{h.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[19px] font-semibold">
              {t.skill.triggersTitle(skillLabel(skill))}
            </h2>
            <p className="mb-3.5 text-[13.5px] text-[var(--text-2)]">{t.skill.triggersHint}</p>
            <div className="flex flex-col gap-2.5">
              {skill.triggers[lang].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-[11px] rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5"
                >
                  <Icon name="quotes" size={15} className="text-[var(--text-3)]" />
                  <span className="text-[14px] text-[var(--text-1)]">{text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[78px]">
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow-card)]">
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
                {t.skill.securityTitle}
              </div>
              <Icon name="shield-check" bold size={14} className="text-[var(--accent)]" />
            </div>
            {skill.score == null || !skill.securityReport ? (
              <div className="rounded-xl border border-dashed border-[var(--border-2)] bg-[var(--surface-2)] px-3.5 py-4 text-center">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-[var(--surface)] text-[var(--text-3)]">
                  <Icon name="shield" bold size={18} />
                </div>
                <p className="text-[13px] text-[var(--text-2)]">{t.skill.securityUnscanned}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface)] font-mono text-[20px] font-bold tabular-nums text-[var(--text-1)] shadow-[var(--shadow-card)]">
                    {skill.score}
                  </div>
                  <div className="min-w-0 flex-1">
                    <SecurityBadge
                      score={skill.score}
                      recommendation={skill.securityRecommendation}
                      size="md"
                      labels={{
                        unscanned: t.skills.securityUnscanned,
                        safe: t.skills.securitySafe,
                        caution: t.skills.securityCaution,
                        unsafe: t.skills.securityUnsafe,
                        score: t.skills.securityScore,
                      }}
                    />
                    <div className="mt-1 text-[11.5px] text-[var(--text-3)]">/ 100</div>
                  </div>
                  <a
                    href="https://github.com/NVIDIA/SkillSpector"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t.skill.securityNvidiaHint}
                    aria-label={t.skill.securityNvidiaHint}
                    className="ml-auto grid shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 transition-colors hover:border-[var(--border-2)]"
                  >
                    <NvidiaLogo size={26} title="NVIDIA" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="rounded-lg border border-[var(--border)] px-2.5 py-2">
                    <div className="text-[var(--text-3)]">{t.skill.securityRisk}</div>
                    <div className="font-mono font-semibold text-[var(--text-1)]">
                      {skill.securityReport.riskScore}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] px-2.5 py-2">
                    <div className="text-[var(--text-3)]">{t.skill.securityMode}</div>
                    <div className="font-mono font-semibold text-[var(--text-1)]">
                      {skill.securityReport.scanMode}
                    </div>
                  </div>
                </div>
                {skill.scannedAt ? (
                  <div className="text-[11.5px] text-[var(--text-3)]">
                    {t.skill.securityScannedAt}:{' '}
                    <time dateTime={skill.scannedAt}>
                      {new Date(skill.scannedAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                    </time>
                  </div>
                ) : null}
                <div>
                  <div className="mb-1.5 text-[12px] text-[var(--text-3)]">{t.skill.securityIssues}</div>
                  {skill.securityReport.issues.length === 0 ? (
                    <p className="text-[13px] text-[var(--text-2)]">{t.skill.securityNone}</p>
                  ) : (
                    <ul className="flex max-h-[280px] flex-col gap-2 overflow-auto">
                      {skill.securityReport.issues.slice(0, 8).map((issue) => (
                        <li
                          key={`${issue.id}-${issue.finding ?? issue.pattern}`}
                          className="rounded-lg border border-[var(--border)] px-2.5 py-2"
                        >
                          <div className="mb-0.5 flex items-center gap-1.5 font-mono text-[11px] font-semibold">
                            <span>{issue.severity}</span>
                            <span className="text-[var(--text-3)]">·</span>
                            <span className="truncate text-[var(--text-2)]">{issue.category}</span>
                          </div>
                          <div className="text-[12.5px] leading-[1.4] text-[var(--text-1)]">
                            {issue.explanation ?? issue.finding ?? issue.pattern}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow-card)]">
            <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skill.metaTitle}
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <div className="mb-1.5 text-[12px] text-[var(--text-3)]">{t.skill.githubSource}</div>
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 text-[13px] font-medium text-[var(--link)] transition-colors hover:text-[var(--link-hover)]"
                >
                  <Icon name="arrow-square-out" size={14} className="shrink-0" />
                  <span className="truncate">{github.repo ?? githubLabel}</span>
                </a>
              </div>
              <div>
                <div className="mb-1.5 text-[12px] text-[var(--text-3)]">{t.skill.compat}</div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.compat.map((name) => (
                    <AgentBadge key={name} agent={name} size={15} />
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[12px] text-[var(--text-3)]">{t.skill.tech}</div>
                <div className="flex flex-wrap gap-1.5">
                  {skill.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-[var(--border)] px-2 py-[3px] font-mono text-[11px] text-[var(--text-2)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              block
              copied={copied}
              className="mt-[18px]"
              onClick={handleCopy}
            >
              <Icon name={copied ? 'check' : 'copy'} size={15} />
              {copied ? t.skill.copied : t.skill.copy}
            </Button>
          </div>

          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[18px]">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skill.insideTitle}
            </div>
            <div className="flex flex-col gap-2.5">
              {t.skill.inside.map((text) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon name="file-text" size={15} className="mt-px text-[var(--text-3)]" />
                  <span className="text-[13px] text-[var(--text-2)]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Skills liés */}
      <section className="mt-12">
        <h2 className="mb-4 font-display text-[18px] font-semibold">
          {t.skill.related(skillLabel(skill))}
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3">
          {related.map((r) => {
            const rcColor =
              r.categoryId === skill.categoryId ? category?.color : undefined
            return (
              <Link
                key={r.id}
                to="/skills/$id"
                params={{ id: r.id }}
                className="flex cursor-pointer flex-col gap-2.5 rounded-[13px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-2)]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-[34px] w-[34px] place-items-center rounded-[9px]"
                    style={{
                      background: rcColor ? hexToRgba(rcColor, 0.14) : 'var(--surface-2)',
                      color: rcColor ?? 'var(--text-3)',
                    }}
                  >
                    <Icon name={r.icon} bold size={17} />
                  </span>
                  <span className={`truncate text-[13px] font-semibold text-[var(--text-1)] ${skillLabel(r) === r.id ? 'font-mono' : ''}`}>{skillLabel(r)}</span>
                </div>
                <span className="line-clamp-2 text-[12.5px] leading-[1.45] text-[var(--text-2)]">{r.tag[lang]}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </PageShell>
  )
}
