/**
 * Toast Types — Pelimotion v3.1
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message?: string;
  /** Auto-dismiss duration in ms. Default: 4000. */
  duration?: number;
  /** If true, toast stays until manually dismissed. */
  persistent?: boolean;
  /** Optional CTA button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ToastInput = Omit<Toast, 'id'>;
