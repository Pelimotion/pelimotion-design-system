/**
 * AlphaVideoPlayer — Phase 4 (revisado na auditoria)
 *
 * Player especializado para vídeos com canal Alpha.
 * - Dual-source: WebM VP9 para Chrome/Edge/Firefox, HEVC para Safari
 * - Fundo xadrez (checkerboard) para validar transparência
 * - Tratamento correto de erros: só sinaliza falha depois que o elemento
 *   <video> esgota todas as fontes (evento 'error' no <video>, não em <source>)
 */
import { useEffect, useRef, useState } from 'react'

interface AlphaVideoPlayerProps {
  webmSrc?: string;
  hevcSrc?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export function AlphaVideoPlayer({ webmSrc, hevcSrc, autoPlay = true, loop = true }: AlphaVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Reload + autoplay when sources change
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setError(false)
    setLoaded(false)
    setIsPlaying(false)
    video.load()

    const onCanPlay = () => {
      setLoaded(true)
      if (autoPlay) {
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      }
    }

    // Only fire error when the VIDEO element itself exhausts all sources —
    // individual <source> errors are handled by the browser and don't mean failure yet.
    const onError = () => {
      setError(true)
      setIsPlaying(false)
    }

    video.addEventListener('canplaythrough', onCanPlay)
    video.addEventListener('error', onError)
    return () => {
      video.removeEventListener('canplaythrough', onCanPlay)
      video.removeEventListener('error', onError)
    }
  }, [webmSrc, hevcSrc, autoPlay])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video || error) return
    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(console.error)
    }
    // State will be synced by onPlay/onPause events
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-surface-border)',
      background: 'transparent',
    }}>
      {/* Checkerboard — prova o canal alpha */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a),
          linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
        backgroundColor: '#1a1a1a',
      }} />

      {/* Elemento de vídeo */}
      <video
        ref={videoRef}
        loop={loop}
        muted
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{
          width: '100%', height: '100%',
          objectFit: 'contain',
          position: 'relative', zIndex: 1,
          cursor: 'pointer',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
        onClick={togglePlay}
      >
        {/* WebM primeiro: suporte mais amplo (Chrome, Edge, Firefox) */}
        {webmSrc && <source src={webmSrc} type='video/webm; codecs="vp9"' />}
        {/* HEVC: Safari / Apple Devices com alpha nativo */}
        {hevcSrc && <source src={hevcSrc} type='video/mp4; codecs="hvc1"' />}
      </video>

      {/* Overlay de play/pause */}
      {!isPlaying && !error && loaded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'hsla(0, 0%, 0%, 0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '1.2rem',
            border: '1px solid hsla(0, 0%, 100%, 0.15)',
          }}>
            ▶
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {!loaded && !error && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: 8,
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--color-surface-border)', borderTopColor: 'var(--color-accent)', animation: 'spin 0.8s linear infinite' }} />
          Carregando vídeo...
        </div>
      )}

      {/* Overlay de erro — asset não encontrado */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'hsla(0,0%,0%,0.6)', backdropFilter: 'blur(4px)',
          color: 'var(--color-error)', fontSize: '0.8rem',
          textAlign: 'center', padding: 24, gap: 6,
        }}>
          <span style={{ fontSize: '1.8rem' }}>⚠️</span>
          <span style={{ fontWeight: 600 }}>Arquivo não encontrado</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem' }}>
            Adicione o arquivo em public/assets/alpha-movs/ e atualize library.json
          </span>
        </div>
      )}
    </div>
  )
}

