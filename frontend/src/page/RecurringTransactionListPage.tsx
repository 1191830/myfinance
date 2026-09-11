import { useState } from 'react';
import {
  useRecurringTransactions,
  useDeleteRecurringTransaction,
} from '../hook/useRecurringTransaction';
import { useGenerateTransactions } from '../hook/useTransaction';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { RecurringTransactionFormModal } from '../components/forms/RecurringTransactionFormModal';
import {
  RECURRENCE_INTERVAL_LABEL,
  TYPE_LABEL,
  formatCurrency,
  formatDate,
} from '../lib/format';
import type { RecurringTransactionModel } from '../model/RecurringTransactionModel';

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 21h4l11-11a2.5 2.5 0 0 0-4-4L4 17v4Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </svg>
);

const th = 'border-b border-line-soft bg-[#fafbfc] px-4 py-[11px] text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-faint';

export const RecurringTransactionListPage = () => {
  const { data: recurringTransactions, isLoading, isError, error } = useRecurringTransactions();
  const deleteMutation = useDeleteRecurringTransaction();
  const generateMutation = useGenerateTransactions();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransactionModel | undefined>(undefined);
  const [toDelete, setToDelete] = useState<RecurringTransactionModel | null>(null);
  const [lastGenerated, setLastGenerated] = useState<number | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (r: RecurringTransactionModel) => {
    setEditing(r);
    setFormOpen(true);
  };
  const confirmDelete = () => {
    if (toDelete?.id) deleteMutation.mutate(toDelete.id);
    setToDelete(null);
  };
  const handleGenerate = () => {
    generateMutation.mutate(undefined, {
      onSuccess: (res) => setLastGenerated(res.generated),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Recorrências"
        subtitle={`${recurringTransactions?.length ?? 0} recorrências`}
        actions={
          <>
            {lastGenerated !== null && (
              <span className="text-xs text-faint">
                {lastGenerated} transaç{lastGenerated === 1 ? 'ão gerada' : 'ões geradas'}
              </span>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="h-[34px] rounded-control border border-[#d7dbe0] bg-white px-3.5 text-[13px] text-ink disabled:opacity-60"
            >
              Gerar agora
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="flex h-[34px] items-center gap-[7px] rounded-control bg-brand px-3.5 text-[13px] font-medium text-white hover:bg-brand-strong"
            >
              <PlusIcon />
              Nova recorrência
            </button>
          </>
        }
      />

      {isLoading && <div className="text-[13px] text-faint">A carregar…</div>}
      {isError && <div className="text-[13px] text-expense">{(error as Error).message}</div>}

      {!isLoading && !isError && (
        <Card flush>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Tipo</th>
                <th className={th}>Categoria</th>
                <th className={th}>Valor</th>
                <th className={th}>Intervalo</th>
                <th className={th}>Início</th>
                <th className={th}>Fim</th>
                <th className={th}>Ativa</th>
                <th className={th} aria-label="ações" />
              </tr>
            </thead>
            <tbody>
              {(recurringTransactions ?? []).map((r) => (
                <tr key={r.id} className="border-t border-[#f1f3f5] text-[13px]">
                  <td className="px-4 py-3">{TYPE_LABEL[r.type]}</td>
                  <td className="px-4 py-3 text-muted">{r.category?.name ?? 'Sem categoria'}</td>
                  <td className="tnum px-4 py-3">{formatCurrency(r.amount)}</td>
                  <td className="px-4 py-3 text-muted">{RECURRENCE_INTERVAL_LABEL[r.recurrenceInterval]}</td>
                  <td className="px-4 py-3 text-faint">{formatDate(r.startDate)}</td>
                  <td className="px-4 py-3 text-faint">{r.endDate ? formatDate(r.endDate) : '—'}</td>
                  <td className="px-4 py-3 text-faint">{r.active ? 'Sim' : 'Não'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-faint hover:text-brand"
                        aria-label={`Editar ${r.description}`}
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(r)}
                        className="text-faint hover:text-expense"
                        aria-label={`Apagar ${r.description}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!recurringTransactions?.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-[13px] text-faint">
                    Sem recorrências.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <RecurringTransactionFormModal
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Apagar recorrência"
        message={`"${toDelete?.description ?? ''}" será removida. As transações já geradas mantêm-se, sem associação à recorrência.`}
        confirmLabel="Apagar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
