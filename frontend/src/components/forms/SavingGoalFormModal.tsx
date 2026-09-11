import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, formInputClass } from '../ui/FormField';
import { useCreateSavingGoal, useUpdateSavingGoal } from '../../hook/useSavingGoal';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';
import type { SavingGoal } from '../../model/SavingGoalModel';

interface SavingGoalFormModalProps {
  open: boolean;
  initial?: SavingGoal;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const SavingGoalFormModal = ({ open, initial, onClose }: SavingGoalFormModalProps) => {
  const createMutation = useCreateSavingGoal();
  const updateMutation = useUpdateSavingGoal();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setTargetAmount(initial ? String(initial.targetAmount) : '');
    setCurrentAmount(initial ? String(initial.currentAmount ?? 0) : '0');
    setStartDate(initial?.startDate ?? today());
    setEndDate(initial?.endDate ?? '');
    setFieldErrors({});
    setFormError('');
  }, [open, initial]);

  const isEdit = !!initial?.id;
  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const targetNum = Number(targetAmount.replace(',', '.'));
    const currentNum = Number(currentAmount.replace(',', '.'));
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'O nome é obrigatório';
    if (!targetNum || targetNum <= 0) errors.targetAmount = 'A meta deve ser positiva';
    if (currentAmount !== '' && currentNum < 0) errors.currentAmount = 'Não pode ser negativo';
    if (!startDate) errors.startDate = 'A data de início é obrigatória';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError('');

    const payload: SavingGoal = {
      id: initial?.id,
      name: name.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum || 0,
      startDate,
      endDate: endDate || null,
    };

    const onError = (err: unknown) => {
      const fe = getFieldErrors(err);
      if (fe) setFieldErrors(fe);
      else setFormError(getErrorMessage(err));
    };

    if (isEdit) {
      updateMutation.mutate({ id: initial!.id!, savingGoal: payload }, { onSuccess: onClose, onError });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="text-[15px] font-semibold text-ink">
          {isEdit ? 'Editar objetivo' : 'Novo objetivo'}
        </div>

        {formError && <p className="text-xs text-expense">{formError}</p>}

        <FormField label="Nome" error={fieldErrors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formInputClass(!!fieldErrors.name)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Meta (€)" error={fieldErrors.targetAmount}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className={formInputClass(!!fieldErrors.targetAmount)}
            />
          </FormField>
          <FormField label="Atual (€)" error={fieldErrors.currentAmount}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className={formInputClass(!!fieldErrors.currentAmount)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início" error={fieldErrors.startDate}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={formInputClass(!!fieldErrors.startDate)}
            />
          </FormField>
          <FormField label="Fim (opcional)">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={formInputClass()}
            />
          </FormField>
        </div>

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
            {isEdit ? 'Guardar' : 'Criar objetivo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
