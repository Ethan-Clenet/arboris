import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { Lang } from './catalog'

const LANG_KEY = 'sp-lang'

const fr = {
  nav: {
    brand: 'Arboris',
    home: 'Accueil',
    start: 'Premier pas',
    skills: 'Skills',
    theme: 'Thème',
    signIn: 'Connexion',
    signOut: 'Déconnexion',
    account: 'Mon compte',
  },
  home: {
    eyebrow: 'Catalogue de skills IA',
    title: 'Tous tes skills,\nune commande.',
    sub: "Copie le prompt d'un skill et laisse ton agent l'ajouter au codebase. Zéro config.",
    openIndex: "Ouvrir l'index",
    example: 'Voir un exemple',
    worksWith: 'Compatible avec',
    indexTitle: "L'index complet",
    searchPh: 'Filtrer les skills…',
    empty: 'Aucun skill trouvé.',
    term1: 'Prompt copié dans le presse-papiers',
    term2: 'Collé dans ton agent…',
    term3: 'Skill ajouté · application des bonnes pratiques',
    copy: 'Copier',
    copied: 'Copié !',
    footer: "Catalogue de skills prêts à l'emploi pour ton agent IA.",
    browseAll: 'Voir tous les skills',
  },
  skills: {
    kicker: 'Catalogue de skills',
    worksWith: 'Compatible avec',
    title: 'Tous les skills',
    subtitle:
      "Des skills prêts à l'emploi — copie le prompt, ton agent installe la fonctionnalité dans ton projet.",
    searchPh: 'Rechercher un skill, une techno…',
    categories: 'Catégories',
    allCats: 'Toutes les catégories',
    compat: 'Compatibilité',
    tech: 'Technologies',
    clear: 'Effacer les filtres',
    colSkill: 'Skill',
    colDesc: 'Description',
    colTech: 'Techno',
    colCompat: 'Compatibilité',
    copy: 'Copier le prompt',
    copied: 'Copié !',
    detail: 'Voir les détails',
    emptyTitle: 'Aucun skill trouvé',
    emptyBody: "Essaie d'élargir ta recherche ou d'effacer les filtres.",
    scoreHint: 'Score de qualité du skill (0–100).',
    resOne: 'skill',
    resMany: 'skills',
    resTail: (total: number) => `sur ${total}`,
  },
  skill: {
    back: 'Tous les skills',
    copy: 'Copier le prompt',
    copied: 'Copié !',
    ctaHint: 'ou envoie-le directement à ton agent.',
    promptTitle: 'Prompt à copier',
    promptHint:
      "Colle-le dans Cursor ou Claude — l'agent installe le skill dans ton projet.",
    doesTitle: 'Ce que fait ce skill',
    howTitle: 'Comment ça marche',
    triggersTitle: 'Exemples de déclencheurs',
    triggersHint: 'Dis simplement à ton agent quelque chose comme :',
    insideTitle: 'Contenu du skill',
    metaTitle: 'Détails',
    cat: 'Catégorie',
    compat: 'Compatibilité',
    tech: 'Technologies',
    related: 'Skills de la même catégorie',
    notFoundTitle: 'Skill introuvable',
    notFoundBody: "Ce skill n'existe pas (ou plus) dans le catalogue.",
    inside: [
      'Un fichier SKILL.md (instructions + métadonnées)',
      'Des guides Markdown et bonnes pratiques',
      'Des exemples de code et de config',
    ],
    how: [
      { t: 'Copie le prompt', d: "Un clic copie le prompt packagé (ou l'envoie à ton agent)." },
      { t: "L'agent installe le skill", d: 'Il ajoute le SKILL.md et ses ressources à ton projet.' },
      { t: 'Activation automatique', d: "Le skill s'active dès que le contexte correspond." },
    ],
  },
  errors: {
    notFoundTitle: 'Page introuvable',
    notFoundBody: "Cette page n'existe pas ou a été déplacée.",
    serverTitle: 'Erreur serveur',
    serverBody: 'Une erreur inattendue est survenue. Tu peux réessayer ou revenir à l’accueil.',
    home: 'Retour à l’accueil',
    browseSkills: 'Voir les skills',
    retry: 'Réessayer',
  },
  a11y: {
    skipToContent: 'Aller au contenu principal',
    mainNav: 'Navigation principale',
    language: 'Langue',
    langFr: 'Français',
    langEn: 'Anglais',
    themeDark: 'Passer au thème clair',
    themeLight: 'Passer au thème sombre',
    clearSearch: 'Effacer la recherche',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    sortBy: 'Trier par',
    breadcrumb: 'Fil d’Ariane',
    currentPage: 'page actuelle',
    authTabs: 'Mode de connexion',
    searchSkills: 'Rechercher un skill',
    filterSkills: 'Filtrer les skills',
  },
  auth: {
    brandTitle: 'Le store de skills pour ton agent IA.',
    footNote: 'Compatible Cursor · Claude · Codex · Copilot',
    perks: [
      { icon: 'cursor-click', text: "Copie un prompt, ton agent installe la fonctionnalité." },
      { icon: 'stack', text: 'Un catalogue de skills organisés par techno.' },
      { icon: 'shield-check', text: "Bonnes pratiques prêtes à l'emploi, sans config." },
    ],
    loginTitle: 'Bon retour.',
    loginSub: 'Connecte-toi pour gérer ton catalogue de skills.',
    signupTitle: 'Crée ton compte.',
    signupSub: 'Commence à publier et organiser tes skills.',
    tabLogin: 'Connexion',
    tabSignup: 'Inscription',
    name: 'Nom',
    namePh: 'Ada Lovelace',
    email: 'E-mail',
    password: 'Mot de passe',
    forgot: 'Oublié ?',
    or: 'ou',
    github: 'Continuer avec GitHub',
    google: 'Continuer avec Google',
    loginSubmit: 'Se connecter',
    signupSubmit: 'Créer mon compte',
    toLogin: 'Déjà un compte ?',
    toLoginLink: 'Se connecter',
    toSignup: 'Pas encore de compte ?',
    toSignupLink: 'Créer un compte',
    oauthSoon: 'Connexion sociale bientôt disponible.',
    loading: 'Chargement…',
    errors: {
      invalid_credentials: 'E-mail ou mot de passe incorrect.',
      email_taken: 'Un compte existe déjà avec cet e-mail.',
      name_required: 'Le nom est requis.',
      password_too_short: 'Le mot de passe doit contenir au moins 8 caractères.',
      generic: 'Une erreur est survenue. Réessaie.',
    },
  },
  start: {
    home: 'Accueil',
    detail: 'Voir les détails',
    eyebrow: 'Premier pas',
    title: 'Démarre en trois étapes.',
    sub: 'Choisis ta techno, copie les skills recommandés, et ton agent configure ton projet.',
    pickTitle: 'Choisis ta techno',
    pickSub: 'Les skills recommandés se mettent à jour selon ta stack.',
    pickPrompt: 'Sélectionne une techno ci-dessus pour afficher les skills recommandés.',
    recFor: 'Recommandé pour',
    skillsWord: 'skills',
    copyAll: 'Tout copier pour cette stack',
    copiedAll: 'Prompt copié !',
    copy: 'Copier',
    copied: 'Copié !',
    footHint: "Un skill peut s'appliquer à plusieurs technos — c'est normal.",
    steps: [
      { icon: 'cursor-click', t: 'Copie le prompt', d: "Sur une fiche skill, un clic copie le prompt packagé (ou l'envoie à ton agent)." },
      { icon: 'download-simple', t: "L'agent installe", d: 'Colle-le dans Cursor ou Claude : le skill est ajouté à ton codebase.' },
      { icon: 'lightning', t: 'Activation auto', d: "Le skill s'active dès que le contexte de ton projet correspond." },
    ],
  },
}

const en: typeof fr = {
  nav: {
    brand: 'Arboris',
    home: 'Home',
    start: 'Getting started',
    skills: 'Skills',
    theme: 'Theme',
    signIn: 'Sign in',
    signOut: 'Sign out',
    account: 'My account',
  },
  home: {
    eyebrow: 'AI skill catalog',
    title: 'All your skills,\none command.',
    sub: "Copy a skill's prompt and let your agent add it to the codebase. Zero config.",
    openIndex: 'Open the index',
    example: 'See an example',
    worksWith: 'Works with',
    indexTitle: 'The full index',
    searchPh: 'Filter skills…',
    empty: 'No skill found.',
    term1: 'Prompt copied to clipboard',
    term2: 'Pasted into your agent…',
    term3: 'Skill added · applying best practices',
    copy: 'Copy',
    copied: 'Copied!',
    footer: 'Ready-to-use skills for your AI agent.',
    browseAll: 'See all skills',
  },
  skills: {
    kicker: 'Skill catalog',
    worksWith: 'Works with',
    title: 'All skills',
    subtitle:
      'Ready-to-use skills — copy the prompt and your agent installs the feature into your project.',
    searchPh: 'Search a skill, a technology…',
    categories: 'Categories',
    allCats: 'All categories',
    compat: 'Compatibility',
    tech: 'Technologies',
    clear: 'Clear filters',
    colSkill: 'Skill',
    colDesc: 'Description',
    colTech: 'Tech',
    colCompat: 'Compatibility',
    copy: 'Copy prompt',
    copied: 'Copied!',
    detail: 'View details',
    emptyTitle: 'No skill found',
    emptyBody: 'Try broadening your search or clearing the filters.',
    scoreHint: 'Skill quality score (0–100).',
    resOne: 'skill',
    resMany: 'skills',
    resTail: (total: number) => `of ${total}`,
  },
  skill: {
    back: 'All skills',
    copy: 'Copy prompt',
    copied: 'Copied!',
    ctaHint: 'or send it straight to your agent.',
    promptTitle: 'Prompt to copy',
    promptHint:
      'Paste it into Cursor or Claude — the agent installs the skill into your project.',
    doesTitle: 'What this skill does',
    howTitle: 'How it works',
    triggersTitle: 'Example triggers',
    triggersHint: 'Just tell your agent something like:',
    insideTitle: 'Inside the skill',
    metaTitle: 'Details',
    cat: 'Category',
    compat: 'Compatibility',
    tech: 'Technologies',
    related: 'Skills in the same category',
    notFoundTitle: 'Skill not found',
    notFoundBody: 'This skill does not exist (anymore) in the catalog.',
    inside: [
      'A SKILL.md file (instructions + metadata)',
      'Markdown guides and best practices',
      'Code and config examples',
    ],
    how: [
      { t: 'Copy the prompt', d: 'One click copies the packaged prompt (or sends it to your agent).' },
      { t: 'The agent installs the skill', d: 'It adds the SKILL.md and its resources to your project.' },
      { t: 'Automatic activation', d: 'The skill activates as soon as the context matches.' },
    ],
  },
  errors: {
    notFoundTitle: 'Page not found',
    notFoundBody: "This page doesn't exist or has been moved.",
    serverTitle: 'Server error',
    serverBody: 'An unexpected error occurred. You can retry or go back home.',
    home: 'Back to home',
    browseSkills: 'Browse skills',
    retry: 'Retry',
  },
  a11y: {
    skipToContent: 'Skip to main content',
    mainNav: 'Main navigation',
    language: 'Language',
    langFr: 'French',
    langEn: 'English',
    themeDark: 'Switch to light theme',
    themeLight: 'Switch to dark theme',
    clearSearch: 'Clear search',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    sortBy: 'Sort by',
    breadcrumb: 'Breadcrumb',
    currentPage: 'current page',
    authTabs: 'Sign-in mode',
    searchSkills: 'Search skills',
    filterSkills: 'Filter skills',
  },
  auth: {
    brandTitle: 'The skill store for your AI agent.',
    footNote: 'Works with Cursor · Claude · Codex · Copilot',
    perks: [
      { icon: 'cursor-click', text: 'Copy a prompt, your agent installs the feature.' },
      { icon: 'stack', text: 'A catalog of skills organized by technology.' },
      { icon: 'shield-check', text: 'Ready-to-use best practices, zero config.' },
    ],
    loginTitle: 'Welcome back.',
    loginSub: 'Sign in to manage your skill catalog.',
    signupTitle: 'Create your account.',
    signupSub: 'Start publishing and organizing your skills.',
    tabLogin: 'Sign in',
    tabSignup: 'Sign up',
    name: 'Name',
    namePh: 'Ada Lovelace',
    email: 'Email',
    password: 'Password',
    forgot: 'Forgot?',
    or: 'or',
    github: 'Continue with GitHub',
    google: 'Continue with Google',
    loginSubmit: 'Sign in',
    signupSubmit: 'Create my account',
    toLogin: 'Already have an account?',
    toLoginLink: 'Sign in',
    toSignup: "Don't have an account?",
    toSignupLink: 'Sign up',
    oauthSoon: 'Social sign-in coming soon.',
    loading: 'Loading…',
    errors: {
      invalid_credentials: 'Incorrect email or password.',
      email_taken: 'An account already exists with this email.',
      name_required: 'Name is required.',
      password_too_short: 'Password must be at least 8 characters.',
      generic: 'Something went wrong. Please try again.',
    },
  },
  start: {
    home: 'Home',
    detail: 'View details',
    eyebrow: 'Getting started',
    title: 'Get going in three steps.',
    sub: 'Pick your technology, copy the recommended skills, and your agent sets up your project.',
    pickTitle: 'Pick your technology',
    pickSub: 'Recommended skills update to match your stack.',
    pickPrompt: 'Select a technology above to see recommended skills.',
    recFor: 'Recommended for',
    skillsWord: 'skills',
    copyAll: 'Copy all for this stack',
    copiedAll: 'Prompt copied!',
    copy: 'Copy',
    copied: 'Copied!',
    footHint: "A skill can apply to several technologies — that's expected.",
    steps: [
      { icon: 'cursor-click', t: 'Copy the prompt', d: 'On a skill page, one click copies the packaged prompt (or sends it to your agent).' },
      { icon: 'download-simple', t: 'The agent installs', d: 'Paste it into Cursor or Claude: the skill is added to your codebase.' },
      { icon: 'lightning', t: 'Auto activation', d: 'The skill activates as soon as your project context matches.' },
    ],
  },
}

const DICTS = { fr, en } as const
export type Messages = typeof fr

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Messages
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY)
      if (stored === 'fr' || stored === 'en') {
        setLangState(stored)
      }
    } catch {
      /* localStorage indisponible */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(LANG_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: DICTS[lang] }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n doit être utilisé dans <I18nProvider>')
  }
  return ctx
}
