import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import Icon from '#/components/Icon'
import LangSwitch from '#/components/LangSwitch'
import ThemeToggle from '#/components/ThemeToggle'
import { AgentLogoRow } from '#/components/AgentLogo'
import { COMPAT_ORDER } from '#/lib/catalog'
import { useI18n } from '#/lib/i18n'
import { login, register } from '#/server/auth.functions'
import { seoHead } from '#/lib/seo'

type AuthMode = 'login' | 'signup'

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === 'signup' ? 'signup' : ('login' as AuthMode),
    redirect: typeof search.redirect === 'string' && search.redirect.startsWith('/') ? search.redirect : '/',
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.user) {
      throw redirect({ href: search.redirect })
    }
  },
  head: () =>
    seoHead({
      title: 'Connexion',
      path: '/auth',
      description: 'Connexion et inscription Arboris.',
      noIndex: true,
    }),
  component: AuthPage,
})

const fieldClass =
  'h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[14.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]'

function AuthPage() {
  const { mode, redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const { t } = useI18n()
  const loginFn = useServerFn(login)
  const registerFn = useServerFn(register)
  const a = t.auth
  const a11y = t.a11y

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  const setMode = (next: AuthMode) => {
    navigate({ to: '/auth', search: { mode: next, redirect: redirectTo }, replace: true })
    setError(null)
    setNotice(null)
  }

  const mapError = (code: string) =>
    a.errors[code as keyof typeof a.errors] ?? a.errors.generic

  const finishAuth = async () => {
    await router.invalidate()
    await navigate({ to: redirectTo })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const payload = { email, password, redirect: redirectTo }
      const result = isSignup
        ? await registerFn({ data: { ...payload, name } })
        : await loginFn({ data: payload })

      if (result && 'ok' in result && result.ok) {
        await finishAuth()
      } else if (result && 'error' in result) {
        setError(mapError(result.error))
      }
    } catch {
      setError(a.errors.generic)
    } finally {
      setLoading(false)
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 cursor-pointer rounded-lg border-0 px-2 py-2.5 text-[13.5px] font-semibold transition-colors ${
      active
        ? 'bg-[var(--surface)] text-[var(--text-1)] shadow-[var(--shadow-card)]'
        : 'bg-transparent text-[var(--text-2)]'
    }`

  return (
    <div className="grid min-h-screen bg-[var(--bg)] text-[var(--text-1)] lg:grid-cols-[1.05fr_1fr]">
      <a href="#main-content" className="skip-link">
        {a11y.skipToContent}
      </a>
      {/* Panneau marque */}
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-[var(--border)] bg-[var(--surface-2)] p-10 lg:border-b-0 lg:border-r [background-image:radial-gradient(560px_300px_at_12%_6%,var(--accent-soft),transparent_62%)]">
        <Link to="/" className="flex cursor-pointer items-center gap-2.5 text-[var(--text-1)]">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-[var(--accent)] text-white">
            <Icon name="tree" bold size={19} />
          </span>
          <span className="font-mono text-[18px] font-semibold tracking-tight">{t.nav.brand}</span>
        </Link>

        <div className="my-10 max-w-[400px] lg:my-0">
          <h2 className="mb-4 font-display text-[30px] font-semibold leading-[1.14] tracking-[-0.02em]">
            {a.brandTitle}
          </h2>
          <div className="flex flex-col gap-3.5">
            {a.perks.map((p) => (
              <div key={p.text} className="flex items-start gap-2.5">
                <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-[7px] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon name={p.icon} bold size={15} />
                </span>
                <span className="pt-0.5 text-[14.5px] text-[var(--text-2)]">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11.5px] text-[var(--text-3)]">
          <span className="h-[7px] w-[7px] rounded-full bg-[var(--accent)]" />
          <span>{a.footNote}</span>
          <AgentLogoRow agents={COMPAT_ORDER} size={14} />
        </div>
      </aside>

      {/* Formulaire */}
      <main id="main-content" className="relative flex flex-col px-6 py-6 sm:px-8">
        <div className="flex items-center justify-end gap-2.5">
          <LangSwitch />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[392px]">
            <h1 className="mb-1.5 font-display text-[26px] font-semibold tracking-[-0.02em]">
              {isSignup ? a.signupTitle : a.loginTitle}
            </h1>
            <p className="mb-6 text-[14.5px] text-[var(--text-2)]">
              {isSignup ? a.signupSub : a.loginSub}
            </p>

            <div
              className="mb-5 flex gap-1 rounded-[11px] border border-[var(--border)] bg-[var(--surface-2)] p-1"
              role="tablist"
              aria-label={a11y.authTabs}
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={tabClass(!isSignup)}
                onClick={() => setMode('login')}
              >
                {a.tabLogin}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={tabClass(isSignup)}
                onClick={() => setMode('signup')}
              >
                {a.tabSignup}
              </button>
            </div>

            {(error || notice) && (
              <div
                role={error ? 'alert' : 'status'}
                aria-live={error ? 'assertive' : 'polite'}
                className={`mb-4 rounded-[10px] border px-3.5 py-2.5 text-[13px] ${
                  error
                    ? 'border-red-500/30 bg-red-500/10 text-red-300'
                    : 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                }`}
              >
                {error ?? notice}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
              {isSignup && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{a.name}</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={a.namePh}
                    className={fieldClass}
                    autoComplete="name"
                  />
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{a.email}</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className={fieldClass}
                  autoComplete="email"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{a.password}</span>
                  {!isSignup && (
                    <span className="text-[12px] text-[var(--accent)]">{a.forgot}</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`${fieldClass} pr-10`}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                    minLength={isSignup ? 8 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center border-0 bg-transparent text-[var(--text-3)]"
                    aria-label={showPw ? a11y.hidePassword : a11y.showPassword}
                  >
                    <Icon name={showPw ? 'eye-slash' : 'eye'} size={17} />
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="mt-1 flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[11px] border-0 bg-[var(--accent)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--accent-press)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? a.loading : isSignup ? a.signupSubmit : a.loginSubmit}
                {!loading && <Icon name="arrow-right" bold size={16} className="!text-white" />}
              </button>
            </form>

            <p className="mt-5 text-center text-[13.5px] text-[var(--text-2)]">
              {isSignup ? a.toLogin : a.toSignup}{' '}
              <button
                type="button"
                onClick={() => setMode(isSignup ? 'login' : 'signup')}
                className="cursor-pointer border-0 bg-transparent font-semibold text-[var(--accent)]"
              >
                {isSignup ? a.toLoginLink : a.toSignupLink}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
