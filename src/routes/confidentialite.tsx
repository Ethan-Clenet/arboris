import { createFileRoute, Link } from '@tanstack/react-router'
import LegalLayout, { LegalLink, LegalList, LegalSection } from '#/components/LegalLayout'
import { seoHead, webPageJsonLd } from '#/lib/seo'
import {
  CONTACT_EMAIL,
  EDITOR_NAME,
  HOST_NAME,
  HOST_PRIVACY_URL,
  LEGAL_UPDATED,
  SITE_NAME,
} from '#/lib/site'

const TITLE = 'Politique de confidentialité'
const DESCRIPTION =
  'Politique de confidentialité RGPD d’Arboris : responsable du traitement, logs Vercel, mesure d’audience, droits et cookies.'

export const Route = createFileRoute('/confidentialite')({
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
      lead={`Cette page décrit les traitements de données réellement mis en œuvre par ${SITE_NAME}, tel que le code de l’application le permet de constater.`}
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
          La base PostgreSQL (Neon) stocke le catalogue (skills, collections, scores de sûreté,
          contenus Markdown). Elle ne contient pas de profil visiteur, d’adresse e-mail d’utilisateur
          ni d’historique de navigation individuelle.
        </p>
      </LegalSection>

      <LegalSection title="Préférences enregistrées dans le navigateur">
        <p>
          Le site enregistre localement, dans le <code className="font-mono text-[13.5px]">localStorage</code>{' '}
          du navigateur, deux préférences demandées par l’utilisateur :
        </p>
        <LegalList>
          <li>
            <code className="font-mono text-[13.5px]">sp-theme</code> : thème clair ou sombre
          </li>
          <li>
            <code className="font-mono text-[13.5px]">sp-lang</code> : langue d’interface (français
            ou anglais)
          </li>
        </LegalList>
        <p>
          Ces données restent sur l’appareil, ne sont pas transmises au serveur et peuvent être
          effacées en vidant les données du site. Elles sont strictement nécessaires au service
          demandé (affichage et langue).
        </p>
      </LegalSection>

      <LegalSection title="Mesure d’audience (Vercel Web Analytics)">
        <p>
          L’application charge le module <code className="font-mono text-[13.5px]">@vercel/analytics</code>{' '}
          sur toutes les pages. Vercel Web Analytics sert à connaître, de façon agrégée, les pages
          consultées (mesure d’audience). Selon la documentation Vercel, ce service est conçu pour
          fonctionner sans cookie de tracking.
        </p>
        <p>
          Les informations typiquement associées à ce type de mesure portent sur la page vue et un
          contexte de visite agrégé (et non sur une identité nominative collectée par {SITE_NAME}).
          Le traitement est effectué par {HOST_NAME}, en qualité de sous-traitant / prestataire
          d’hébergement et d’analytics.
        </p>
      </LegalSection>

      <LegalSection title="Mesure de performance (Vercel Speed Insights)">
        <p>
          L’application charge également{' '}
          <code className="font-mono text-[13.5px]">@vercel/speed-insights</code>. Speed Insights
          mesure les indicateurs de performance réels (Core Web Vitals : LCP, INP, CLS, FCP, TTFB,
          notamment) pour la page visitée, avec un contexte technique (chemin, type de connexion).
        </p>
        <p>
          Arboris n’écrit pas de cookie first-party pour ce service dans son code. Vercel peut
          associer les métriques à un identifiant technique côté serveur afin d’agréger les mesures.
          Les données sont transmises aux infrastructures Vercel (script chargé depuis le domaine
          Vercel prévu à cet effet).
        </p>
      </LegalSection>

      <LegalSection title="Journaux d’hébergement">
        <p>
          Comme tout site web, l’hébergeur ({HOST_NAME}) enregistre des journaux techniques de
          requête, qui peuvent inclure l’adresse IP, la date et l’heure, l’URL demandée et
          l’identifiant du navigateur (user-agent). Ces journaux servent à la sécurité, au
          diagnostic et au fonctionnement du service, sur le fondement de l’intérêt légitime de
          l’éditeur (art. 6, 1, f du RGPD).
        </p>
        <p>
          Leur durée de conservation suit la politique d’{HOST_NAME}. Voir{' '}
          <LegalLink href={HOST_PRIVACY_URL}>la politique de confidentialité de Vercel</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Autres traitements techniques">
        <p>
          Certaines actions (copie d’un skill, génération d’un ZIP, limitation de débit) sont
          traitées par le serveur d’{SITE_NAME} sans créer de compte. Le limiteur de débit
          applicatif fonctionne en mémoire, par type d’action, et ne constitue pas un fichier
          d’identification des visiteurs. L’installation « workspace » (écriture de fichiers sur
          un disque local) n’est disponible que lorsque l’instance est configurée à cette fin ; ce
          n’est pas un compte visiteur du site public.
        </p>
        <p>
          Les polices (Space Grotesk, Hanken Grotesk, JetBrains Mono) et les icônes sont servies
          depuis le site lui-même. Aucune webfont Google ni iframe tierce n’est embarquée.
        </p>
      </LegalSection>

      <LegalSection title="Transferts hors de l’Union européenne">
        <p>
          {HOST_NAME} est une société établie aux États-Unis. L’hébergement, les journaux, Web
          Analytics et Speed Insights peuvent donc impliquer un transfert de données hors de l’UE.
          Vercel indique être certifiée au titre du EU-U.S. Data Privacy Framework et recourir à
          des clauses contractuelles types. Le détail figure dans{' '}
          <LegalLink href={HOST_PRIVACY_URL}>sa politique de confidentialité</LegalLink>.
        </p>
        <p>
          La base de données catalogue est hébergée chez Neon (PostgreSQL). Neon est également un
          prestataire susceptible d’opérer hors UE ; aucun fichier visiteur n’y est stocké.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement,
          d’opposition et de limitation, dans les conditions prévues par la loi. Pour les exercer,
          écrivez à <LegalLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalLink> en
          précisant l’objet de la demande. {SITE_NAME} ne tenant pas de compte utilisateur, les
          demandes portent principalement sur les éventuelles traces techniques détenues par
          l’hébergeur ou sur un contenu du catalogue (correction / retrait).
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
          préalable (publicité, personnalisation non essentielle, réseaux sociaux). Les seules
          préférences locales (thème, langue) sont stockées dans le navigateur à la demande de
          l’utilisateur. Les scripts Vercel Web Analytics et Speed Insights sont présentés par
          Vercel comme des mesures d’audience et de performance sans cookie de tracking.
        </p>
        <p>
          En l’état de cet audit, aucun bandeau de consentement n’est affiché. Si un cookie ou un
          identifiant de tracking nécessitant un consentement était ajouté plus tard, cette page
          et le bandeau devraient être mis à jour avant toute collecte.
        </p>
        <p>
          Les{' '}
          <Link
            to="/mentions-legales"
            className="cursor-pointer font-medium text-[var(--text-1)] underline decoration-[var(--border-2)] underline-offset-[3px] transition-colors hover:decoration-[var(--text-2)]"
          >
            mentions légales
          </Link>{' '}
          décrivent l’éditeur, l’hébergeur et les droits sur le catalogue.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
