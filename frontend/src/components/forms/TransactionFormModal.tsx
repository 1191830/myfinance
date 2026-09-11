import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { FormField, formInputClass } from '../ui/FormField';
import { useCategories } from '../../hook/useCategory';
import { useCreateTransaction, useUpdateTransaction } from '../../hook/useTransaction';
import { useCreateRecurringTransaction } from '../../hook/useRecurringTransaction';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';
import { RECURRENCE_INTERVAL_LABEL } from '../../lib/format';
import type { Frequency, TransactionModel, TransactionType } from '../../model/TransactionModel';
import type {
  RecurrenceInterval,
  RecurringTransactionModel,
} from '../../model/RecurringTransactionModel';

interface TransactionFormModalProps {
  open: boolean;
  /** present = edit that transaction, absent = create */
  initial?: TransactionModel;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const TransactionFormModal = ({ open, initial, onClose }: TransactionFormModalProps) => {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const createRecurringMutation = useCreateRecurringTransaction();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [frequency, setFrequency] = useState<Frequency>('ONE_TIME');
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('MONTHLY');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? 'EXPENSE');
    setFrequency(initial?.frequency ?? 'ONE_TIME');
    setRecurrenceInterval('MONTHLY');
    setCategoryId(initial?.category?.id ?? '');
    setAmount(initial ? String(initial.amount) : '');
    setDate(initial?.date ?? today());
    setEndDate('');
    setDescription(initial?.description ?? '');
    setFieldErrors({});
    setFormError('');
  }, [open, initial]);

  const isEdit = !!initial?.id;
  // Only a brand-new recurring transaction creates a template + backfills past occurrences;
  // editing (even an already-recurring row) keeps its existing plain behaviour.
  const isNewRecurring = !isEdit && frequency === 'RECURRING';
  const pending = createMutation.isPending || updateMutation.isPending || createRecurringMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const amountNum = Number(amount.replace(',', '.'));
    const errors: Record<string, string> = {};
    if (!description.trim()) errors.description = 'A descrição é obrigatória';
    if (!amountNum || amountNum <= 0) errors.amount = 'O valor deve ser positivo';
    if (!date) errors.date = 'A data é obrigatória';
    if (isNewRecurring && endDate && date && endDate < date) {
      errors.endDate = 'A data de fim deve ser posterior à de início';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError('');

    const category = categories?.find((c) => c.id === categoryId);
    const resolvedCategory = category?.id ? { id: category.id, name: category.name } : null;

    const onError = (err: unknown) => {
      const fe = getFieldErrors(err);
      if (fe) setFieldErrors(fe);
      else setFormError(getErrorMessage(err));
    };

    if (isNewRecurring) {
      const payload: RecurringTransactionModel = {
        id: '',
        type,
        frequency: 'RECURRING',
        recurrenceInterval,
        category: resolvedCategory,
        amount: amountNum,
        description: description.trim(),
        startDate: date,
        endDate: endDate || null,
        active: true,
      };
      createRecurringMutation.mutate(payload, {
        onSuccess: () => {
          // The template's past occurrences are backfilled into /transactions server-side.
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          onClose();
        },
        onError,
      });
      return;
    }

    const payload: TransactionModel = {
      id: initial?.id ?? '',
      type,
      frequency,
      category: resolvedCategory,
      amount: amountNum,
      date,
      description: description.trim(),
      recurringTransaction: initial?.recurringTransaction ?? null,
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
          {isEdit ? 'Editar transação' : 'Adicionar transação'}
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
          <FormField label="Recorrência">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className={formInputClass()}
            >
              <option value="ONE_TIME">Único</option>
              <option value="RECURRING">Recorrente</option>
            </select>
          </FormField>
        </div>

        {isNewRecurring && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Intervalo">
              <select
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
                className={formInputClass()}
              >
                {Object.entries(RECURRENCE_INTERVAL_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Fim (opcional)" error={fieldErrors.endDate}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={formInputClass(!!fieldErrors.endDate)}
              />
            </FormField>
          </div>
        )}

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
          <FormField label={isNewRecurring ? 'Início' : 'Data'} error={fieldErrors.date}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={formInputClass(!!fieldErrors.date)}
            />
          </FormField>
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
