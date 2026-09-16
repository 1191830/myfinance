import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, formInputClass } from '../ui/FormField';
import { useBuyMoreInvestment } from '../../hook/useInvestment';
import { getErrorMessage, getFieldErrors } from '../../lib/apiError';
import { formatCurrency } from '../../lib/format';
import type { Investment } from '../../model/InvestmentModel';

interface BuyMoreModalProps {
  open: boolean;
  investment?: Investment;
  onClose: () => void;
}

export const BuyMoreModal = ({ open, investment, onClose }: BuyMoreModalProps) => {
  const buyMutation = useBuyMoreInvestment();
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuantity('');
    setUnitPrice('');
    setError('');
  }, [open]);

  if (!investment) return null;

  const quantityNum = Number(quantity.replace(',', '.'));
  const unitPriceNum = Number(unitPrice.replace(',', '.'));
  const valid = quantity !== '' && unitPrice !== '' && quantityNum > 0 && unitPriceNum >= 0;

  const existingQuantity = investment.quantity ?? 0;
  const newQuantity = existingQuantity + (valid ? quantityNum : 0);
  const newAmountInvested = investment.amountInvested + (valid ? quantityNum * unitPriceNum : 0);
  const newAveragePrice = valid && newQuantity > 0 ? newAmountInvested / newQuantity : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError('Indique uma quantidade e preço válidos.');
      return;
    }
    setError('');
    buyMutation.mutate(
      { id: investment.id!, quantity: quantityNum, unitPrice: unitPriceNum },
      {
        onSuccess: onClose,
        onError: (err) => {
          const fe = getFieldErrors(err);
          setError(fe ? Object.values(fe)[0] : getErrorMessage(err));
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <div className="text-[15px] font-semibold text-ink">Comprar mais</div>
          <div className="mt-0.5 text-[13px] text-muted">
            {investment.type}
            {investment.ticker ? ` · ${investment.ticker}` : ''}
          </div>
        </div>

        {error && <p className="text-xs text-expense">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Quantidade comprada">
            <input
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={formInputClass()}
              autoFocus
            />
          </FormField>
          <FormField label="Preço unitário (€)">
            <input
              type="number"
              step="any"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className={formInputClass()}
            />
          </FormField>
        </div>

        {newAveragePrice !== null && (
          <div className="rounded-control bg-line-soft px-3 py-2 text-[12px] text-muted">
            Nova quantidade: <span className="font-medium text-ink">{newQuantity}</span> · Novo
            preço médio: <span className="font-medium text-ink">{formatCurrency(newAveragePrice)}</span>
          </div>
        )}

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
            disabled={buyMutation.isPending}
            className="h-9 rounded-control bg-brand px-4 text-[13px] font-medium text-white hover:bg-brand-strong disabled:opacity-60"
          >
            Confirmar compra
          </button>
        </div>
      </form>
    </Modal>
  );
};
