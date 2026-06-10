/**
 * SVG Injector — Phase 3
 *
 * Fetches SVG files from public/assets/svg-generative/, parses them via
 * DOMParser, and injects them inline into a container element.
 * Inline injection is required so GSAP can target individual <path> nodes
 * and so CSS currentColor inherits from the parent for easy theming.
 */

// ─── Catalog ──────────────────────────────────────────────────────────────────

/**
 * Static catalog of available SVG assets.
 * Vite doesn't support runtime directory listing in production, so we
 * enumerate them here — the same pattern used by Framer, Linear, Vercel.
 * Add new files to public/assets/svg-generative/ AND register here.
 */
export const SVG_CATALOG: SVGAsset[] = [
  {
    id: 'blob-01',
    label: 'Blob Orgânico',
    path: '/assets/svg-generative/blob-01.svg',
    description: 'Forma blob com camadas concêntricas suaves',
  },
  {
    id: 'grid-lines',
    label: 'Grade de Linhas',
    path: '/assets/svg-generative/grid-lines.svg',
    description: 'Grade cartesiana com pontos de intersecção',
  },
  {
    id: 'circles-field',
    label: 'Campo de Círculos',
    path: '/assets/svg-generative/circles-field.svg',
    description: 'Círculos concêntricos com miras cardinais',
  },
]

export interface SVGAsset {
  id: string
  label: string
  path: string
  description: string
}

// ─── Fetch & Inject ───────────────────────────────────────────────────────────

/**
 * Fetches an SVG file and returns the parsed SVGElement.
 * Throws if the file is not found or is malformed.
 */
export async function fetchSVGElement(assetPath: string): Promise<SVGElement> {
  const response = await fetch(assetPath)
  if (!response.ok) {
    throw new Error(`[SVGInjector] Failed to fetch: ${assetPath} (${response.status})`)
  }
  const text = await response.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'image/svg+xml')

  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error(`[SVGInjector] Parse error in: ${assetPath}`)
  }

  return doc.documentElement as unknown as SVGElement
}

/**
 * Injects an SVG element into a container, replacing any previous content.
 * The SVG is made responsive and inherits color from the parent (currentColor).
 *
 * @returns The injected SVGElement so callers can query its children.
 */
export function injectSVGIntoContainer(
  svgEl: SVGElement,
  container: HTMLElement,
  color = 'currentColor'
): SVGElement {
  // Make it fill container and respond to CSS color
  svgEl.setAttribute('width', '100%')
  svgEl.setAttribute('height', '100%')
  svgEl.style.color = color
  svgEl.style.overflow = 'visible'

  // Clear previous injection
  container.innerHTML = ''
  container.appendChild(svgEl)

  return svgEl
}

/**
 * Returns all animatable child elements of a <svg> node.
 * Targets: <path>, <circle>, <ellipse>, <rect>, <line>, <polyline>, <polygon>
 */
export function getAnimatableTargets(svgEl: SVGElement): Element[] {
  const selector = 'path, circle, ellipse, rect, line, polyline, polygon'
  return Array.from(svgEl.querySelectorAll(selector))
}

/**
 * High-level helper: fetch + inject + return targets in one call.
 */
export async function loadSVG(
  asset: SVGAsset,
  container: HTMLElement,
  color?: string
): Promise<{ svgEl: SVGElement; targets: Element[] }> {
  const svgEl = await fetchSVGElement(asset.path)
  const injected = injectSVGIntoContainer(svgEl, container, color)
  const targets = getAnimatableTargets(injected)
  return { svgEl: injected, targets }
}
