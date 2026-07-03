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
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
          } as CSSProperties
        }
        className={cn(
          'group relative z-0 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden border border-white/20 font-medium whitespace-nowrap text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset] [border-radius:var(--radius)] [background:var(--bg)]',
          'transform-gpu transition-transform duration-300 ease-in-out hover:brightness-110 active:translate-y-px',
          className,
        )}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0 -z-30 overflow-hidden [container-type:size] [border-radius:var(--radius)]',
          )}
        >
          <div className="animate-shimmer-slide absolute inset-0 aspect-square h-[100cqh] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[1] [border-radius:var(--radius)]',
            'shadow-[inset_0_-8px_10px_#ffffff1f]',
            'transition-shadow duration-300 ease-in-out',
            'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute -z-20 [border-radius:var(--radius)] [background:var(--bg)]',
            'inset-[var(--cut)]',
          )}
        />
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
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as CSSProperties
      }
      className={cn(
        'group relative z-0 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden border border-white/20 font-medium whitespace-nowrap !text-white no-underline shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset] [border-radius:var(--radius)] [background:var(--bg)]',
        'transform-gpu transition-transform duration-300 ease-in-out hover:brightness-110 active:translate-y-px',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-30 overflow-hidden [container-type:size] [border-radius:var(--radius)]',
        )}
      >
        <div className="animate-shimmer-slide absolute inset-0 aspect-square h-[100cqh] [mask:none]">
          <div className="animate-spin-around absolute -inset-full w-auto [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </div>
      </div>
      <span className="relative z-10 inline-flex items-center gap-2 [&_i]:!text-white">{children}</span>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-[1] [border-radius:var(--radius)]',
          'shadow-[inset_0_-8px_10px_#ffffff1f]',
          'transition-shadow duration-300 ease-in-out',
          'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -z-20 [border-radius:var(--radius)] [background:var(--bg)]',
          'inset-[var(--cut)]',
        )}
      />
    </Link>
  )
}
