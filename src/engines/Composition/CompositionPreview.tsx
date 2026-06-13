import { useEditorStore } from '@/store/useEditorStore'

export function CompositionPreview() {
  const { activePanel, compositionLayers, localLibraryItems } = useEditorStore()

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                Adicione itens na Linha do Tempo para visualizá-los.
              </p>
            </div>
          </div>
        )
      ) : (
        compositionLayers.map(layer => {
          if (layer.hidden) return null;
          const libraryItem = localLibraryItems.find(i => i.id === layer.assetId);
          
          return (
            <div 
              key={layer.id}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${layer.transform.x}px, ${layer.transform.y}px) scale(${layer.transform.scale}) rotate(${layer.transform.rotation}deg)`,
                opacity: layer.transform.opacity,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255,255,255,0.5)',
                padding: '20px 40px',
                borderRadius: 8,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{layer.name}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                [ {libraryItem?.type || layer.type} ]
              </span>
              <div style={{ fontSize: '0.7rem', marginTop: 8, fontFamily: 'monospace', color: 'var(--color-accent)' }}>
                {layer.startTime}s – {layer.startTime + layer.duration}s
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
