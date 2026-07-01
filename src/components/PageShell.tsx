import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
  as?: 'main' | 'div'
}

/** Conteneur de page centré — même largeur que le header/footer. */
export default function PageShell({
  children,
  className = '',
  as: Tag = 'main',
}: PageShellProps) {
  return (
    <Tag className={`page-shell${className ? ` ${className}` : ''}`}>
      {children}
    </Tag>
  )
}
