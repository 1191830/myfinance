import { useMemo, useState } from 'react';
import { useSavingGoals, useDeleteSavingGoal } from '../hook/useSavingGoal';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SavingGoalFormModal } from '../components/forms/SavingGoalFormModal';
import {
  formatCurrency,
  formatCurrencyShort,
  formatMonthYear,
  formatPercent,
} from '../lib/format';
import type { SavingGoal } from '../model/SavingGoalModel';

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 21h4l11-11a2.5 2.5 0 0 0-4-4L4 17v4Z" />
  </svg>
);

const monthsUntil = (iso?: string | null) => {
  if (!iso) return null;
  const end = new Date(iso);
  const now = new Date();
  const months =
    (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  return months > 0 ? months : null;
};

export const SavingGoalsListPage = () => {
  const { data: goals, isLoading, isError, error } = useSavingGoals();
  const deleteMutation = useDeleteSavingGoal();

  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<SavingGoal | null>(null);
  const [editing, setEditing] = useState<SavingGoal | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (goals ?? []).filter((g) => !q || g.name.toLowerCase().includes(q));
  }, [goals, search]);

  const totals = useMemo(() => {
    const saved = filtered.reduce((s, g) => s + (g.currentAmount ?? 0), 0);
    const target = filtered.reduce((s, g) => s + g.targetAmount, 0);
    const avg =
      filtered.length === 0
        ? 0
        : filtered.reduce(
            (s, g) => s + (g.targetAmount > 0 ? ((g.currentAmount ?? 0) / g.targetAmount) * 100 : 0),
            0,
          ) / filtered.length;
    return { saved, target, avg };
  }, [filtered]);

  const confirmDelete = () => {
    if (toDelete?.id) deleteMutation.mutate(toDelete.id);
    setToDelete(null);
  };
  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (g: SavingGoal) => {
    setEditing(g);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Objetivos"
        subtitle={`${filtered.length} objetivos ativos`}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="flex h-[34px] items-center gap-[7px] rounded-control bg-brand px-3.5 text-[13px] font-medium text-white hover:bg-brand-strong"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo objetivo
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total poupado" value={formatCurrency(totals.saved)} caption={`em ${filtered.length} objetivos`} />
        <StatCard
          label="Meta total"
          value={formatCurrency(totals.target)}
          caption={`faltam ${formatCurrency(Math.max(0, totals.target - totals.saved))}`}
        />
        <StatCard
          label="Progresso médio"
          value={formatPercent(totals.avg, 0)}
          valueClassName="text-gold-text"
          progress={totals.avg}
        />
      </div>

      <Card className="flex items-center gap-2.5 !p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar objetivo…"
          className="h-[34px] min-w-[220px] flex-1 rounded-control border border-[#d7dbe0] bg-white px-3 text-[13px] outline-none"
        />
      </Card>

      {isLoading && <div className="text-[13px] text-faint">A carregar…</div>}
      {isError && <div className="text-[13px] text-expense">{(error as Error).message}</div>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((g) => {
            const current = g.currentAmount ?? 0;
            const pct = g.targetAmount > 0 ? (current / g.targetAmount) * 100 : 0;
            const remaining = Math.max(0, g.targetAmount - current);
            const months = monthsUntil(g.endDate);
            return (
              <Card key={g.id ?? g.name}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{g.name}</div>
                    <div className="mt-0.5 text-xs text-faint">
                      {g.endDate ? `meta ${formatMonthYear(g.endDate)}` : 'sem data'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded px-2 py-[3px] text-xs font-semibold text-gold-text bg-gold-tint">
                      {formatPercent(pct, 0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="text-faint hover:text-brand"
                      aria-label={`Editar ${g.name}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(g)}
                      className="text-faint hover:text-expense"
                      aria-label={`Apagar ${g.name}`}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3.5 flex items-baseline gap-1.5">
                  <span className="tnum text-[22px] font-medium">{formatCurrencyShort(current)}</span>
                  <span className="tnum text-[13px] text-faint">
                    de {formatCurrencyShort(g.targetAmount)}
                  </span>
                </div>
                <ProgressBar percent={pct} height={8} className="mt-3" />
                <div className="mt-2.5 flex justify-between text-xs text-faint">
                  <span>
                    Faltam <span className="tnum text-muted">{formatCurrency(remaining)}</span>
                  </span>
                  {months && (
                    <span>
                      ~<span className="tnum text-muted">{formatCurrency(remaining / months)}</span>/mês
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
          {!filtered.length && (
            <div className="col-span-2 text-[13px] text-faint">Sem objetivos.</div>
          )}
        </div>
      )}

      <SavingGoalFormModal open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={!!toDelete}
        title="Apagar objetivo"
        message={`"${toDelete?.name ?? ''}" será removido permanentemente.`}
        confirmLabel="Apagar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
