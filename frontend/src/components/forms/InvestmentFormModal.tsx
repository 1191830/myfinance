import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, formInputClass } from '../ui/FormField';
import { useCreateInvestment, useInvestments, useUpdateInvestment } from '../../hook/useInvestment';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';
import type { Investment } from '../../model/InvestmentModel';

interface InvestmentFormModalProps {
  open: boolean;
  initial?: Investment;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const InvestmentFormModal = ({ open, initial, onClose }: InvestmentFormModalProps) => {
  const { data: investments } = useInvestments();
  const createMutation = useCreateInvestment();
  const updateMutation = useUpdateInvestment();

  const [type, setType] = useState('');
  const [ticker, setTicker] = useState('');
  const [amountInvested, setAmountInvested] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const existingTypes = useMemo(
    () => Array.from(new Set((investments ?? []).map((i) => i.type))).sort(),
    [investments],
  );

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? '');
    setTicker(initial?.ticker ?? '');
    setAmountInvested(initial ? String(initial.amountInvested) : '');
    setCurrentValue(initial ? String(initial.currentValue) : '');
    setStartDate(initial?.startDate ?? today());
    setNotes(initial?.notes ?? '');
    setFieldErrors({});
    setFormError('');
  }, [open, initial]);

  const isEdit = !!initial?.id;
  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const investedNum = Number(amountInvested.replace(',', '.'));
    const currentNum = Number(currentValue.replace(',', '.'));
    const errors: Record<string, string> = {};
    if (!type.trim()) errors.type = 'O tipo é obrigatório';
    if (amountInvested === '' || investedNum < 0) errors.amountInvested = 'Indique um valor válido';
    if (currentValue === '' || currentNum < 0) errors.currentValue = 'Indique um valor válido';
    if (!startDate) errors.startDate = 'A data de início é obrigatória';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError('');

    const payload: Investment = {
      id: initial?.id,
      type: type.trim(),
      ticker: ticker.trim() || undefined,
      amountInvested: investedNum,
      currentValue: currentNum,
      startDate,
      notes: notes.trim() || undefined,
      lastSynced: initial?.lastSynced,
    };

    const onError = (err: unknown) => {
      const fe = getFieldErrors(err);
      if (fe) setFieldErrors(fe);
      else setFormError(getErrorMessage(err));
    };

    if (isEdit) {
      updateMutation.mutate({ id: initial!.id!, investment: payload }, { onSuccess: onClose, onError });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="text-[15px] font-semibold text-ink">
          {isEdit ? 'Editar investimento' : 'Adicionar investimento'}
        </div>

        {formError && <p className="text-xs text-expense">{formError}</p>}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo" error={fieldErrors.type}>
            <input
              type="text"
              list="investment-types"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={formInputClass(!!fieldErrors.type)}
              placeholder="ETF, Ações, Cripto…"
            />
            <datalist id="investment-types">
              {existingTypes.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </FormField>
          <FormField label="Ticker">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className={formInputClass()}
              placeholder="opcional"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Investido (€)" error={fieldErrors.amountInvested}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amountInvested}
              onChange={(e) => setAmountInvested(e.target.value)}
              className={formInputClass(!!fieldErrors.amountInvested)}
            />
          </FormField>
          <FormField label="Valor atual (€)" error={fieldErrors.currentValue}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className={formInputClass(!!fieldErrors.currentValue)}
            />
          </FormField>
        </div>

        <FormField label="Início" error={fieldErrors.startDate}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={formInputClass(!!fieldErrors.startDate)}
          />
        </FormField>

        <FormField label="Notas">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={formInputClass()}
            placeholder="opcional"
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
