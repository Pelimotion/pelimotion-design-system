/**
 * LibraryPanel — Sidebar panel with category chips + import action
 * Benchmarked against: Figma Assets panel, After Effects Project panel
 */
import React, { useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Type, Layers, Combine, Image as ImageIcon, Music, FolderOpen, Upload } from 'lucide-react'

const TABS = [
  { id: 'Tipografia', label: 'Tipografia', icon: Type },
  { id: 'Generativo', label: 'Generativo', icon: Layers },
  { id: 'Logo', label: 'Logo', icon: ImageIcon },
  { id: 'Transição', label: 'Transição', icon: Combine },
  { id: 'Audio', label: 'Áudio', icon: Music },
]

export function LibraryPanel() {
  const { activeLibraryTab, setActiveLibraryTab, saveToLocalLibrary, addCompositionLayer } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      const isVideo = file.type.startsWith('video/')
      const isAudio = file.type.startsWith('audio/')
      const assetId = crypto.randomUUID()
      const type = isVideo ? 'video' : isAudio ? 'audio' : 'image'

      saveToLocalLibrary({ id: assetId, name: file.name, type, createdAt: Date.now(), data: url })

      if (!isAudio) {
        addCompositionLayer({
          id: crypto.randomUUID(),
          name: file.name,
          type: 'localAsset',
          assetId,
          startTime: 0,
          duration: 5,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
        })
      }
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        overflowY: 'auto',
        paddingRight: 4,
        paddingBottom: 32,
      }}
      className="custom-scrollbar"
    >
      {/* Import Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <button
        className="btn-pressable"
        onClick={() => fileInputRef.current?.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 16px',
          background: 'var(--color-accent-muted)',
          border: '1px dashed hsla(191,100%,50%,0.3)',
          borderRadius: 10,
          color: 'var(--color-accent)',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s var(--ease-smooth)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'hsla(191,100%,50%,0.12)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'hsla(191,100%,50%,0.5)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-accent-muted)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'hsla(191,100%,50%,0.3)'
        }}
      >
        <Upload size={14} />
        Importar Asset
      </button>

      {/* Category chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{
          fontSize: '0.62rem',
          fontWeight: 600,
          color: 'var(--color-text-ghost)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <FolderOpen size={10} /> Categorias
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeLibraryTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLibraryTab(tab.id)}
                className="btn-pressable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  background: isActive ? 'var(--color-accent-muted)' : 'var(--color-surface-glass)',
                  border: isActive
                    ? '1px solid hsla(191,100%,50%,0.3)'
                    : '1px solid var(--color-surface-border)',
                  borderRadius: 6,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s var(--ease-smooth)',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={12} style={{ flexShrink: 0 }} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty state */}
      <div className="empty-state">
        <div className="empty-state__icon">
          <FolderOpen size={22} />
        </div>
        <div className="empty-state__title">Galeria em construção</div>
        <div className="empty-state__desc">
          Templates de <strong>{activeLibraryTab}</strong> em breve.
          Importe seus próprios assets acima ou crie direto nos painéis.
        </div>
      </div>
    </div>
  )
}
