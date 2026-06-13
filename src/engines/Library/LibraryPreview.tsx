import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { fetchBunnyAssets, type BunnyAsset } from '@/lib/bunnyStorage'
import { TYPOGRAPHY_PRESETS } from '@/config/typography-presets'
import { downloadFile } from '@/lib/downloadHandler'
import { Type, Layers, Film, ImageIcon, Download, Sparkles, Plus, Combine } from 'lucide-react'

const TABS = [
  { id: 'Tipografia', label: 'Tipografia', icon: Type },
  { id: 'Generativo', label: 'Generativo', icon: Layers },
  { id: 'Logo', label: 'Logo', icon: ImageIcon },
  { id: 'Transição', label: 'Transição', icon: Combine },
]

export function LibraryPreview() {
  const { 
    activeLibraryTab, 
    localLibraryItems,
    setActivePanel,
    loadTypographyPreset,
    addCompositionLayer,
    exportConfig
  } = useEditorStore()

  const [assets, setAssets] = useState<BunnyAsset[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch Cloud Assets for the active tab
  useEffect(() => {
    let active = true
    setLoading(true)
    fetchBunnyAssets(activeLibraryTab).then(res => {
      if (active) {
        const sorted = res.sort((a, b) => new Date(b.LastChanged).getTime() - new Date(a.LastChanged).getTime())
        setAssets(sorted)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [activeLibraryTab])

  const handleDownload = (asset: BunnyAsset) => {
    const pullZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE
    const url = `https://${pullZone}.b-cdn.net/${activeLibraryTab}/${asset.ObjectName}`
    downloadFile(url, asset.ObjectName)
  }

  const handleAddToComposition = (id: string, name: string, type: 'localAsset' | 'cloudAsset' = 'localAsset', duration: number = 3) => {
    addCompositionLayer({
      id: crypto.randomUUID(),
      name: name,
      type: type,
      assetId: id,
      startTime: 0,
      duration: Math.min(duration, exportConfig.duration),
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    })
    setActivePanel('composition')
  }

  // Filter Local Items based on active tab
  const localItems = localLibraryItems.filter(item => {
    if (activeLibraryTab === 'Tipografia') return item.type === 'typography'
    if (activeLibraryTab === 'Generativo') return item.type === 'generative'
    return false
  })

  return (
    <div style={{ width: '100%', maxWidth: 1600, margin: '0 auto', paddingBottom: 64 }}>
      <header style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>
            Library
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
            Explorar presets, media na nuvem e templates locais.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, background: 'var(--color-bg-elevated)', padding: 6, borderRadius: 'var(--radius-full)', border: '1px solid var(--color-surface-border)' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeLibraryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => useEditorStore.getState().setActiveLibraryTab(tab.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? '#000' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* NATIVE PRESETS (Tipografia only for now) */}
      {activeLibraryTab === 'Tipografia' && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Type size={18} color="var(--color-accent)" /> Presets Originais
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24
          }}>
            {TYPOGRAPHY_PRESETS.map((preset) => (
              <div key={preset.id} className="glass-panel" style={{
                borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.2s', cursor: 'pointer',
              }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{preset.name}</h3>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: preset.density === 'Alta' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', color: preset.density === 'Alta' ? '#f87171' : '#60a5fa' }}>
                      {preset.density}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{preset.description}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button onClick={() => { loadTypographyPreset(preset.config); setActivePanel('typography'); }} style={{ flex: 1, padding: '10px 0', background: 'var(--color-surface-hover)', border: '1px solid var(--color-surface-border)', borderRadius: 8, color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                    <Sparkles size={14} /> Editar
                  </button>
                  <button onClick={() => handleAddToComposition(preset.id, preset.name, 'localAsset', preset.config.timeOnScreen || 3)} style={{ flex: 1, padding: '10px 0', background: 'var(--color-accent)', border: 'none', borderRadius: 8, color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}>
                    <Plus size={14} /> Compor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LOCAL ITEMS */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={18} color="var(--color-accent)" /> Salvos na Sessão
        </h2>
        {localItems.length === 0 ? (
          <div style={{ padding: 40, background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-surface-border)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Nenhum projeto local salvo nesta sessão para esta categoria.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24
          }}>
            {localItems.map((item) => (
              <div key={item.id} className="glass-panel" style={{
                borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.2s',
              }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{item.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Salvo às {new Date(item.createdAt).toLocaleTimeString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button onClick={() => {
                    if (item.type === 'typography') { loadTypographyPreset(item.data); setActivePanel('typography'); }
                    else if (item.type === 'generative') { useEditorStore.setState(s => ({ generativeLayers: item.data.layers || [], motionConfig: { ...s.motionConfig, wiggle: item.data.globalWiggle || s.motionConfig.wiggle } })); setActivePanel('generative'); }
                  }} style={{ flex: 1, padding: '10px 0', background: 'var(--color-surface-hover)', border: '1px solid var(--color-surface-border)', borderRadius: 8, color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                    <Sparkles size={14} /> Editar
                  </button>
                  <button onClick={() => handleAddToComposition(item.id, item.name, 'localAsset', item.data.timeOnScreen || 3)} style={{ flex: 1, padding: '10px 0', background: 'var(--color-accent)', border: 'none', borderRadius: 8, color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}>
                    <Plus size={14} /> Compor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CLOUD ASSETS */}
      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Film size={18} color="var(--color-accent)" /> Nuvem (Bunny CDN)
        </h2>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Sincronizando com a nuvem...</div>
        ) : assets.length === 0 ? (
          <div style={{ padding: 40, background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-surface-border)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Nenhum arquivo encontrado nesta categoria.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24
          }}>
            {assets.map((asset) => {
              const cloudId = `${activeLibraryTab}/${asset.ObjectName}`
              const isVideo = asset.ObjectName.endsWith('.mp4') || asset.ObjectName.endsWith('.mov')
              const pullZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE
              const videoSrc = `https://${pullZone}.b-cdn.net/${cloudId}`
              
              return (
                <div key={cloudId} className="glass-panel" style={{
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'pointer'
                }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; const v = e.currentTarget.querySelector('video'); if(v) v.play().catch(()=>{}); }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; const v = e.currentTarget.querySelector('video'); if(v) { v.pause(); v.currentTime=0; } }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                    {isVideo ? (
                      <video src={videoSrc} muted playsInline preload="none" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={32} color="var(--color-text-muted)" />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(asset); }} className="icon-button" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} title="Download Original">
                        <Download size={14} color="#fff" />
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asset.ObjectName}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span>{(asset.Length / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{new Date(asset.LastChanged).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => handleAddToComposition(cloudId, asset.ObjectName, 'cloudAsset')} style={{ width: '100%', padding: '10px 0', background: 'var(--color-surface-hover)', border: '1px solid var(--color-surface-border)', borderRadius: 8, color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600, marginTop: 4 }}>
                      <Plus size={14} /> Usar na Composição
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
