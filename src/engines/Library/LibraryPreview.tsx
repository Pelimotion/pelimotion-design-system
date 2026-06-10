/**
 * LibraryPreview — Phase 4
 *
 * Canvas area for the Library phase. Displays the currently selected
 * asset. Handles routing to AlphaVideoPlayer for video formats or
 * rendering SVGs.
 */
import { useEditorStore } from '@/store/useEditorStore'
import { AlphaVideoPlayer } from './AlphaVideoPlayer'
import { SVG_CATALOG } from '@/engines/Generative/svgInjector'

export function LibraryPreview() {
  const { libraryConfig, activeLibraryAssetId } = useEditorStore()

  const activeAsset = libraryConfig.assets.find(a => a.id === activeLibraryAssetId)
  const category = libraryConfig.categories.find(c => c.id === activeAsset?.category)

  if (!activeAsset || !category) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem'
      }}>
        Selecione um asset na biblioteca para visualizar.
      </div>
    )
  }

  const isVideo = activeAsset.format === 'mov' || activeAsset.format === 'webm' || activeAsset.format === 'mp4'
  const isSvg = activeAsset.format === 'svg'

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 800,
        aspectRatio: '16/9',
        position: 'relative'
      }}>
        {isVideo && (
          <AlphaVideoPlayer
            webmSrc={activeAsset.filename.endsWith('.webm') ? `${category.basePath}${activeAsset.filename}` : undefined}
            hevcSrc={activeAsset.filename.endsWith('.mov') || activeAsset.filename.endsWith('.mp4') ? `${category.basePath}${activeAsset.filename}` : undefined}
          />
        )}
        
        {isSvg && (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-surface-glass)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-surface-border)',
          }}>
            {/* Try to load the SVG from Generative Catalog just for preview */}
            {(() => {
              const svgData = SVG_CATALOG.find(s => s.path.includes(activeAsset.filename))
              if (svgData) {
                return (
                  <div style={{ width: '40%', height: '40%' }}>
                    <img src={svgData.path} alt={activeAsset.name} style={{ width: '100%', height: '100%', filter: 'invert(1)' }} />
                  </div>
                )
              }
              return <span>SVG File: {activeAsset.filename}</span>
            })()}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {activeAsset.name}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {activeAsset.resolution} • {activeAsset.format.toUpperCase()} • {activeAsset.hasAlpha ? 'Alpha Channel' : 'Solid'}
        </p>
      </div>
    </div>
  )
}
