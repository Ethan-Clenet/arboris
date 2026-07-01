import { Link, type LinkComponentProps } from '@tanstack/react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'copy'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-[5px] border font-medium transition-colors duration-150'

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-[var(--accent)] bg-[var(--accent)] !text-white hover:border-[var(--accent-press)] hover:bg-[var(--accent-press)] hover:!text-white [&_i]:!text-white',
  secondary:
    'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]',
  outline:
    'border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]',
  ghost:
    'border-transparent bg-transparent text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]',
  copy: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]',
}

const copiedCopy =
  'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]'

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-[13px]',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4 py-2.5 text-sm',
}

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  opts?: { copied?: boolean; block?: boolean; className?: string },
) {
  const { copied, block, className = '' } = opts ?? {}
  return [
    base,
    variant === 'copy' && copied ? copiedCopy : variants[variant],
    sizes[size],
    block ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  copied?: boolean
  block?: boolean
  children: ReactNode
}

export function Button({
  variant = 'outline',
  size = 'md',
  copied,
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button type="button" className={classes(variant, size, { copied, block, className })} {...props}>
      {children}
    </button>
  )
}

type ButtonLinkProps = Omit<LinkComponentProps, 'className' | 'children'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  className?: string
  children: ReactNode
}

export function ButtonLink({
  variant = 'outline',
  size = 'md',
  block,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={classes(variant, size, { block, className })} {...props}>
      {children}
    </Link>
  )
}
