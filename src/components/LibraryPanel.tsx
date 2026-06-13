/**
 * LibraryPanel — Phase 4 (Updated for Cloud Storage)
 *
 * Fetches generated assets from Bunny.net and displays them in tabs.
 */
import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Film, Download, Layers, Type, Combine, Image as ImageIcon, Play, Sparkles, Trash2 } from 'lucide-react'
import { downloadFile } from '@/lib/downloadHandler'
import { fetchBunnyAssets, type BunnyAsset } from '@/lib/bunnyStorage'
import { TYPOGRAPHY_PRESETS } from '@/config/typography-presets'
import type { CompositionLayer } from '@/types/motion.types'

const TABS = [
  { id: 'Tipografia', label: 'Tipografia', icon: Type },
  { id: 'Generativo', label: 'Generativo', icon: Layers },
  { id: 'Logo', label: 'Logo', icon: ImageIcon },
  { id: 'Transição', label: 'Transição', icon: Combine },
]

export function LibraryPanel() {
  const { 
    activeLibraryAssetId, 
    setActiveLibraryAssetId,
    loadTypographyPreset,
    setActivePanel,
    localLibraryItems,
    globalLibraryItems,
    addCompositionLayer,
    exportConfig
  } = useEditorStore()
  
  const [activeTab, setActiveTab] = useState('Tipografia')
  const [assets, setAssets] = useState<BunnyAsset[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchBunnyAssets(activeTab).then(res => {
      if (active) {
        // Sort by LastChanged descending (newest first)
        const sorted = res.sort((a, b) => new Date(b.LastChanged).getTime() - new Date(a.LastChanged).getTime())
        setAssets(sorted)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [activeTab])

  const handleDownload = (asset: BunnyAsset) => {
    // Generate the public pull zone URL
    const pullZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE
    const url = `https://${pullZone}.b-cdn.net/${activeTab}/${asset.ObjectName}`
    downloadFile(url, asset.ObjectName)
  }

  const handleAddToComposition = (id: string, name: string, type: 'localAsset' | 'cloudAsset' = 'localAsset', duration: number = 3) => {
    const newLayer: CompositionLayer = {
      id: crypto.randomUUID(),
      name: name,
      type: type,
      assetId: id,
      startTime: 0,
      duration: Math.min(duration, exportConfig.duration),
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    }
    addCompositionLayer(newLayer)
    setActivePanel('composition')
  }

  const renderCloudAssetsList = (isTipografiaTab: boolean) => {
    if (loading) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '24px 0' }}>
          Carregando nuvem...
        </div>
      )
    }

    if (assets.length === 0) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '24px 0', textAlign: 'center' }}>
          {isTipografiaTab ? 'Nenhum arquivo na nuvem encontrado.' : 'Nenhum arquivo encontrado.'}
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {assets.map((asset) => {
          const cloudId = `${activeTab}/${asset.ObjectName}`
          const isActive = activeLibraryAssetId === cloudId
          const isVideo = asset.ObjectName.endsWith('.mp4') || asset.ObjectName.endsWith('.mov')
          
          return (
            <div
              key={asset.ObjectName}
              onClick={() => setActiveLibraryAssetId(cloudId)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', cursor: 'pointer', transition: 'all 0.2s',
                background: isActive ? 'var(--color-surface-glass-hover)' : 'var(--color-surface-glass)',
                border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                {isVideo ? <Film size={16} color="var(--color-text-secondary)" /> : <ImageIcon size={16} color="var(--color-text-secondary)" />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                  <span style={{ 
                    fontSize: '0.8rem', fontWeight: isActive ? 600 : 500, 
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: 140
                  }}>
                    {asset.ObjectName}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {(asset.Length / 1024 / 1024).toFixed(2)} MB • {new Date(asset.LastChanged).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToComposition(cloudId, asset.ObjectName, 'cloudAsset')
                  }}
                  title="Adicionar à Composição"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
                    borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-surface-glass)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Layers size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(asset)
                  }}
                  title="Baixar Arquivo"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
                    borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-surface-glass)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto', paddingRight: 4 }}
      className="custom-scrollbar"
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-bg-elevated)', padding: 4, borderRadius: 'var(--radius-sm)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setActiveLibraryAssetId(null)
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '6px 0', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                background: isActive ? 'var(--color-surface-glass)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--color-surface-border)' : 'transparent'}`,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'Tipografia' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Presets locais / templates */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Templates Editoriais (Sessão & Globais)
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TYPOGRAPHY_PRESETS.map((preset) => {
              const isActive = activeLibraryAssetId === preset.id
              return (
                <div
                  key={preset.id}
                  onClick={() => setActiveLibraryAssetId(preset.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? 'var(--color-surface-glass-hover)' : 'var(--color-surface-glass)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-text-ghost)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-surface-border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Type size={14} color={isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span style={{ 
                        fontSize: '0.8rem', fontWeight: 700, 
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' 
                      }}>
                        {preset.name}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.6rem', padding: '2px 6px', borderRadius: 99, 
                      background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' 
                    }}>
                      {preset.density}
                    </span>
                  </div>
                  
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {preset.description}
                  </span>
                  
                  {isActive && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          loadTypographyPreset(preset.config)
                          setActivePanel('typography')
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-accent)', color: '#0a0a0f',
                          border: 'none', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Play size={12} /> Editor
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToComposition(preset.id, preset.name, 'localAsset', preset.config.timeOnScreen || 3)
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Layers size={12} /> Add Comp
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {localLibraryItems.filter(item => item.type === 'typography').map((preset) => {
              const isActive = activeLibraryAssetId === preset.id
              return (
                <div
                  key={preset.id}
                  onClick={() => setActiveLibraryAssetId(preset.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? 'var(--color-surface-glass-hover)' : 'var(--color-surface-glass)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-text-ghost)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-surface-border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Type size={14} color={isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span style={{ 
                        fontSize: '0.8rem', fontWeight: 700, 
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' 
                      }}>
                        {preset.name}
                      </span>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useEditorStore.getState().updateTypography({
                            layers: preset.data.layers,
                            layoutMode: preset.data.layoutMode,
                            layoutGap: preset.data.layoutGap,
                            timeOnScreen: preset.data.timeOnScreen,
                            globalIdleMotion: preset.data.globalIdleMotion
                          })
                          useEditorStore.getState().updateTrail(preset.data.trail)
                          setActivePanel('typography')
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-accent)', color: '#0a0a0f',
                          border: 'none', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Play size={12} /> Editor
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToComposition(preset.id, preset.name, 'localAsset', preset.data.timeOnScreen || 3)
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Layers size={12} /> Add Comp
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {globalLibraryItems.filter(item => item.type === 'typography').map((preset) => {
              const isActive = activeLibraryAssetId === preset.id
              return (
                <div
                  key={preset.id}
                  onClick={() => setActiveLibraryAssetId(preset.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? 'var(--color-surface-glass-hover)' : 'var(--color-surface-glass)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-text-ghost)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-surface-border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={14} color={isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span style={{ 
                        fontSize: '0.8rem', fontWeight: 700, 
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' 
                      }}>
                        {preset.name}
                      </span>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useEditorStore.getState().updateTypography({
                            layers: preset.data.layers,
                            layoutMode: preset.data.layoutMode,
                            layoutGap: preset.data.layoutGap,
                            timeOnScreen: preset.data.timeOnScreen,
                            globalIdleMotion: preset.data.globalIdleMotion
                          })
                          useEditorStore.getState().updateTrail(preset.data.trail)
                          setActivePanel('typography')
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-accent)', color: '#0a0a0f',
                          border: 'none', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Play size={12} /> Editor
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToComposition(preset.id, preset.name, 'localAsset', preset.data.timeOnScreen || 3)
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Layers size={12} /> Add Comp
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useEditorStore.getState().removeFromGlobalLibrary(preset.id)
                        }}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 4
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ height: 1, background: 'var(--color-surface-border)', margin: '8px 0' }} />

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Arquivos na Nuvem (Bunny CDN)
          </div>
          
          {renderCloudAssetsList(true)}
        </div>
      ) : activeTab === 'Generativo' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Presets locais / templates */}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Composições Generativas (Sessão & Globais)
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {localLibraryItems.filter(item => item.type === 'generative').map((preset) => {
              const isActive = activeLibraryAssetId === preset.id
              return (
                <div
                  key={preset.id}
                  onClick={() => setActiveLibraryAssetId(preset.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? 'var(--color-surface-glass-hover)' : 'var(--color-surface-glass)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-text-ghost)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-surface-border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Layers size={14} color={isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span style={{ 
                        fontSize: '0.8rem', fontWeight: 700, 
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' 
                      }}>
                        {preset.name}
                      </span>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useEditorStore.getState().clearGenerativeLayers()
                          preset.data.layers.forEach((l: any) => useEditorStore.getState().addGenerativeLayer(l))
                          useEditorStore.getState().updateWiggle(preset.data.globalWiggle)
                          setActivePanel('generative')
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-accent)', color: '#0a0a0f',
                          border: 'none', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Play size={12} /> Editor
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToComposition(preset.id, preset.name, 'localAsset', 3)
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Layers size={12} /> Add Comp
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {globalLibraryItems.filter(item => item.type === 'generative').map((preset) => {
              const isActive = activeLibraryAssetId === preset.id
              return (
                <div
                  key={preset.id}
                  onClick={() => setActiveLibraryAssetId(preset.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? 'var(--color-surface-glass-hover)' : 'var(--color-surface-glass)',
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-text-ghost)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-surface-border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={14} color={isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span style={{ 
                        fontSize: '0.8rem', fontWeight: 700, 
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' 
                      }}>
                        {preset.name}
                      </span>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useEditorStore.getState().clearGenerativeLayers()
                          preset.data.layers.forEach((l: any) => useEditorStore.getState().addGenerativeLayer(l))
                          useEditorStore.getState().updateWiggle(preset.data.globalWiggle)
                          setActivePanel('generative')
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-accent)', color: '#0a0a0f',
                          border: 'none', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Play size={12} /> Editor
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToComposition(preset.id, preset.name, 'localAsset', 3)
                        }}
                        style={{
                          flex: 1, padding: '6px 12px',
                          background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Layers size={12} /> Add Comp
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          useEditorStore.getState().removeFromGlobalLibrary(preset.id)
                        }}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 4
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {(localLibraryItems.filter(item => item.type === 'generative').length === 0 && globalLibraryItems.filter(item => item.type === 'generative').length === 0) && (
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Nenhuma composição salva.</span>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--color-surface-border)', margin: '8px 0' }} />

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Arquivos na Nuvem (Bunny CDN)
          </div>
          
          {renderCloudAssetsList(false)}
        </div>
      ) : (
        renderCloudAssetsList(false)
      )}
    </div>
  )
}
