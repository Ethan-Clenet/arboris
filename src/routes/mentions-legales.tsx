import { createFileRoute, Link } from '@tanstack/react-router'
import LegalLayout, { LegalLink, LegalList, LegalSection } from '#/components/LegalLayout'
import { seoHead, webPageJsonLd } from '#/lib/seo'
import {
  CONTACT_EMAIL,
  EDITOR_NAME,
  HOST_ADDRESS,
  HOST_NAME,
  HOST_URL,
  LEGAL_UPDATED,
  SITE_NAME,
  SITE_URL,
} from '#/lib/site'

const TITLE = 'Mentions légales du site'
const DESCRIPTION =
  'Éditeur, hébergeur et propriété intellectuelle d’Arboris, catalogue de skills IA publié par Ethan Clenet.'

export const Route = createFileRoute('/mentions-legales')({
  head: () =>
    seoHead({
      title: TITLE,
      path: '/mentions-legales',
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Mentions légales', path: '/mentions-legales' },
      ],
      jsonLd: webPageJsonLd({
        path: '/mentions-legales',
        name: 'Mentions légales',
        description: DESCRIPTION,
        dateModified: LEGAL_UPDATED,
      }),
    }),
  component: MentionsLegalesPage,
})

export function MentionsLegalesPage() {
  return (
    <LegalLayout
      eyebrow="Informations légales"
      icon="info"
      title="Mentions légales"
      lead={`${SITE_NAME} est un catalogue public de skills et de slash commands pour agents IA, publié à titre non professionnel.`}
      currentPath="/mentions-legales"
    >
      <LegalSection title="Éditeur du site">
        <p>
          Conformément à l’article 6, III de la loi n° 2004-575 du 21 juin 2004 pour la confiance
          dans l’économie numérique (LCEN), l’éditeur et le directeur de la publication du site{' '}
          {SITE_NAME} ({SITE_URL.replace(/^https:\/\//, '')}) est :
        </p>
        <LegalList>
          <li>
            <strong className="font-medium text-[var(--text-1)]">{EDITOR_NAME}</strong>, particulier,
            agissant à titre non professionnel
          </li>
          <li>
            Contact : <LegalLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalLink>
          </li>
        </LegalList>
        <p>
          En tant que personne physique non professionnelle, son adresse personnelle et son numéro
          de téléphone ont été communiqués à l’hébergeur et ne sont pas publiés sur le site, conformément
          à l’article 6, III de la LCEN.
        </p>
      </LegalSection>

      <LegalSection title="Hébergeur">
        <p>Le site est hébergé par :</p>
        <LegalList>
          <li>
            <strong className="font-medium text-[var(--text-1)]">{HOST_NAME}</strong>
          </li>
          <li>{HOST_ADDRESS}</li>
          <li>
            Site : <LegalLink href={HOST_URL}>{HOST_URL}</LegalLink>
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Nom de domaine">
        <p>
          Le nom de domaine <strong className="font-medium text-[var(--text-1)]">arboristhree.xyz</strong>{' '}
          est utilisé comme domaine personnalisé du projet {SITE_NAME} déployé sur Vercel. Le
          présent avis ne désigne pas de bureau d’enregistrement au-delà de cet usage via Vercel.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          La structure du site, sa charte graphique, ses textes de présentation et les éléments
          originaux d’{SITE_NAME} (marque, interface, CLI) sont la propriété de {EDITOR_NAME}, sauf
          mention contraire.
        </p>
        <p>
          {SITE_NAME} est un catalogue agrégé : les skills, commandes, noms, logos, dépôts et
          contenus listés appartiennent à leurs titulaires respectifs. Chaque fiche renvoie vers la
          source lorsqu’elle est connue (dépôt GitHub, site de l’éditeur, etc.). Leur présence dans
          le catalogue n’implique aucune cession de droits, ni partenariat, ni aval de la part des
          ayants droit.
        </p>
        <p>
          Les scores de sûreté affichés sur certaines fiches sont produits par l’outil{' '}
          <LegalLink href="https://github.com/NVIDIA/SkillSpector">SkillSpector</LegalLink> (NVIDIA),
          à partir d’une analyse automatisée du contenu du skill. Ils ne constituent pas un audit
          de sécurité contractuel.
        </p>
        <p>
          Tout ayant droit qui souhaite une correction, une mise à jour ou un retrait d’un élément
          du catalogue peut en faire la demande à{' '}
          <LegalLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          {SITE_NAME} est proposé « en l’état », à titre d’information et d’outillage. {EDITOR_NAME}{' '}
          s’efforce de tenir le catalogue à jour mais ne garantit ni l’exhaustivité, ni l’exactitude,
          ni la sécurité des skills et commandes issus de tiers. L’installation et l’exécution d’un
          skill dans un agent IA restent sous la responsabilité de l’utilisateur.
        </p>
        <p>
          Les liens vers des sites ou dépôts externes n’engagent pas l’éditeur quant à leur contenu
          ou à leurs pratiques.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données à caractère personnel est décrit dans la{' '}
          <Link
            to="/confidentialite"
            className="cursor-pointer font-medium text-[var(--text-1)] underline decoration-[var(--border-2)] underline-offset-[3px] transition-colors hover:decoration-[var(--text-2)]"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
