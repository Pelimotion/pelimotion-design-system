/**
 * LibraryModal — Pelimotion v6.3
 *
 * Full-screen library overlay (glassmorphism modal).
 * Shows local/global assets + premium templates in a rich grid.
 * - Animated hover video previews
 * - Premium lock overlays with blur
 * - Professional empty state
 */
import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { X, Upload, Search, Image, Video, Music, Folder, Lock, Sparkles, Crown, Star } from 'lucide-react';

interface LibraryModalProps {
  onClose: () => void;
}

// ─── Premium Templates (seeded) ──────────────────────────────────────────────

const PREMIUM_TEMPLATES = [
  {
    id: 'tpl-1', name: 'Cinematic Title Reveal', category: 'Motion',
    tags: ['premium'], isPremium: true,
    gradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a3a 50%, #0d1a3a 100%)',
    accentColor: '#7c3aed',
  },
  {
    id: 'tpl-2', name: 'Neon Grid Loop', category: 'Loop',
    tags: ['premium'], isPremium: true,
    gradient: 'linear-gradient(135deg, #0a0f0a 0%, #0a3a1a 50%, #0f3a2a 100%)',
    accentColor: '#00cc88',
  },
  {
    id: 'tpl-3', name: 'Glitch Text Burst', category: 'Typography',
    tags: ['premium'], isPremium: true,
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3a0a1a 50%, #1a0a2a 100%)',
    accentColor: '#ff4488',
  },
  {
    id: 'tpl-4', name: 'Organic Flow', category: 'Generative',
    tags: ['premium'], isPremium: true,
    gradient: 'linear-gradient(135deg, #0a100f 0%, #0d2a2a 50%, #0a1a3a 100%)',
    accentColor: '#00aaff',
  },
  {
    id: 'tpl-5', name: 'Brand Reveal Kit', category: 'Brand',
    tags: ['premium'], isPremium: true,
    gradient: 'linear-gradient(135deg, #100a0a 0%, #3a1a00 50%, #3a2a00 100%)',
    accentColor: '#ffaa00',
  },
  {
    id: 'tpl-6', name: 'Social Media Pack', category: 'Social',
    tags: ['premium'], isPremium: false, // one free template
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0d0a2a 100%)',
    accentColor: '#6B5CE7',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: <Folder size={13} /> },
  { id: 'templates', label: 'Templates', icon: <Star size={13} />, badge: 'NOVO' },
  { id: 'image', label: 'Imagens', icon: <Image size={13} /> },
  { id: 'video', label: 'Vídeos', icon: <Video size={13} /> },
  { id: 'audio', label: 'Áudio', icon: <Music size={13} /> },
];

// ─── VideoThumbnail (hover-plays video) ──────────────────────────────────────

function VideoThumbnail({ src, style }: { src: string; style?: React.CSSProperties }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (hovered) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [hovered]);

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {!hovered && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <Video size={22} color="rgba(255,255,255,0.7)" />
        </div>
      )}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 4, right: 4,
          background: 'rgba(0,0,0,0.6)', borderRadius: 3,
          fontSize: '0.55rem', color: '#fff', padding: '1px 5px',
          fontFamily: 'var(--font-mono)',
        }}>▶ LIVE</div>
      )}
    </div>
  );
}

// ─── PremiumCard (seeded template) ───────────────────────────────────────────

function PremiumCard({ template, onUpgrade }: { template: typeof PREMIUM_TEMPLATES[0]; onUpgrade: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10, overflow: 'hidden', cursor: template.isPremium ? 'pointer' : 'pointer',
        border: `1px solid ${hovered ? template.accentColor + '60' : 'var(--color-surface-border)'}`,
        background: template.gradient,
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        aspectRatio: '16/10',
        display: 'flex', flexDirection: 'column',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 32px ${template.accentColor}30` : 'none',
        position: 'relative',
      }}
      onClick={template.isPremium ? onUpgrade : undefined}
    >
      {/* Animated background accents */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        opacity: hovered ? 0.6 : 0.3,
        transition: 'opacity 0.2s',
      }}>
        <div style={{
          position: 'absolute', width: 60, height: 60,
          borderRadius: '50%', background: template.accentColor,
          filter: 'blur(20px)',
          top: '20%', left: '60%',
          animation: 'floatPulse 3s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 40, height: 40,
          borderRadius: '50%', background: template.accentColor,
          filter: 'blur(15px)',
          top: '60%', left: '20%',
          animation: 'floatPulse 4s ease-in-out infinite reverse',
        }} />
      </div>

      {/* Category label */}
      <div style={{
        position: 'absolute', top: 6, left: 6,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        borderRadius: 4,
        fontSize: '0.55rem', fontWeight: 600,
        color: template.accentColor,
        padding: '2px 6px',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.05em',
      }}>
        {template.category.toUpperCase()}
      </div>

      {/* Premium lock overlay */}
      {template.isPremium && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          background: 'linear-gradient(135deg, #7c3aed, #6B5CE7)',
          color: '#fff',
          fontSize: '0.55rem', fontWeight: 700,
          padding: '2px 6px', borderRadius: 4,
          display: 'flex', alignItems: 'center', gap: 3,
          boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
        }}>
          <Lock size={7} /> STUDIO
        </div>
      )}

      {/* Name */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 8px 7px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        fontSize: '0.65rem', fontWeight: 600,
        color: '#fff',
        fontFamily: 'var(--font-sans)',
      }}>
        {template.name}
      </div>

      {/* Hover CTA */}
      {hovered && template.isPremium && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed, #6B5CE7)',
            color: '#fff', fontSize: '0.68rem', fontWeight: 700,
            padding: '7px 14px', borderRadius: 7,
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: '0 8px 20px rgba(124,58,237,0.5)',
          }}>
            <Crown size={12} /> Fazer Upgrade
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LibraryModal (Main) ─────────────────────────────────────────────────────

export function LibraryModal({ onClose }: LibraryModalProps) {
  const { localLibraryItems, globalLibraryItems, addCompositionLayer, currentTime } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const allItems = [...localLibraryItems, ...globalLibraryItems];

  const filtered = (() => {
    if (activeCategory === 'templates') return [];
    return allItems.filter(item => {
      const matchCat = activeCategory === 'all' || item.type === activeCategory;
      const matchSearch = !searchQuery || item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  })();

  const categoryCounts = {
    all: allItems.length,
    templates: PREMIUM_TEMPLATES.length,
    image: allItems.filter(i => i.type === 'image').length,
    video: allItems.filter(i => i.type === 'video').length,
    audio: allItems.filter(i => i.type === 'audio').length,
  };

  const handleAddToCanvas = (item: any) => {
    addCompositionLayer({
      id: crypto.randomUUID(),
      name: item.name,
      type: 'localAsset',
      assetId: item.id,
      startTime: currentTime,
      duration: 5,
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const state = useEditorStore.getState();
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      state.saveToLocalLibrary({
        id: crypto.randomUUID(),
        name: file.name,
        type: isVideo ? 'video' : isImage ? 'image' : 'audio',
        createdAt: Date.now(),
        data: url,
      });
    });
  };

  const handleUpgrade = () => {
    alert("Assine o Pelimotion Studio para desbloquear todos os templates premium e remover a marca d'água!");
  };

  const showingTemplates = activeCategory === 'templates';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'backdropIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: 'min(900px, 92vw)', height: 'min(620px, 88vh)',
        background: 'linear-gradient(145deg, #111111 0%, #0d0d0d 100%)',
        border: '1px solid hsla(0,0%,100%,0.08)',
        borderRadius: 20,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset',
        overflow: 'hidden',
        animation: 'slideUpIn 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px',
          borderBottom: '1px solid var(--color-surface-border)', flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Biblioteca de Assets
            </span>
            <span style={{
              fontSize: '0.6rem', color: 'var(--color-text-ghost)',
              background: 'hsla(0,0%,100%,0.05)',
              padding: '2px 7px', borderRadius: 4,
              fontFamily: 'var(--font-mono)',
            }}>
              {allItems.length} assets • {PREMIUM_TEMPLATES.length} templates
            </span>
          </div>

          {/* Search */}
          {!showingTemplates && (
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-ghost)' }} />
              <input
                type="text" placeholder="Buscar assets…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                  background: 'hsla(0,0%,100%,0.05)', border: '1px solid var(--color-surface-border)',
                  borderRadius: 8, color: 'var(--color-text-primary)', fontSize: '0.74rem',
                  fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-surface-border)'}
              />
            </div>
          )}

          {/* Upload */}
          {!showingTemplates && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
              background: 'hsla(247,74%,63%,0.1)', border: '1px solid hsla(247,74%,63%,0.25)',
              color: 'var(--color-accent)', fontSize: '0.72rem', fontWeight: 600,
              fontFamily: 'var(--font-sans)', transition: 'all 0.15s ease',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(247,74%,63%,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'hsla(247,74%,63%,0.1)'}
            >
              <Upload size={13} /> Upload
              <input type="file" multiple accept="image/*,video/*,audio/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
          )}

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-ghost)', padding: 6, borderRadius: 7, display: 'flex', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-ghost)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Sidebar categories */}
          <div style={{
            width: 168, flexShrink: 0, borderRight: '1px solid var(--color-surface-border)',
            padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {CATEGORIES.map(cat => {
              const count = categoryCounts[cat.id as keyof typeof categoryCounts] ?? 0;
              const isActive = activeCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, border: 'none',
                    background: isActive ? 'hsla(247,74%,63%,0.1)' : 'transparent',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    cursor: 'pointer', fontSize: '0.74rem', fontFamily: 'var(--font-sans)',
                    textAlign: 'left', width: '100%', transition: 'all 0.12s ease',
                    boxShadow: isActive ? 'inset 0 0 0 1px hsla(247,74%,63%,0.2)' : 'none',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'hsla(0,0%,100%,0.04)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {cat.icon}
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {cat.badge && (
                      <span style={{
                        fontSize: '0.48rem', fontWeight: 800, color: '#fff',
                        background: 'linear-gradient(135deg, #7c3aed, #6B5CE7)',
                        padding: '1px 4px', borderRadius: 3,
                        letterSpacing: '0.05em',
                      }}>{cat.badge}</span>
                    )}
                    {count > 0 && (
                      <span style={{
                        fontSize: '0.6rem', color: 'var(--color-text-ghost)',
                        background: 'hsla(0,0%,100%,0.06)',
                        padding: '1px 5px', borderRadius: 3, minWidth: 18, textAlign: 'center',
                      }}>{count}</span>
                    )}
                  </div>
                </button>
              );
            })}

            <div style={{ flex: 1 }} />

            {/* Upgrade CTA */}
            <button
              onClick={handleUpgrade}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 10px', borderRadius: 9, border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #6B5CE7)',
                color: '#fff', cursor: 'pointer', fontSize: '0.72rem',
                fontWeight: 700, fontFamily: 'var(--font-sans)',
                marginTop: 'auto', width: '100%',
                boxShadow: '0 4px 16px hsla(247,74%,63%,0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 24px hsla(247,74%,63%,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px hsla(247,74%,63%,0.3)'; e.currentTarget.style.transform = 'none'; }}
            >
              <Crown size={12} fill="currentColor" /> Upgrade Studio
            </button>
          </div>

          {/* Main Grid */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

            {/* Templates tab */}
            {showingTemplates && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Templates profissionais prontos para usar. <span style={{ color: 'var(--color-accent)' }}>Studio</span> desbloqueia todos.
                  </p>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 10,
                }}>
                  {PREMIUM_TEMPLATES.map(tpl => (
                    <PremiumCard key={tpl.id} template={tpl} onUpgrade={handleUpgrade} />
                  ))}
                </div>
              </>
            )}

            {/* Assets tab */}
            {!showingTemplates && filtered.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', gap: 16,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'hsla(247,74%,63%,0.08)',
                  border: '1px dashed hsla(247,74%,63%,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Folder size={28} color="var(--color-accent)" style={{ opacity: 0.5 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
                    {searchQuery ? 'Nenhum asset encontrado' : 'Biblioteca vazia'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {searchQuery ? 'Tente outro termo de busca' : 'Faça upload de imagens, vídeos ou áudios'}
                  </p>
                </div>
                {!searchQuery && (
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 9, cursor: 'pointer',
                    background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)',
                    color: '#fff', fontSize: '0.74rem', fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 4px 16px hsla(247,74%,63%,0.3)',
                  }}>
                    <Upload size={14} /> Upload Assets
                    <input type="file" multiple accept="image/*,video/*,audio/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            ) : !showingTemplates ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 10,
              }}>
                {filtered.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCanvas(item)}
                    data-testid="asset-card"
                    style={{
                      borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                      border: '1px solid var(--color-surface-border)',
                      background: 'hsla(0,0%,100%,0.03)',
                      transition: 'all 0.15s cubic-bezier(0.16,1,0.3,1)',
                      aspectRatio: '16/10',
                      display: 'flex', flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '1px solid hsla(247,74%,63%,0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid var(--color-surface-border)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ flex: 1, background: 'hsla(0,0%,100%,0.04)', overflow: 'hidden', position: 'relative' }}>
                      {item.type === 'image' && item.data ? (
                        <img src={item.data} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : item.type === 'video' && item.data ? (
                        <VideoThumbnail src={item.data} />
                      ) : item.type === 'audio' ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                          <Music size={24} color="var(--color-text-ghost)" />
                          <div style={{ fontSize: '0.55rem', color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>AUDIO</div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Video size={24} color="var(--color-text-ghost)" />
                        </div>
                      )}

                      {/* Premium badge */}
                      {item.isPremium && (
                        <div
                          data-testid="premium-lock"
                          style={{
                            position: 'absolute', top: 5, right: 5,
                            background: 'linear-gradient(135deg, #7c3aed, #6B5CE7)',
                            color: '#fff', fontSize: '0.5rem', fontWeight: 700,
                            padding: '2px 5px', borderRadius: 3,
                            display: 'flex', alignItems: 'center', gap: 2,
                          }}
                        >
                          <Lock size={7} /> STUDIO
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '5px 8px', background: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpIn {
          from { opacity: 0; transform: translate(-50%, -47%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes floatPulse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.1); }
        }
      `}</style>
    </>
  );
}
