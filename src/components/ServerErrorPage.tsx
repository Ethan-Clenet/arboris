import { useRouter } from '@tanstack/react-router'
import { Button, ButtonLink } from '#/components/Button'
import Icon from '#/components/Icon'
import StatusPage from '#/components/StatusPage'
import { useI18n } from '#/lib/i18n'

export default function ServerErrorPage({ error }: { error: Error; reset: () => void }) {
  const { t } = useI18n()
  const router = useRouter()

  return (
    <>
      <StatusPage
        code="500"
        title={t.errors.serverTitle}
        body={t.errors.serverBody}
        icon="warning-circle"
      >
        <Button variant="primary" onClick={() => router.invalidate()}>
          <Icon name="arrow-clockwise" size={15} />
          {t.errors.retry}
        </Button>
        <ButtonLink to="/" variant="secondary">
          {t.errors.home}
        </ButtonLink>
      </StatusPage>
      {import.meta.env.DEV && error.message ? (
        <div className="page-shell pb-16">
          <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-mono text-[11px] text-[var(--text-3)]">
            {error.message}
          </p>
        </div>
      ) : null}
    </>
  )
}
