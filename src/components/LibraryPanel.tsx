/**
 * LibraryPanel — Sidebar panel with category filters + informative empty state
 * Benchmarked against: Figma Assets panel, After Effects Project panel
 */
import { useEditorStore } from '@/store/useEditorStore'
import { Type, Layers, Combine, Image as ImageIcon, Music, FolderOpen } from 'lucide-react'

const TABS = [
  { id: 'Tipografia', label: 'Tipografia',  icon: Type,    desc: 'Layers de texto animados' },
  { id: 'Generativo', label: 'Generativo',  icon: Layers,  desc: 'Formas e padrões gerativos' },
  { id: 'Logo',       label: 'Logo',        icon: ImageIcon,desc: 'Logos e identidades visuais' },
  { id: 'Transição',  label: 'Transição',   icon: Combine, desc: 'Transições entre cenas' },
  { id: 'Audio',      label: 'Áudio',       icon: Music,   desc: 'Trilhas e efeitos sonoros' },
]

export function LibraryPanel() {
  const { activeLibraryTab, setActiveLibraryTab } = useEditorStore()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100%',
        overflowY: 'auto',
        paddingRight: 4,
        paddingBottom: 32,
      }}
      className="custom-scrollbar"
    >
      {/* Header hint */}
      <div
        style={{
          background: 'var(--color-accent-muted)',
          border: '1px solid hsla(191,100%,50%,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          fontSize: '0.75rem',
          color: 'var(--color-accent)',
          lineHeight: 1.5,
        }}
      >
        Selecione uma categoria e arraste itens para o canvas para compor sua cena.
      </div>

      {/* Category list */}
      <div className="glass-panel" style={{ padding: 12, borderRadius: 'var(--radius-lg)' }}>
        <div className="section-header">
          <FolderOpen size={11} /> Categorias
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map((tab) => {
            const Icon    = tab.icon
            const isActive = activeLibraryTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveLibraryTab(tab.id)}
                className="btn-pressable"
                title={tab.desc}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                  border: isActive
                    ? '1px solid hsla(191,100%,50%,0.25)'
                    : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s var(--ease-smooth)',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--color-surface-glass-hover)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div>{tab.label}</div>
                  <div style={{ fontSize: '0.65rem', color: isActive ? 'hsla(191,100%,70%,0.7)' : 'var(--color-text-ghost)', marginTop: 1 }}>
                    {tab.desc}
                  </div>
                </div>
                {isActive && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      boxShadow: '0 0 8px var(--color-accent)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty state for gallery area */}
      <div className="empty-state">
        <div className="empty-state__icon">
          <FolderOpen size={22} />
        </div>
        <div className="empty-state__title">Galeria em construção</div>
        <div className="empty-state__desc">
          A galeria de templates para <strong>{activeLibraryTab}</strong> estará disponível em breve.
          Por ora, use os painéis de Tipografia e Generativo para criar do zero.
        </div>
      </div>
    </div>
  )
}
