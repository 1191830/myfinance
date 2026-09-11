import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Tailwind max-width class for the panel. */
  maxWidth?: string;
}

/** Generic overlay + panel shell: Escape to close, backdrop click to close, click inside stays open. */
export const Modal = ({ open, onClose, children, maxWidth = 'max-w-sm' }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,32,47,0.45)] p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-card border border-line bg-white p-5 shadow-lg`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
