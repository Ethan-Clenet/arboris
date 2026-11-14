import { createFileRoute, Link } from '@tanstack/react-router'
import AnalyticsOptOut from '#/components/AnalyticsOptOut'
import LegalLayout, { LegalLink, LegalList, LegalSection } from '#/components/LegalLayout'
import { seoHead, webPageJsonLd } from '#/lib/seo'
import { publicHtmlCacheHeaders } from '#/lib/http-cache'
import {
  CONTACT_EMAIL,
  DB_HOST_ADDRESS,
  DB_HOST_NAME,
  DB_HOST_PRIVACY_URL,
  EDITOR_NAME,
  HOST_ANALYTICS_PRICING_URL,
  HOST_ANALYTICS_PRIVACY_URL,
  HOST_LOGS_URL,
  HOST_NAME,
  HOST_PRIVACY_URL,
  LEGAL_UPDATED,
  SITE_NAME,
} from '#/lib/site'

const TITLE = 'Politique de confidentialité'
const DESCRIPTION =
  'Politique de confidentialité RGPD d’Arboris : bases légales, durées de conservation, opt-out d’audience et droits.'

export const Route = createFileRoute('/confidentialite')({
  headers: publicHtmlCacheHeaders,
  head: () =>
    seoHead({
      title: TITLE,
      path: '/confidentialite',
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Confidentialité', path: '/confidentialite' },
      ],
      jsonLd: webPageJsonLd({
        path: '/confidentialite',
        name: 'Confidentialité',
        description: DESCRIPTION,
        dateModified: LEGAL_UPDATED,
      }),
    }),
  component: ConfidentialitePage,
})

export function ConfidentialitePage() {
  return (
    <LegalLayout
      eyebrow="RGPD"
      icon="lock-key"
      title="Confidentialité"
      lead={`Cette page décrit les traitements de données mis en œuvre sur ${SITE_NAME} : ce qui est collecté, sur quelle base, pour combien de temps, et comment s’y opposer.`}
      currentPath="/confidentialite"
    >
      <LegalSection title="Responsable du traitement">
        <p>
          Le responsable du traitement est{' '}
          <strong className="font-medium text-[var(--text-1)]">{EDITOR_NAME}</strong>, éditeur
          d’{SITE_NAME}, joignable à{' '}
          <LegalLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Ce que le site ne fait pas">
        <p>{SITE_NAME} ne propose pas, à la date de cette page :</p>
        <LegalList>
          <li>de compte utilisateur, d’inscription ou d’authentification visiteur</li>
          <li>de formulaire de contact, de commentaire ou d’espace membre</li>
          <li>de newsletter ou d’envoi d’e-mails marketing</li>
          <li>de publicité, de pixel de réseau social ou de traceur publicitaire</li>
          <li>d’appel, depuis le navigateur, à une API tierce autre que l’origine du site</li>
        </LegalList>
        <p>
          La base PostgreSQL ({DB_HOST_NAME}) stocke le catalogue (skills, collections, scores de
          sûreté, contenus Markdown). Elle ne contient pas de profil visiteur, d’adresse e-mail
          d’utilisateur ni d’historique de navigation individuelle.
        </p>
      </LegalSection>

      <LegalSection title="Préférences enregistrées dans le navigateur">
        <p>
          Le site enregistre localement, dans le <code className="font-mono text-[13.5px]">localStorage</code>{' '}
          du navigateur :
        </p>
        <LegalList>
          <li>
            <code className="font-mono text-[13.5px]">sp-theme</code> : thème clair ou sombre
          </li>
          <li>
            <code className="font-mono text-[13.5px]">sp-lang</code> : langue d’interface (français
            ou anglais)
          </li>
          <li>
            <code className="font-mono text-[13.5px]">va-disable</code> : refus de la mesure
            d’audience et de performance, si vous l’activez ci-dessous
          </li>
        </LegalList>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Base légale :</strong> intérêt
          légitime (art. 6, 1, f du RGPD) pour mémoriser un choix d’affichage déjà exprimé, et
          consentement (art. 6, 1, a) pour l’opt-out de mesure. Ces clés ne quittent pas l’appareil.
        </p>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Durée :</strong> jusqu’à ce que vous
          vidiez les données du site ou changiez la préférence. Aucune copie n’est conservée côté
          serveur.
        </p>
      </LegalSection>

      <LegalSection title="Mesure d’audience (Vercel Web Analytics)">
        <p>
          L’application charge le module <code className="font-mono text-[13.5px]">@vercel/analytics</code>{' '}
          sur toutes les pages. Le script est servi en first-party depuis ce site
          (<code className="font-mono text-[13.5px]">/_vercel/insights/script.js</code>), pas depuis
          un domaine Vercel tiers.
        </p>
        <p>
          Selon la{' '}
          <LegalLink href={HOST_ANALYTICS_PRIVACY_URL}>
            documentation Privacy de Vercel Web Analytics
          </LegalLink>
          , les visiteurs sont identifiés par un hachage dérivé de la requête, sans cookie de
          tracking. Ce hachage de session n’est pas stocké de façon permanente : il est écarté au
          bout de 24 heures. Les points de données (horodatage, URL, referrer filtré, géolocalisation
          approximative, OS, navigateur, type d’appareil) servent à des statistiques agrégées.
        </p>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Base légale :</strong> intérêt
          légitime (art. 6, 1, f du RGPD) de l’éditeur à mesurer l’audience du catalogue pour
          améliorer le service, sans suivi inter-sites ni profil publicitaire. La mise en balance :
          données agrégées, pas de cookie, script first-party, et possibilité de s’opposer en un
          clic.
        </p>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Durée :</strong> la fenêtre de
          reporting documentée par Vercel est de 1 mois (plan Hobby), 12 mois (Pro) ou 24 mois (Plus
          / Enterprise). Vercel indique que seule cette fenêtre est garantie, et qu’il peut
          conserver les données plus longtemps en cas de changement de plan (
          <LegalLink href={HOST_ANALYTICS_PRICING_URL}>tarifs Web Analytics</LegalLink>). Le plan
          exact du projet n’est pas affiché sur le site public.
        </p>
      </LegalSection>

      <LegalSection title="Mesure de performance (Vercel Speed Insights)">
        <p>
          L’application charge{' '}
          <code className="font-mono text-[13.5px]">@vercel/speed-insights</code>. Le script est
          servi en first-party (
          <code className="font-mono text-[13.5px]">/_vercel/speed-insights/script.js</code>). Speed
          Insights mesure les Core Web Vitals (LCP, INP, CLS, FCP, TTFB) pour la page visitée.
        </p>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Base légale :</strong> intérêt
          légitime (art. 6, 1, f) — diagnostiquer la performance réelle du site. Même mise en
          balance que pour l’audience, avec le même opt-out.
        </p>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Durée :</strong> Vercel ne publie pas,
          dans sa documentation Speed Insights, une durée de conservation unique comparable à la
          fenêtre de reporting Web Analytics. Nous ne l’inventons pas. Le traitement suit la
          politique de {HOST_NAME} (
          <LegalLink href={HOST_PRIVACY_URL}>politique de confidentialité Vercel</LegalLink>).
        </p>
      </LegalSection>

      <LegalSection title="Ne pas être mesuré">
        <p>
          Vous pouvez refuser Web Analytics et Speed Insights sur cet appareil. Le bouton pose{' '}
          <code className="font-mono text-[13.5px]">localStorage.va-disable</code> ; le site transmet
          alors <code className="font-mono text-[13.5px]">beforeSend</code> qui abandonne l’événement
          (comportement documenté par Vercel pour Analytics et Speed Insights).
        </p>
        <AnalyticsOptOut />
      </LegalSection>

      <LegalSection title="Journaux d’hébergement">
        <p>
          L’hébergeur ({HOST_NAME}) enregistre des journaux techniques de requête (adresse IP, date,
          URL, user-agent) pour la sécurité, le diagnostic et le fonctionnement du service.
        </p>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Base légale :</strong> intérêt
          légitime (art. 6, 1, f du RGPD) — assurer la sécurité et la disponibilité du site.
        </p>
        <p>
          <strong className="font-medium text-[var(--text-1)]">Durée :</strong> la conservation des
          journaux d’exécution (runtime logs) documentée par Vercel est de 1 heure (Hobby), 1 jour
          (Pro) ou 3 jours (Enterprise) ; 30 jours avec l’option Observability Plus (
          <LegalLink href={HOST_LOGS_URL}>Runtime Logs</LegalLink>).
        </p>
      </LegalSection>

      <LegalSection title="Autres traitements techniques">
        <p>
          Certaines actions (copie d’un skill, génération d’un ZIP, limitation de débit) sont
          traitées par le serveur d’{SITE_NAME} sans créer de compte. Le limiteur de débit
          applicatif fonctionne en mémoire, par type d’action, et ne constitue pas un fichier
          d’identification des visiteurs.
        </p>
        <p>
          Les polices et les icônes sont servies depuis le site lui-même. Aucune webfont Google ni
          iframe tierce n’est embarquée.
        </p>
      </LegalSection>

      <LegalSection title="Transferts hors de l’Union européenne">
        <p>
          {HOST_NAME} est établi aux États-Unis. L’hébergement, les journaux, Web Analytics et Speed
          Insights peuvent impliquer un transfert hors UE. Vercel indique être certifiée au titre du
          EU-U.S. Data Privacy Framework et recourir à des clauses contractuelles types. Le détail
          figure dans{' '}
          <LegalLink href={HOST_PRIVACY_URL}>sa politique de confidentialité</LegalLink>.
        </p>
        <p>
          Le catalogue est stocké chez {DB_HOST_NAME}, {DB_HOST_ADDRESS}. Neon fait partie de
          Databricks ; la notice servie par neon.com est celle de Databricks, Inc. (
          <LegalLink href={DB_HOST_PRIVACY_URL}>{DB_HOST_PRIVACY_URL}</LegalLink>
          ). Aucun fichier visiteur n’y est stocké. Les transferts éventuels suivent les mécanismes
          décrits par Databricks (DPF / clauses types, selon leur notice).
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement,
          d’opposition et de limitation. Pour les exercer, écrivez à{' '}
          <LegalLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalLink>. Nous répondons
          dans un délai d’un mois (art. 12, 3 du RGPD), prolongeable de deux mois si la demande est
          complexe ; vous en seriez informé.
        </p>
        <p>
          {SITE_NAME} ne tenant pas de compte utilisateur, les demandes portent principalement sur
          les traces techniques détenues par l’hébergeur ou sur un contenu du catalogue.
        </p>
      </LegalSection>

      <LegalSection title="Directives post-mortem">
        <p>
          Aucune directive particulière relative au sort des données après le décès de l’éditeur
          n’a été déposée auprès d’un tiers de confiance. Vous pouvez indiquer vos souhaits à{' '}
          <LegalLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalLink> (art. 85 de la loi
          Informatique et Libertés). À défaut, les ayants droit s’adressent à l’hébergeur dans les
          conditions légales.
        </p>
      </LegalSection>

      <LegalSection title="Réclamation auprès de la CNIL">
        <p>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous
          pouvez introduire une réclamation auprès de la Commission nationale de l’informatique et
          des libertés (CNIL) :{' '}
          <LegalLink href="https://www.cnil.fr">https://www.cnil.fr</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Pourquoi pas de bandeau cookies">
        <p>
          Le site n’installe pas, dans son code, de cookie ou de traceur soumis à consentement
          préalable (publicité, personnalisation non essentielle, réseaux sociaux). Les préférences
          locales (thème, langue, opt-out) sont stockées dans le navigateur à votre demande. Web
          Analytics et Speed Insights sont présentés par Vercel comme des mesures sans cookie de
          tracking, avec information et opposition ci-dessus.
        </p>
        <p>
          Les{' '}
          <Link
            to="/mentions-legales"
            className="cursor-pointer font-medium text-[var(--text-1)] underline decoration-[var(--border-2)] underline-offset-[3px] transition-colors hover:decoration-[var(--text-2)]"
          >
            mentions légales
          </Link>{' '}
          décrivent l’éditeur, l’hébergeur et le prestataire de stockage.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
