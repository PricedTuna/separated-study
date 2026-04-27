/** Tiny UUID v4 — no external dependency needed (crypto.randomUUID is available in all modern browsers) */
export function v4(): string {
  return crypto.randomUUID()
}
