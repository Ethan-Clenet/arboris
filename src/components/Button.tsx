import { type LinkComponentProps } from '@tanstack/react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { RippleButton, RippleLink } from '#/components/ui/ripple-button'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'copy'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[5px] border font-medium transition-colors duration-150 disabled:cursor-not-allowed'

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-[var(--accent)] bg-[var(--accent)] !text-white hover:border-[var(--accent-press)] hover:bg-[var(--accent-press)] hover:!text-white [&_i]:!text-white [&_span]:!text-white',
  secondary:
    'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)] [&_span]:text-[var(--text-1)] [&_i]:text-[var(--text-1)]',
  outline:
    'border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)] [&_span]:text-[var(--text-1)] [&_i]:text-[var(--text-1)]',
  ghost:
    'border-transparent bg-transparent text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]',
  copy: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)] [&_span]:text-[var(--text-1)] [&_i]:text-[var(--text-1)]',
}

const copiedCopy =
  'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]'

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-[13px]',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4 py-2.5 text-sm',
}

const rippleColors: Record<ButtonVariant, string> = {
  primary: 'rgba(255, 255, 255, 0.55)',
  secondary: 'rgba(48, 164, 108, 0.45)',
  outline: 'rgba(48, 164, 108, 0.4)',
  ghost: 'rgba(48, 164, 108, 0.35)',
  copy: 'rgba(48, 164, 108, 0.4)',
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
    <RippleButton
      rippleColor={rippleColors[variant]}
      className={classes(variant, size, { copied, block, className })}
      {...props}
    >
      {children}
    </RippleButton>
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
    <RippleLink
      rippleColor={rippleColors[variant]}
      className={classes(variant, size, { block, className })}
      {...props}
    >
      {children}
    </RippleLink>
  )
}
