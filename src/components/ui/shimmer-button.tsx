import { Link, type LinkComponentProps } from '@tanstack/react-router'
import React, { type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '#/lib/utils'

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<'button'> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: ReactNode
}

const shimmerVars = (
  shimmerColor: string,
  shimmerSize: string,
  shimmerDuration: string,
  borderRadius: string,
  background: string,
): CSSProperties =>
  ({
    '--spread': '90deg',
    '--shimmer-color': shimmerColor,
    '--radius': borderRadius,
    '--speed': shimmerDuration,
    '--cut': shimmerSize,
    '--bg': background,
  }) as CSSProperties

/**
 * Pas de background sur le shell + pas de z-index négatif :
 * Firefox ne peint pas les descendants z-négatifs au-dessus du fond d’un
 * élément overflow:hidden / stacking context (le beam disparaît).
 * Empilement positif : beam (0) → fill (1) → gloss (2) → contenu (10).
 */
const shimmerShellClass =
  'group relative z-0 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden border border-white/20 bg-transparent font-medium whitespace-nowrap text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset] [border-radius:var(--radius)] transform-gpu transition-[transform,filter] duration-300 ease-in-out hover:brightness-110 active:translate-y-px'

function ShimmerBeam() {
  return (
    <div
      className="shimmer-beam pointer-events-none absolute inset-0 z-0 overflow-hidden [border-radius:var(--radius)]"
      aria-hidden
    >
      <div
        className="animate-spin-around absolute -inset-full"
        style={{
          // calc() sans multiplication d’angles : plus fiable sous Firefox
          background:
            'conic-gradient(from 225deg, transparent 0deg, var(--shimmer-color) var(--spread), transparent calc(var(--spread) + 0.1deg))',
        }}
      />
    </div>
  )
}

function ShimmerChrome() {
  return (
    <>
      {/* Remplit le centre : seul le liseré (--cut) laisse voir le beam. */}
      <div
        className="pointer-events-none absolute z-[1] [border-radius:var(--radius)] [background:var(--bg)] inset-[var(--cut)]"
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-[2] [border-radius:var(--radius)]',
          'shadow-[inset_0_-8px_10px_#ffffff1f]',
          'transition-shadow duration-300 ease-in-out',
          'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
        )}
        aria-hidden
      />
    </>
  )
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = 'rgba(255,255,255,0.85)',
      shimmerSize = '2px',
      shimmerDuration = '2.5s',
      borderRadius = '5px',
      background = 'var(--accent)',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={shimmerVars(shimmerColor, shimmerSize, shimmerDuration, borderRadius, background)}
        className={cn(shimmerShellClass, className)}
        ref={ref}
        {...props}
      >
        <ShimmerBeam />
        <ShimmerChrome />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    )
  },
)

ShimmerButton.displayName = 'ShimmerButton'

type ShimmerButtonLinkProps = Omit<LinkComponentProps, 'className' | 'children'> & {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: ReactNode
}

export function ShimmerButtonLink({
  shimmerColor = 'rgba(255,255,255,0.85)',
  shimmerSize = '2px',
  shimmerDuration = '2.5s',
  borderRadius = '5px',
  background = 'var(--accent)',
  className,
  children,
  ...props
}: ShimmerButtonLinkProps) {
  return (
    <Link
      style={shimmerVars(shimmerColor, shimmerSize, shimmerDuration, borderRadius, background)}
      className={cn(shimmerShellClass, '!text-white no-underline', className)}
      {...props}
    >
      <ShimmerBeam />
      <ShimmerChrome />
      <span className="relative z-10 inline-flex items-center gap-2 [&_i]:!text-white">{children}</span>
    </Link>
  )
}
