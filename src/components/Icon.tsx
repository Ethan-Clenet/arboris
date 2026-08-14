import type { CSSProperties } from 'react'

interface IconProps {
  name: string
  bold?: boolean
  size?: number | string
  color?: string
  className?: string
  style?: CSSProperties
}

/** Icône Phosphor (webfont auto-hébergée via styles.css). */
export default function Icon({
  name,
  bold = false,
  size = 16,
  color,
  className = '',
  style,
}: IconProps) {
  return (
    <i
      aria-hidden="true"
      className={`${bold ? 'ph-bold' : 'ph'} ph-${name} ${className}`.trim()}
      style={{ fontSize: typeof size === 'number' ? `${size}px` : size, color, ...style }}
    />
  )
}
