/**
 * ToastNotification — Pelimotion v3.1
 *
 * Non-blocking feedback system. Matches Canva/Figma-style toasts:
 * - Slide-in from bottom-right with GSAP spring
 * - Auto-dismiss with countdown bar
 * - Stackable (max 5 visible)
 * - Types: success | error | warning | info
 * - Action button support (e.g. "Desfazer")
 */
import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { Toast } from '@/types/toast.types';
import { gsap } from 'gsap';
import { Check, X, AlertTriangle, Info, XCircle } from 'lucide-react';

// ─── Toast Item ──────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: 120, opacity: 0, scale: 0.92,
      duration: 0.25, ease: 'power2.in',
      onComplete: () => onDismiss(toast.id),
    });
  }, [toast.id, onDismiss]);

  useEffect(() => {
    if (!ref.current) return;

    // Entrance animation
    gsap.fromTo(ref.current,
      { x: 80, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
    );

    // Progress bar countdown
    const duration = toast.duration ?? 4000;
    if (barRef.current) {
      gsap.fromTo(barRef.current,
        { scaleX: 1 },
        { scaleX: 0, duration: duration / 1000, ease: 'none', transformOrigin: 'left' }
      );
    }

    if (!toast.persistent) {
      timerRef.current = setTimeout(dismiss, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, toast.persistent, dismiss]);

  const icons = {
    success: <Check size={15} />,
    error:   <XCircle size={15} />,
    warning: <AlertTriangle size={15} />,
    info:    <Info size={15} />,
  };

  const colors = {
    success: { bg: 'hsla(152, 80%, 35%, 0.15)', border: 'hsla(152, 80%, 40%, 0.4)', icon: '#00cc88', bar: '#00cc88' },
    error:   { bg: 'hsla(0, 80%, 50%, 0.15)',   border: 'hsla(0, 80%, 50%, 0.4)',   icon: '#ff4444', bar: '#ff4444' },
    warning: { bg: 'hsla(38, 90%, 50%, 0.15)',  border: 'hsla(38, 90%, 50%, 0.4)',  icon: '#ffaa00', bar: '#ffaa00' },
    info:    { bg: 'hsla(247, 74%, 63%, 0.15)', border: 'hsla(247, 74%, 63%, 0.4)', icon: '#6B5CE7', bar: '#6B5CE7' },
  };

  const c = colors[toast.type];

  return (
    <div
      ref={ref}
      id={`toast-${toast.id}`}
      role="alert"
      aria-live="polite"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 12,
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
        minWidth: 280,
        maxWidth: 360,
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Icon */}
      <div style={{
        color: c.icon, marginTop: 1, flexShrink: 0,
        width: 20, height: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icons[toast.type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
            marginBottom: toast.message ? 2 : 0,
          }}>
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.4,
          }}>
            {toast.message}
          </div>
        )}
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); dismiss(); }}
            style={{
              marginTop: 6,
              fontSize: 11, fontWeight: 600,
              color: c.icon,
              background: 'transparent',
              border: 'none', cursor: 'pointer',
              padding: 0, fontFamily: 'var(--font-sans)',
              textDecoration: 'underline',
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        aria-label="Fechar notificação"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-muted)', padding: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 4, flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
      >
        <X size={13} />
      </button>

      {/* Progress bar */}
      {!toast.persistent && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0,
          height: 2,
          width: '100%',
          background: 'hsla(0,0%,100%,0.08)',
        }}>
          <div
            ref={barRef}
            style={{
              height: '100%',
              background: c.bar,
              transformOrigin: 'left',
              opacity: 0.7,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Toast Container ─────────────────────────────────────────────────────────

export function ToastContainer() {
  const toasts = useEditorStore(s => s.toasts);
  const dismissToast = useEditorStore(s => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      aria-label="Notificações"
      style={{
        position: 'fixed',
        bottom: 72, // above ExportBar
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {toasts.slice(-5).map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
