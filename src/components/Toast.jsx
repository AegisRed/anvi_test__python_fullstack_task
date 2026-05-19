import { CheckCircle2, XCircle } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  const Icon = toast.type === 'error' ? XCircle : CheckCircle2;

  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <Icon size={18} aria-hidden="true" />
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification">
        x
      </button>
    </div>
  );
}
