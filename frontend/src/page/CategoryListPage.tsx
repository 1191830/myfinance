import { useMemo, useState } from 'react';
import { useCategories, useDeleteCategory } from '../hook/useCategory';
import { useTransactions } from '../hook/useTransaction';
import { useExpensesByCategory } from '../hook/useReports';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CategoryFormModal } from '../components/forms/CategoryFormModal';
import { formatCurrency } from '../lib/format';
import { latestTransactionMonth, monthBounds } from '../lib/period';
import type { Category } from '../model/CategoryModel';

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

export const CategoryListPage = () => {
  const { data: categories, isLoading, isError, error } = useCategories();
  const deleteMutation = useDeleteCategory();
  const { data: transactions } = useTransactions();

  const activeMonth = useMemo(() => latestTransactionMonth(transactions), [transactions]);
  const { first, last } = useMemo(() => monthBounds(activeMonth), [activeMonth]);
  const { data: spending } = useExpensesByCategory(first, last);
  const spentByCategoryId = useMemo(() => {
    const map = new Map<string, number>();
    (spending ?? []).forEach((s) => {
      if (s.categoryId) map.set(s.categoryId, s.total);
    });
    return map;
  }, [spending]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setFormOpen(true);
  };
  const confirmDelete = () => {
    if (toDelete?.id) deleteMutation.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Categorias"
        subtitle={`${categories?.length ?? 0} categorias`}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="flex h-[34px] items-center gap-[7px] rounded-control bg-brand px-3.5 text-[13px] font-medium text-white hover:bg-brand-strong"
          >
            <PlusIcon />
            Nova categoria
          </button>
        }
      />

      {isLoading && <div className="text-[13px] text-faint">A carregar…</div>}
      {isError && <div className="text-[13px] text-expense">{(error as Error).message}</div>}

      {!isLoading && !isError && (
        <Card flush className="max-w-lg">
          {(categories ?? []).map((c) => {
            const spent = c.id ? spentByCategoryId.get(c.id) ?? 0 : 0;
            const hasBudget = c.monthlyBudget != null;
            const over = hasBudget && spent > (c.monthlyBudget as number);
            const pct = hasBudget && c.monthlyBudget! > 0 ? (spent / c.monthlyBudget!) * 100 : 0;
            return (
              <div
                key={c.id}
                className="border-t border-[#f1f3f5] px-5 py-3 first:border-t-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-ink">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-faint hover:text-brand"
                      aria-label={`Renomear ${c.name}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(c)}
                      className="text-faint hover:text-expense"
                      aria-label={`Apagar ${c.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                {hasBudget && (
                  <div className="mt-2">
                    <ProgressBar
                      percent={pct}
                      height={6}
                      color={over ? 'var(--color-expense)' : 'var(--color-gold)'}
                    />
                    <div
                      className={`mt-1.5 text-xs ${over ? 'font-medium text-expense' : 'text-faint'}`}
                    >
                      {formatCurrency(spent)} de {formatCurrency(c.monthlyBudget as number)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!categories?.length && (
            <div className="px-5 py-6 text-center text-[13px] text-faint">Sem categorias.</div>
          )}
        </Card>
      )}

      <CategoryFormModal open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        title="Apagar categoria"
        message={`"${toDelete?.name ?? ''}" será removida. As transações associadas passam a "Sem categoria".`}
        confirmLabel="Apagar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
