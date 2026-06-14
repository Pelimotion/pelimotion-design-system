/**
 * LibraryPanel — Phase 8 (Sidebar Filters)
 *
 * Provides filtering and categorization for the Fullscreen Library Gallery.
 */
import { useEditorStore } from '@/store/useEditorStore'
import { Type, Layers, Combine, Image as ImageIcon, Music } from 'lucide-react'

const TABS = [
  { id: 'Tipografia', label: 'Tipografia', icon: Type },
  { id: 'Generativo', label: 'Generativo', icon: Layers },
  { id: 'Logo', label: 'Logo', icon: ImageIcon },
  { id: 'Transição', label: 'Transição', icon: Combine },
  { id: 'Audio', label: 'Áudio', icon: Music },
]

export function LibraryPanel() {
  const { activeLibraryTab, setActiveLibraryTab } = useEditorStore()
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflowY: 'auto', paddingRight: 4, paddingBottom: 32 }} className="custom-scrollbar">
      
      <div className="glass-panel" style={{ padding: 16, borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Categorias
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLibraryTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLibraryTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: isActive ? 'var(--color-surface-hover)' : 'transparent',
                  border: isActive ? '1px solid var(--color-surface-border)' : '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
      
    </div>
  )
}
