import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true renders the confirm button in crimson (destructive) */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onCancel}>
    <div className="text-[15px] font-semibold text-ink">{title}</div>
    {message && <p className="mt-2 text-[13px] text-muted">{message}</p>}
    <div className="mt-5 flex justify-end gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="h-9 rounded-control border border-[#d7dbe0] bg-white px-4 text-[13px] font-medium text-ink"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`h-9 rounded-control px-4 text-[13px] font-medium text-white ${
          destructive ? 'bg-expense hover:brightness-95' : 'bg-brand hover:bg-brand-strong'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
