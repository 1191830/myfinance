import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, formInputClass } from '../ui/FormField';
import { useCategories } from '../../hook/useCategory';
import { useCreateTransaction, useUpdateTransaction } from '../../hook/useTransaction';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';
import type { Frequency, TransactionModel, TransactionType } from '../../model/TransactionModel';

interface TransactionFormModalProps {
  open: boolean;
  /** present = edit that transaction, absent = create */
  initial?: TransactionModel;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const TransactionFormModal = ({ open, initial, onClose }: TransactionFormModalProps) => {
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [frequency, setFrequency] = useState<Frequency>('ONE_TIME');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? 'EXPENSE');
    setFrequency(initial?.frequency ?? 'ONE_TIME');
    setCategoryId(initial?.category?.id ?? '');
    setAmount(initial ? String(initial.amount) : '');
    setDate(initial?.date ?? today());
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
    if (!date) errors.date = 'A data é obrigatória';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError('');

    const category = categories?.find((c) => c.id === categoryId);
    const payload: TransactionModel = {
      id: initial?.id ?? '',
      type,
      frequency,
      category: category?.id ? { id: category.id, name: category.name } : null,
      amount: amountNum,
      date,
      description: description.trim(),
      recurringTransaction: initial?.recurringTransaction ?? null,
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
          <FormField label="Data" error={fieldErrors.date}>
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
