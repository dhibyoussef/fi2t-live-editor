/** Return the first non-empty trimmed string, or '' */
export function pickContentValue(...candidates: (string | undefined | null)[]): string {
  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (value) return value
  }
  return ''
}
