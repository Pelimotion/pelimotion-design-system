import { useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { TypographyPreview } from '../Typography'
import { GenerativePreview } from '../Generative/GenerativePreview'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

export function CompositionPreview() {
  const { activePanel, compositionLayers, localLibraryItems } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    compositionLayers.forEach((layer) => {
      const el = document.getElementById(`comp-layer-${layer.id}`)
      if (el) {
        const tl = gsap.timeline({ id: `comp-tl-${layer.id}` })
        tl.set(el, { display: 'none', opacity: 0 }, 0)
        tl.set(el, { display: 'block', opacity: layer.transform.opacity }, layer.startTime)
        tl.set(el, { display: 'none', opacity: 0 }, layer.startTime + layer.duration)
      }
    })
  }, { dependencies: [compositionLayers], scope: containerRef })

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {compositionLayers.length === 0 ? (
        activePanel !== 'export' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              textAlign: 'center',
              color: 'var(--canvas-text-primary, var(--color-text-secondary))',
              padding: 32,
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: 12
            }}>
              <h2>Cena de Composição</h2>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: 8 }}>
                Adicione itens da Biblioteca à Linha do Tempo.
              </p>
            </div>
          </div>
        )
      ) : (
        compositionLayers.map(layer => {
          if (layer.hidden) return null;
          
          let content = null;

          if (layer.type === 'cloudAsset') {
            const isVideo = layer.assetId.endsWith('.mp4') || layer.assetId.endsWith('.mov') || layer.assetId.endsWith('.webm');
            if (isVideo) {
              const pullZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
              const videoSrc = `https://${pullZone}.b-cdn.net/${layer.assetId}`;
              content = (
                <video 
                  className="composition-video-layer"
                  data-start-time={layer.startTime}
                  src={videoSrc} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              )
            }
          } else {
            const libraryItem = localLibraryItems.find(i => i.id === layer.assetId);
            if (libraryItem) {
              if (libraryItem.type === 'typography') {
                content = <TypographyPreview overrideConfig={libraryItem.data} />
              } else if (libraryItem.type === 'generative') {
                content = <GenerativePreview overrideConfig={{ motionConfig: libraryItem.data, generativeLayers: libraryItem.data.layers || [] }} />
              }
            }
          }
          
          return (
            <div 
              key={layer.id}
              id={`comp-layer-${layer.id}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${layer.transform.x}px, ${layer.transform.y}px) scale(${layer.transform.scale}) rotate(${layer.transform.rotation}deg)`,
                opacity: 0,
                display: 'none',
                width: '100%', 
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {content || (
                <div style={{ background: 'rgba(255,0,0,0.5)', padding: 20 }}>
                  Invalid Asset: {layer.assetId}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
