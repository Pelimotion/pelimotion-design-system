/**
 * LibraryModal — Pelimotion v3.0
 *
 * Full-screen library overlay (glassmorphism modal).
 * Shows local and global assets in a grid with preview on hover.
 */
import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { X, Upload, Search, Image, Video, Music, FileText, Folder, Lock, Zap } from 'lucide-react';

interface LibraryModalProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: <Folder size={14} /> },
  { id: 'image', label: 'Imagens', icon: <Image size={14} /> },
  { id: 'video', label: 'Vídeos', icon: <Video size={14} /> },
  { id: 'audio', label: 'Áudio', icon: <Music size={14} /> },
];

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
  const filtered = allItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.type === activeCategory;
    const matchSearch = !searchQuery || item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: 'min(840px, 90vw)', height: 'min(580px, 85vh)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 96px rgba(0,0,0,0.7)',
        overflow: 'hidden',
        animation: 'fadeScaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
          borderBottom: '1px solid var(--color-surface-border)', flexShrink: 0,
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Biblioteca</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-ghost)', background: 'hsla(0,0%,100%,0.05)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
              {allItems.length} assets
            </span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-ghost)' }} />
            <input
              type="text" placeholder="Buscar assets…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
                background: 'hsla(0,0%,100%,0.05)', border: '1px solid var(--color-surface-border)',
                borderRadius: 8, color: 'var(--color-text-primary)', fontSize: '0.75rem',
                fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-surface-border)'}
            />
          </div>

          {/* Upload */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            background: 'hsla(191,100%,50%,0.08)', border: '1px solid hsla(191,100%,50%,0.2)',
            color: 'var(--color-accent)', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
          }}>
            <Upload size={13} /> Upload
            <input type="file" multiple accept="image/*,video/*,audio/*" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-ghost)', padding: 4, borderRadius: 6, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Sidebar categories */}
          <div style={{
            width: 160, flexShrink: 0, borderRight: '1px solid var(--color-surface-border)',
            padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 7, border: 'none',
                  background: activeCategory === cat.id ? 'hsla(191,100%,50%,0.08)' : 'transparent',
                  color: activeCategory === cat.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-sans)',
                  textAlign: 'left', width: '100%', transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.background = 'hsla(0,0%,100%,0.04)'; }}
                onMouseLeave={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}

            <div style={{ flex: 1 }} />
            <button
              onClick={() => alert("Assine o Pelimotion Studio para desbloquear todos os assets e remover a marca d'água!")}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 10px', borderRadius: 7, border: 'none',
                background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)',
                color: '#fff', cursor: 'pointer', fontSize: '0.72rem',
                fontWeight: 700, fontFamily: 'var(--font-sans)',
                marginTop: 'auto', width: '100%',
                boxShadow: '0 4px 12px hsla(191,100%,50%,0.2)',
              }}
            >
              <Zap size={12} fill="currentColor" /> Upgrade Studio
            </button>
          </div>

          {/* Grid */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {filtered.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', gap: 12, color: 'var(--color-text-ghost)',
              }}>
                <Folder size={40} style={{ opacity: 0.2 }} />
                <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  {searchQuery ? 'Nenhum asset encontrado' : 'Biblioteca vazia'}
                  <br />
                  <span style={{ fontSize: '0.68rem' }}>Faça upload de imagens, vídeos ou áudios</span>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 10,
              }}>
                {filtered.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCanvas(item)}
                    data-testid="asset-card"
                    className="asset-card"
                    style={{
                      borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                      border: '1px solid var(--color-surface-border)',
                      background: 'hsla(0,0%,100%,0.03)',
                      transition: 'all 0.15s ease',
                      aspectRatio: '16/10',
                      display: 'flex', flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '1px solid hsla(191,100%,50%,0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid var(--color-surface-border)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ flex: 1, background: 'hsla(0,0%,100%,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {item.type === 'image' && item.data ? (
                        <img src={item.data} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : item.type === 'video' ? (
                        <Video size={28} color="var(--color-text-ghost)" />
                      ) : item.type === 'audio' ? (
                        <Music size={28} color="var(--color-text-ghost)" />
                      ) : (
                        <FileText size={28} color="var(--color-text-ghost)" />
                      )}

                      {/* Premium indicator */}
                      {item.isPremium && (
                        <div
                          data-testid="premium-lock"
                          className="premium-badge"
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            background: 'var(--color-accent)',
                            color: '#000',
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          }}
                        >
                          <Lock size={8} className="lock-icon" /> STUDIO
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '6px 8px', background: 'hsla(0,0%,0%,0.3)' }}>
                      <p style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
