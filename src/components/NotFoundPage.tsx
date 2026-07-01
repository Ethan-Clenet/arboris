import { ButtonLink } from '#/components/Button'
import Icon from '#/components/Icon'
import StatusPage from '#/components/StatusPage'
import { useI18n } from '#/lib/i18n'

export default function NotFoundPage() {
  const { t } = useI18n()

  return (
    <StatusPage
      code="404"
      title={t.errors.notFoundTitle}
      body={t.errors.notFoundBody}
      icon="compass"
    >
      <ButtonLink to="/" variant="primary">
        <Icon name="house" size={15} />
        {t.errors.home}
      </ButtonLink>
      <ButtonLink to="/skills" variant="secondary">
        {t.errors.browseSkills}
      </ButtonLink>
    </StatusPage>
  )
}
