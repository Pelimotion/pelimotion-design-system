import { useEffect, useState, useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { fetchBunnyAssets, type BunnyAsset } from '@/lib/bunnyStorage'
import { TYPOGRAPHY_PRESETS } from '@/config/typography-presets'
import { downloadFile } from '@/lib/downloadHandler'
import { Type, Layers, Film, ImageIcon, Download, Sparkles, Plus, Combine, Music } from 'lucide-react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

function LazyAssetCard({ 
  asset, 
  videoSrc, 
  isVideo, 
  isAudio, 
  onDownload, 
  onAdd 
}: { 
  asset: BunnyAsset; videoSrc: string; isVideo: boolean; isAudio: boolean;
  onDownload: () => void; onAdd: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        setInView(true)
        // Keep it loaded once it enters view
        observer.disconnect()
      }
    }, { rootMargin: '200px' }) // load when 200px near viewport
    
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef}
      className="glass-panel asset-card" 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
          id: asset.ObjectName,
          name: asset.ObjectName,
          type: 'cloudAsset'
        }));
      }}
      style={{
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'grab',
        opacity: 0, transform: 'translateY(20px)' // Initial state for GSAP
      }} 
      onMouseEnter={(e) => { 
        e.currentTarget.style.transform = 'translateY(-4px)'; 
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; 
        if(videoRef.current && inView) videoRef.current.play().catch(()=>{}); 
      }} 
      onMouseLeave={(e) => { 
        e.currentTarget.style.transform = 'none'; 
        e.currentTarget.style.boxShadow = 'none'; 
        if(videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime=0; } 
      }}
    >
      {isAudio ? (
        <div style={{ width: '100%', padding: '24px 16px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--color-surface-border)' }}>
          <audio controls src={videoSrc} style={{ width: '100%' }} preload="none" />
        </div>
      ) : (
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
          {isVideo ? (
            inView ? (
              <video ref={videoRef} src={videoSrc} muted playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null
          ) : (
            <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={32} color="var(--color-text-muted)" />
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="icon-button" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} title="Download Original">
              <Download size={14} color="#fff" />
            </button>
          </div>
        </div>
      )}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {asset.ObjectName}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <span>{(asset.Length / 1024 / 1024).toFixed(2)} MB</span>
          <span>{new Date(asset.LastChanged).toLocaleDateString()}</span>
        </div>
        <button 
          onClick={onAdd} 
          style={{ width: '100%', padding: '10px 0', background: 'var(--color-surface-hover)', border: '1px solid var(--color-surface-border)', borderRadius: 8, color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600, marginTop: 4, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
        >
          <Plus size={14} /> {isAudio ? 'Usar como Áudio' : 'Usar na Composição'}
        </button>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'Tipografia', label: 'Tipografia', icon: Type },
  { id: 'Generativo', label: 'Generativo', icon: Layers },
  { id: 'Logo', label: 'Logo', icon: ImageIcon },
  { id: 'Transição', label: 'Transição', icon: Combine },
  { id: 'Audio', label: 'Áudio', icon: Music },
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

  // GSAP Entrance Animation
  useGSAP(() => {
    if (assets.length > 0) {
      gsap.to('.asset-card', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out',
        clearProps: 'transform' // allow hover effects to take over
      })
    }
  }, [assets])

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
                  {item.type === 'typography' || item.type === 'generative' ? (
                    <button onClick={() => {
                      if (item.type === 'typography') { loadTypographyPreset(item.data); setActivePanel('typography'); }
                      else if (item.type === 'generative') { useEditorStore.setState(s => ({ generativeLayers: item.data.layers || [], motionConfig: { ...s.motionConfig, wiggle: item.data.globalWiggle || s.motionConfig.wiggle } })); setActivePanel('generative'); }
                    }} style={{ flex: 1, padding: '10px 0', background: 'var(--color-surface-hover)', border: '1px solid var(--color-surface-border)', borderRadius: 8, color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                      <Sparkles size={14} /> Editar
                    </button>
                  ) : (
                    <div style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-surface-border)', borderRadius: 8, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                      <Combine size={14} /> Mídia ({item.type})
                    </div>
                  )}
                  <button onClick={() => {
                    if (item.type === 'audio') {
                      useEditorStore.getState().addAudioTrack({
                        id: crypto.randomUUID(),
                        name: item.name,
                        src: item.data,
                        startTime: 0,
                        duration: exportConfig.duration,
                        volume: 1,
                      });
                      setActivePanel('composition');
                    } else {
                      handleAddToComposition(item.id, item.name, 'localAsset', item.data.timeOnScreen || 5)
                    }
                  }} style={{ flex: 1, padding: '10px 0', background: 'var(--color-accent)', border: 'none', borderRadius: 8, color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}>
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
          <div className="assets-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24
          }}>
            {assets.map((asset) => {
              const cloudId = `${activeLibraryTab}/${asset.ObjectName}`
              const isVideo = asset.ObjectName.endsWith('.mp4') || asset.ObjectName.endsWith('.mov')
              const isAudio = activeLibraryTab === 'Audio'
              const pullZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE
              const videoSrc = `https://${pullZone}.b-cdn.net/${cloudId}`
              
              return (
                <LazyAssetCard
                  key={cloudId}
                  asset={asset}
                  videoSrc={videoSrc}
                  isVideo={isVideo}
                  isAudio={isAudio}
                  onDownload={() => handleDownload(asset)}
                  onAdd={() => {
                    if (isAudio) {
                      useEditorStore.getState().addAudioTrack({
                        id: crypto.randomUUID(),
                        name: asset.ObjectName,
                        src: videoSrc,
                        startTime: 0,
                        duration: exportConfig.duration,
                        volume: 1,
                      })
                      setActivePanel('composition')
                    } else {
                      handleAddToComposition(cloudId, asset.ObjectName, 'cloudAsset')
                    }
                  }}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
