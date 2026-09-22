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

const shimmerShellClass =
  'group relative z-0 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden border border-white/20 font-medium whitespace-nowrap text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset] [border-radius:var(--radius)] [background:var(--bg)] transform-gpu transition-[transform,filter] duration-300 ease-in-out hover:brightness-110 active:translate-y-px'

function ShimmerBeam() {
  return (
    <div
      className="shimmer-beam pointer-events-none absolute inset-0 -z-30 overflow-hidden [border-radius:var(--radius)]"
      aria-hidden
    >
      {/*
        Rotation seule, sans 100cqh/cqw : le wedge du conic tourne autour du bouton.
        Le calque cutout (ShimmerChrome) ne laisse voir que le liseré — plus de beam figé
        quand les container queries ne s’établissent pas.
      */}
      <div
        className="animate-spin-around absolute -inset-full"
        style={{
          background:
            'conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))',
        }}
      />
    </div>
  )
}

function ShimmerChrome() {
  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-[1] [border-radius:var(--radius)]',
          'shadow-[inset_0_-8px_10px_#ffffff1f]',
          'transition-shadow duration-300 ease-in-out',
          'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
        )}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute -z-20 [border-radius:var(--radius)] [background:var(--bg)]',
          'inset-[var(--cut)]',
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
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        <ShimmerChrome />
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
      <span className="relative z-10 inline-flex items-center gap-2 [&_i]:!text-white">{children}</span>
      <ShimmerChrome />
    </Link>
  )
}
