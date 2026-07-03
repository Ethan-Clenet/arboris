/** Fusionne des classes Tailwind (ignore les valeurs falsy). */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}
