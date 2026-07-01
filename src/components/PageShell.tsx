import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
  /** Fiche skill : colonne un peu plus étroite (1080px). */
  narrow?: boolean
  as?: 'main' | 'div'
}

/** Conteneur de page centré — même largeur que le header/footer. */
export default function PageShell({
  children,
  className = '',
  narrow = false,
  as: Tag = 'main',
}: PageShellProps) {
  return (
    <Tag
      className={`page-shell${narrow ? ' page-shell-narrow' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </Tag>
  )
}
