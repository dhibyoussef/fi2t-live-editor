/** Static files in `frontend/public` — prefix with Vite base (`/fi2t/admin/` on preprod). */
export function adminAsset(file: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const name = file.replace(/^\//, '')
  return `${base}${name}`
}
