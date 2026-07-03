import { Link, type LinkComponentProps } from '@tanstack/react-router'
import React, { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, useEffect, useState } from 'react'
import { cn } from '#/lib/utils'

interface RippleStyleProps {
  rippleColor?: string
  duration?: string
}

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, RippleStyleProps {}

function useRipple(duration = '600ms') {
  const [buttonRipples, setButtonRipples] = useState<Array<{ x: number; y: number; size: number; key: number }>>([])

  const createRipple = (event: MouseEvent<HTMLElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    const newRipple = { x, y, size, key: Date.now() }
    setButtonRipples((prev) => [...prev, newRipple])
  }

  useEffect(() => {
    if (buttonRipples.length === 0) return
    const lastRipple = buttonRipples[buttonRipples.length - 1]
    const timeout = setTimeout(() => {
      setButtonRipples((prev) => prev.filter((ripple) => ripple.key !== lastRipple.key))
    }, Number.parseInt(duration, 10))

    return () => clearTimeout(timeout)
  }, [buttonRipples, duration])

  return { buttonRipples, createRipple }
}

function RippleLayer({
  ripples,
  rippleColor,
  duration,
}: {
  ripples: Array<{ x: number; y: number; size: number; key: number }>
  rippleColor: string
  duration: string
}) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden [border-radius:inherit]">
      {ripples.map((ripple) => (
        <span
          className="animate-rippling absolute rounded-full opacity-30"
          key={ripple.key}
          style={
            {
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              top: `${ripple.y}px`,
              left: `${ripple.x}px`,
              backgroundColor: rippleColor,
              transform: 'scale(0)',
              '--duration': duration,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  )
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ className, children, rippleColor = '#ffffff', duration = '600ms', onClick, ...props }, ref) => {
    const { buttonRipples, createRipple } = useRipple(duration)

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      createRipple(event)
      onClick?.(event)
    }

    return (
      <button
        className={cn('relative flex cursor-pointer items-center justify-center overflow-hidden', className)}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        <RippleLayer ripples={buttonRipples} rippleColor={rippleColor} duration={duration} />
      </button>
    )
  },
)

RippleButton.displayName = 'RippleButton'

type RippleLinkProps = Omit<LinkComponentProps, 'className' | 'children'> &
  RippleStyleProps & {
    className?: string
    children?: ReactNode
  }

export function RippleLink({
  className,
  children,
  rippleColor = '#ffffff',
  duration = '600ms',
  onClick,
  ...props
}: RippleLinkProps) {
  const { buttonRipples, createRipple } = useRipple(duration)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    createRipple(event)
    onClick?.(event)
  }

  return (
    <Link
      className={cn('relative flex cursor-pointer items-center justify-center overflow-hidden no-underline', className)}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <RippleLayer ripples={buttonRipples} rippleColor={rippleColor} duration={duration} />
    </Link>
  )
}
