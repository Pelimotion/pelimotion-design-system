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
import { resolveAssetPath } from '@/lib/utils'
import { TYPOGRAPHY_PRESETS } from '@/config/typography-presets'
import { Type, Play, Layers } from 'lucide-react'

export function LibraryPreview() {
  const { 
    libraryConfig, 
    activeLibraryAssetId,
    loadTypographyPreset,
    setActivePanel,
    localLibraryItems,
  } = useEditorStore()

  const localPreset = activeLibraryAssetId && activeLibraryAssetId.startsWith('preset-')
    ? TYPOGRAPHY_PRESETS.find(p => p.id === activeLibraryAssetId)
    : null

  const localSavedItem = localLibraryItems.find(item => item.id === activeLibraryAssetId)

  const activeAsset = libraryConfig.assets.find(a => a.id === activeLibraryAssetId)
  const category = libraryConfig.categories.find(c => c.id === activeAsset?.category)

  // Cloud asset check
  const isCloudAsset = activeLibraryAssetId && activeLibraryAssetId.includes('/') && !localPreset && !localSavedItem && !activeAsset;

  if (localPreset || localSavedItem) {
    const isTypo = localPreset || (localSavedItem && localSavedItem.type === 'typography')
    const name = localPreset ? localPreset.name : localSavedItem.name
    const description = localPreset ? localPreset.description : `Salvo em ${new Date(localSavedItem.createdAt).toLocaleString()}`
    
    // Config based on type
    let typoConfig = null;
    let genData = null;

    if (localPreset) typoConfig = localPreset.config;
    if (localSavedItem && localSavedItem.type === 'typography') typoConfig = localSavedItem.data;
    if (localSavedItem && localSavedItem.type === 'generative') genData = localSavedItem.data;

    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 600,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg), 0 0 30px hsla(191, 100%, 50%, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: isTypo 
                ? 'linear-gradient(135deg, var(--color-accent), #7c3aed)'
                : 'linear-gradient(135deg, #10b981, #047857)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              {isTypo ? <Type size={22} color="#fff" /> : <Layers size={22} color="#fff" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preset de {isTypo ? 'Tipografia' : 'Motor Generativo'}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                {name}
              </h2>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {description}
          </p>

          {/* Details Table */}
          <div style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-surface-border)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {isTypo && typoConfig && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Modo de Layout</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                    {typoConfig.layoutMode === 'sideBySide' ? 'Lado a Lado' : typoConfig.layoutMode === 'freeform' ? 'Livre' : 'Empilhado'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Espaçamento</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {typoConfig.layoutGap ? `${typoConfig.layoutGap}px` : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tempo em Tela</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {typoConfig.timeOnScreen}s
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Camadas de Texto</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {typoConfig.layers?.length || 0}
                  </span>
                </div>
              </>
            )}

            {!isTypo && genData && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Camadas Generativas</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {genData.layers?.length || 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Ruído (Wiggle)</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                    {genData.globalWiggle?.noiseType || 'simplex'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Text preview lines */}
          {isTypo && typoConfig && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Linhas de Texto:
              </span>
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-surface-border)',
                padding: '14px 16px',
              }}>
                {typoConfig.layers?.map((layer: any, index: number) => (
                  <div key={layer.id || index} style={{ display: 'flex', gap: 10, fontSize: '0.8rem', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-accent)', minWidth: 20, marginTop: 1 }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ color: 'var(--color-text-primary)', fontStyle: layer.fontStyle === 'italic' ? 'italic' : 'normal', fontWeight: layer.fontWeight }}>
                        "{layer.text}"
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Fonte: {layer.fontFamily} • Peso: {layer.fontWeight} • Tam: {layer.fontSize}vw
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={() => {
              if (isTypo && typoConfig) {
                loadTypographyPreset(typoConfig)
                setActivePanel('typography')
              } else if (genData) {
                useEditorStore.setState((state) => ({
                  generativeLayers: genData.layers || [],
                  motionConfig: {
                    ...state.motionConfig,
                    wiggle: genData.globalWiggle || state.motionConfig.wiggle
                  }
                }))
                setActivePanel('generative')
              }
            }}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #00d2ff 100%)',
              color: '#0a0a0f',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-glow)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
          >
            <Play size={16} />
            Aplicar este Template no Editor
          </button>
        </div>
      </div>
    )
  }

  if (!activeAsset && !category && !isCloudAsset) {
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

  const isVideo = activeAsset ? (activeAsset.format === 'mov' || activeAsset.format === 'webm' || activeAsset.format === 'mp4') : 
                  (isCloudAsset && (activeLibraryAssetId.endsWith('.mp4') || activeLibraryAssetId.endsWith('.mov') || activeLibraryAssetId.endsWith('.webm')));
  const isSvg = activeAsset ? activeAsset.format === 'svg' : false;

  let videoSrc;
  if (isCloudAsset) {
    const pullZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
    videoSrc = `https://${pullZone}.b-cdn.net/${activeLibraryAssetId}`;
  } else if (activeAsset && category) {
    videoSrc = resolveAssetPath(`${category.basePath}${activeAsset.filename}`);
  }

  const assetName = isCloudAsset ? activeLibraryAssetId.split('/')[1] : activeAsset?.name;
  const assetFormat = isCloudAsset ? activeLibraryAssetId.split('.').pop()?.toUpperCase() : activeAsset?.format.toUpperCase();

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
            webmSrc={videoSrc?.endsWith('.webm') ? videoSrc : undefined}
            hevcSrc={(videoSrc?.endsWith('.mov') || videoSrc?.endsWith('.mp4')) ? videoSrc : undefined}
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
              const svgData = SVG_CATALOG.find(s => s.path.includes(activeAsset?.filename || ''))
              if (svgData) {
                return (
                  <div style={{ width: '40%', height: '40%' }}>
                    <img src={resolveAssetPath(svgData.path)} alt={activeAsset?.name || 'svg'} style={{ width: '100%', height: '100%', filter: 'invert(1)' }} />
                  </div>
                )
              }
              return <span>SVG File: {activeAsset?.filename}</span>
            })()}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {assetName}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {activeAsset?.resolution || 'Auto'} • {assetFormat} • {activeAsset ? (activeAsset.hasAlpha ? 'Alpha Channel' : 'Solid') : 'Cloud Video'}
        </p>
      </div>
    </div>
  )
}
