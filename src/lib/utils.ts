/**
 * Resolves a public asset path by prepending the Vite base URL (e.g. /pelimotion-design-system/).
 * This is crucial for environments hosted on a subdirectory.
 */
export function resolveAssetPath(path: string): string {
  if (!path) return ''
  // If it's already a full URL or relative path without a leading slash, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  
  return `${normalizedBase}${normalizedPath}`
}
