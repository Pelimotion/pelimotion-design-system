import { useEditorStore } from '@/store/useEditorStore'
import type { EditorPanel } from '@/types/motion.types'
import {
  Type,
  Layers,
  Film,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  MonitorPlay,
} from 'lucide-react'
import { TypographyPanel } from '@/components/TypographyPanel'
import { GenerativePanel } from '@/components/GenerativePanel'
import { LibraryPanel } from '@/components/LibraryPanel'
import { CompositionPanel } from '@/components/CompositionPanel'
import { ExportPanel } from '@/components/ExportPanel'
import { TypographyPreview } from '@/engines/Typography'
import { GenerativePreview } from '@/engines/Generative/GenerativePreview'
import { LibraryPreview } from '@/engines/Library/LibraryPreview'
import { CompositionPreview } from '@/engines/Composition/CompositionPreview'
import { ExportPreview } from '@/engines/Export/ExportPreview'
import { TopToolbar } from '@/components/TopToolbar'
import { GlobalGizmo } from '@/components/GlobalGizmo'
import { CanvasGuides } from '@/components/CanvasGuides'
import { useState, useRef, useEffect } from 'react'

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  id: EditorPanel;
  label: string;
  icon: React.ReactNode;
  status: 'ready' | 'pending';
  phase: number;
}

const navItems: NavItem[] = [
  { id: 'typography', label: 'Tipografia', icon: <Type size={18} />, status: 'ready', phase: 2 },
  { id: 'generative', label: 'Generativo', icon: <Layers size={18} />, status: 'ready', phase: 3 },
  { id: 'library', label: 'Biblioteca', icon: <Film size={18} />, status: 'ready', phase: 4 },
  { id: 'composition', label: 'Composição', icon: <MonitorPlay size={18} />, status: 'ready', phase: 5 },
  { id: 'export', label: 'Exportar', icon: <Download size={18} />, status: 'ready', phase: 6 },
]

// ─── App Component ───────────────────────────────────────────────────────────

function App() {
  const {
    motionConfig,
    activePanel,
    setActivePanel,
    sidebarCollapsed,
    toggleSidebar,
    posterizeEnabled,
    posterizeFps,
    exportConfig,
  } = useEditorStore()

  const [sidebarWidth, setSidebarWidth] = useState(320)
  const isResizing = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = Math.max(200, Math.min(600, e.clientX - 8))
      setSidebarWidth(newWidth)
    }
    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = 'default'
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div id="app-shell" style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      background: 'linear-gradient(145deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
    }}>

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        id="sidebar"
        className="glass-panel animate-fade-in"
        style={{
          width: sidebarCollapsed ? 56 : sidebarWidth,
          minWidth: sidebarCollapsed ? 56 : sidebarWidth,
          margin: 8,
          marginRight: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transition: isResizing.current ? 'none' : 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {!sidebarCollapsed && (
          <div
            onMouseDown={() => {
              isResizing.current = true
              document.body.style.cursor = 'col-resize'
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 6,
              height: '100%',
              cursor: 'col-resize',
              zIndex: 100,
            }}
          />
        )}
        {/* Header */}
        <div style={{
          padding: sidebarCollapsed ? '16px 12px' : '20px 16px',
          borderBottom: '1px solid var(--color-surface-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}>
                  <Zap size={13} color="#fff" />
                </div>
                <span style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.01em',
                  color: 'var(--color-text-primary)',
                }}>
                  Pelimotion
                </span>
                <span style={{
                  fontWeight: 400,
                  fontSize: '0.95rem',
                  color: 'var(--color-text-muted)',
                }}>
                  Design System
                </span>
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--color-text-ghost)',
                marginTop: 4,
                fontFamily: 'var(--font-mono)',
              }}>
                v{motionConfig.version}
              </div>
            </div>
          )}
          <button
            id="toggle-sidebar"
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--duration-fast) var(--ease-smooth)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: 8 }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${activePanel === item.id ? 'nav-item--active' : ''}`}
              onClick={() => setActivePanel(item.id)}
              style={{
                marginBottom: 2,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span className={`status-badge status-badge--${item.status}`}>
                    {item.status === 'ready' ? 'Ready' : `P${item.phase}`}
                  </span>
                </>
              )}
            </div>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <>
            <div style={{ height: 1, background: 'var(--color-surface-border)', margin: '0 8px' }} />
            
            {/* Active Panel Controls */}
            <div style={{ flex: 1, overflow: 'hidden', padding: 16, display: 'flex', flexDirection: 'column' }}>
              {activePanel === 'typography' && <TypographyPanel />}
              {activePanel === 'generative' && <GenerativePanel />}
              {activePanel === 'library' && <LibraryPanel />}
              {activePanel === 'composition' && <CompositionPanel />}
              {activePanel === 'export' && <ExportPanel />}
              {activePanel !== 'typography' && activePanel !== 'generative' && activePanel !== 'library' && activePanel !== 'composition' && activePanel !== 'export' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--color-text-ghost)',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                }}>
                  Controls for {activePanel} will be unlocked in a future phase.
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer: Config Status */}
        {!sidebarCollapsed && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-surface-border)',
          }}>
            <div className="config-card animate-fade-in stagger-3" style={{ marginBottom: 8 }}>
              <div className="config-card__label">Config Loaded</div>
              <div className="config-card__value" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                  display: 'inline-block',
                  boxShadow: '0 0 8px hsla(157, 100%, 40%, 0.4)',
                }} />
                global-motion.json
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 0 0',
            }}>
              <Settings size={14} color="var(--color-text-ghost)" />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--color-text-ghost)',
              }}>
                Posterize: {posterizeEnabled ? `${posterizeFps}fps` : 'OFF'}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* ─── Main Content Area ────────────────────────────────────────────── */}
      <main
        id="main-content"
        style={{
          flex: 1,
          margin: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <TopToolbar />
        {/* Canvas Area */}
        <div
          id="canvas-viewport"
          className="glass-panel animate-fade-in stagger-2 animate-pulse-glow"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: exportConfig.backgroundColor,
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {/* Background Media Layer */}
          {activePanel !== 'export' && activePanel !== 'library' && exportConfig.backgroundImageUrl && (
            <>
              {exportConfig.backgroundType === 'image' ? (
                <img
                  src={exportConfig.backgroundImageUrl}
                  alt="bg"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    ...(exportConfig.aspectRatioMode === 'manual' ? {
                      transform: `translate(${exportConfig.overlayX}px, ${exportConfig.overlayY}px) scale(${exportConfig.overlayScale})`,
                    } : {
                      objectFit: exportConfig.aspectRatioMode === 'fit' ? 'contain' : 'cover'
                    })
                  }}
                />
              ) : (
                <video
                  src={exportConfig.backgroundImageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    ...(exportConfig.aspectRatioMode === 'manual' ? {
                      transform: `translate(${exportConfig.overlayX}px, ${exportConfig.overlayY}px) scale(${exportConfig.overlayScale})`,
                    } : {
                      objectFit: exportConfig.aspectRatioMode === 'fit' ? 'contain' : 'cover'
                    })
                  }}
                />
              )}
            </>
          )}

          {/* Grid Background Pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(hsla(0,0%,100%,0.02) 1px, transparent 1px),
              linear-gradient(90deg, hsla(0,0%,100%,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* GlobalGizmo — direct child of canvas-viewport so position:absolute anchors to canvas top-left */}
          <GlobalGizmo />

          {/* CanvasGuides — aspect ratio safe zone overlay */}
          <CanvasGuides />

          {/* Center Content */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}>
            {activePanel === 'typography' ? (
              <TypographyPreview />
            ) : activePanel === 'generative' ? (
              <GenerativePreview />
            ) : activePanel === 'library' ? (
              <LibraryPreview />
            ) : activePanel === 'composition' ? (
              <CompositionPreview />
            ) : activePanel === 'export' ? (
              <ExportPreview />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--color-accent), #7c3aed, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 0 40px hsla(191, 100%, 50%, 0.15), 0 0 80px hsla(271, 76%, 53%, 0.1)',
                }}>
                  <MonitorPlay size={28} color="#fff" />
                </div>

                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text-primary)',
                  marginBottom: 8,
                }}>
                  Motion Canvas
                </h1>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                  maxWidth: 360,
                  lineHeight: 1.6,
                  margin: '0 auto',
                }}>
                  Environment initialized. Engine ready for integration.
                </p>

                {/* Config Summary Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginTop: 32,
                  maxWidth: 480,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}>
                  {[
                    { label: 'Easing Curves', value: Object.keys(motionConfig.easing).length.toString(), unit: 'registered' },
                    { label: 'Trail Instances', value: motionConfig.trail.instances.toString(), unit: 'clones' },
                    { label: 'Posterize Rate', value: motionConfig.posterizeTime.masterFps.toString(), unit: 'fps' },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className={`config-card animate-fade-in stagger-${i + 4}`}
                      style={{ textAlign: 'left' }}
                    >
                      <div className="config-card__label">{item.label}</div>
                      <div className="config-card__value">
                        {item.value}
                        <span style={{
                          color: 'var(--color-text-ghost)',
                          fontSize: '0.65rem',
                          marginLeft: 4,
                        }}>
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info Bar */}
        <footer
          id="status-bar"
          className="animate-fade-in stagger-5"
          style={{
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-ghost)',
          }}
        >
          <span>crossOriginIsolated: {typeof crossOriginIsolated !== 'undefined' ? String(crossOriginIsolated) : 'N/A'}</span>
          <span>GSAP + Zustand + Simplex Noise</span>
          <span>Apple Silicon Optimized</span>
        </footer>
      </main>
    </div>
  )
}

export default App
