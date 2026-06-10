/**
 * LibraryPanel — Phase 4
 *
 * Sidebar controls for the Library phase.
 * Lists available assets, allows selection, and handles direct downloads.
 */
import { useEditorStore } from '@/store/useEditorStore'
import { Film, Download, Layers } from 'lucide-react'
import { downloadFile } from '@/lib/downloadHandler'

export function LibraryPanel() {
  const { libraryConfig, activeLibraryAssetId, setActiveLibraryAssetId } = useEditorStore()

  const handleDownload = (assetId: string) => {
    const asset = libraryConfig.assets.find(a => a.id === assetId)
    const category = libraryConfig.categories.find(c => c.id === asset?.category)
    
    if (asset && category) {
      // In a real scenario, we might download the full-res MOV instead of the preview WEBM.
      // We assume the filename in library.json is the intended download file.
      const url = `${category.basePath}${asset.filename}`
      downloadFile(url, asset.filename)
    }
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto', paddingRight: 4 }}
      className="custom-scrollbar"
    >
      {libraryConfig.categories.map(category => {
        const categoryAssets = libraryConfig.assets.filter(a => a.category === category.id)
        if (categoryAssets.length === 0) return null

        return (
          <div key={category.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', padding: '0 4px' }}>
              {category.id === 'svg-generative' ? <Layers size={14} /> : <Film size={14} />}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {category.label}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {categoryAssets.map(asset => {
                const isActive = activeLibraryAssetId === asset.id
                return (
                  <div
                    key={asset.id}
                    onClick={() => setActiveLibraryAssetId(asset.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: isActive ? 'var(--color-surface-glass-hover)' : 'var(--color-surface-glass)',
                      border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                        {asset.name}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {asset.resolution} • {asset.format.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(asset.id)
                      }}
                      title="Baixar Asset"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-accent)'
                        e.currentTarget.style.background = 'var(--color-surface-glass)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-secondary)'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
