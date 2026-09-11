import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, formInputClass } from '../ui/FormField';
import { useCreateCategory, useUpdateCategory } from '../../hook/useCategory';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';
import type { Category } from '../../model/CategoryModel';

interface CategoryFormModalProps {
  open: boolean;
  initial?: Category;
  onClose: () => void;
}

export const CategoryFormModal = ({ open, initial, onClose }: CategoryFormModalProps) => {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setError('');
  }, [open, initial]);

  const isEdit = !!initial?.id;
  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome é obrigatório');
      return;
    }
    setError('');

    const payload: Category = { id: initial?.id, name: name.trim() };
    const onError = (err: unknown) => {
      const fe = getFieldErrors(err);
      setError(fe?.name ?? getErrorMessage(err));
    };

    if (isEdit) {
      updateMutation.mutate({ id: initial!.id!, category: payload }, { onSuccess: onClose, onError });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="text-[15px] font-semibold text-ink">
          {isEdit ? 'Renomear categoria' : 'Nova categoria'}
        </div>
        <FormField label="Nome" error={error}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formInputClass(!!error)}
            autoFocus
          />
        </FormField>
        <div className="mt-1.5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-control border border-[#d7dbe0] bg-white px-4 text-[13px] font-medium text-ink"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-control bg-brand px-4 text-[13px] font-medium text-white hover:bg-brand-strong disabled:opacity-60"
          >
            {isEdit ? 'Guardar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
