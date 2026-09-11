import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, formInputClass } from '../ui/FormField';
import { useCategories } from '../../hook/useCategory';
import {
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
} from '../../hook/useRecurringTransaction';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';
import type {
  RecurrenceInterval,
  RecurringTransactionModel,
} from '../../model/RecurringTransactionModel';
import type { TransactionType } from '../../model/TransactionModel';

interface RecurringTransactionFormModalProps {
  open: boolean;
  /** present = edit that template, absent = create */
  initial?: RecurringTransactionModel;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const RecurringTransactionFormModal = ({
  open,
  initial,
  onClose,
}: RecurringTransactionFormModalProps) => {
  const { data: categories } = useCategories();
  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('MONTHLY');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? 'EXPENSE');
    setRecurrenceInterval(initial?.recurrenceInterval ?? 'MONTHLY');
    setCategoryId(initial?.category?.id ?? '');
    setAmount(initial ? String(initial.amount) : '');
    setStartDate(initial?.startDate ?? today());
    setEndDate(initial?.endDate ?? '');
    setActive(initial?.active ?? true);
    setDescription(initial?.description ?? '');
    setFieldErrors({});
    setFormError('');
  }, [open, initial]);

  const isEdit = !!initial?.id;
  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const amountNum = Number(amount.replace(',', '.'));
    const errors: Record<string, string> = {};
    if (!description.trim()) errors.description = 'A descrição é obrigatória';
    if (!amountNum || amountNum <= 0) errors.amount = 'O valor deve ser positivo';
    if (!startDate) errors.startDate = 'A data de início é obrigatória';
    if (endDate && startDate && endDate < startDate) {
      errors.endDate = 'A data de fim deve ser posterior à de início';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError('');

    const category = categories?.find((c) => c.id === categoryId);
    const payload: RecurringTransactionModel = {
      id: initial?.id ?? '',
      type,
      frequency: 'RECURRING',
      recurrenceInterval,
      category: category?.id ? { id: category.id, name: category.name } : null,
      amount: amountNum,
      description: description.trim(),
      startDate,
      endDate: endDate || null,
      active: isEdit ? active : true,
    };

    const onError = (err: unknown) => {
      const fe = getFieldErrors(err);
      if (fe) setFieldErrors(fe);
      else setFormError(getErrorMessage(err));
    };

    if (isEdit) {
      updateMutation.mutate({ id: initial!.id, transaction: payload }, { onSuccess: onClose, onError });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="text-[15px] font-semibold text-ink">
          {isEdit ? 'Editar recorrência' : 'Adicionar recorrência'}
        </div>

        {formError && <p className="text-xs text-expense">{formError}</p>}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className={formInputClass()}
            >
              <option value="EXPENSE">Despesa</option>
              <option value="INCOME">Rendimento</option>
            </select>
          </FormField>
          <FormField label="Intervalo">
            <select
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
              className={formInputClass()}
            >
              <option value="MONTHLY">Mensal</option>
              <option value="QUARTERLY">Trimestral</option>
              <option value="YEARLY">Anual</option>
            </select>
          </FormField>
        </div>

        <FormField label="Categoria">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={formInputClass()}
          >
            <option value="">Sem categoria</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor (€)" error={fieldErrors.amount}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={formInputClass(!!fieldErrors.amount)}
            />
          </FormField>
          <FormField label="Início" error={fieldErrors.startDate}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={formInputClass(!!fieldErrors.startDate)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Fim (opcional)" error={fieldErrors.endDate}>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={formInputClass(!!fieldErrors.endDate)}
            />
          </FormField>
          {isEdit && (
            <label className="flex items-center gap-2 pt-[22px] text-[13px] text-ink">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-[#d7dbe0] accent-brand"
              />
              Ativa
            </label>
          )}
        </div>

        <FormField label="Descrição" error={fieldErrors.description}>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={formInputClass(!!fieldErrors.description)}
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
            {isEdit ? 'Guardar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
