import { Modal } from '../ui/Modal';
import { ChangePasswordForm } from './ChangePasswordForm';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => (
  <Modal open={open} onClose={onClose}>
    <ChangePasswordForm onSuccess={onClose} onCancel={onClose} />
  </Modal>
);
