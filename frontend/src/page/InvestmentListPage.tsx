import { useMemo, useState } from 'react';
import { useInvestments, useDeleteInvestment } from '../hook/useInvestment';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { StatCard } from '../components/ui/StatCard';
import { FilterSelect } from '../components/ui/FilterSelect';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CategoryDonut, type DonutSlice } from '../components/charts/CategoryDonut';
import { formatCurrency, formatMonthYear, formatPercent } from '../lib/format';
import type { Investment } from '../model/InvestmentModel';

const ALLOC_PALETTE = ['#1f6fbf', '#4b82c4', '#1f8a5f', '#e0a53a', '#8a97a4', '#b5333a'];

const returnPct = (inv: Investment) =>
  inv.amountInvested > 0
    ? ((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100
    : 0;

export const InvestmentListPage = () => {
  const { data: investments, isLoading, isError, error } = useInvestments();
  const deleteMutation = useDeleteInvestment();

  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<Investment | null>(null);

  const types = useMemo(
    () => Array.from(new Set((investments ?? []).map((i) => i.type))).sort(),
    [investments],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (investments ?? []).filter((i) => {
      if (typeFilter && i.type !== typeFilter) return false;
      if (
        q &&
        !i.type.toLowerCase().includes(q) &&
        !(i.ticker?.toLowerCase().includes(q) ?? false) &&
        !(i.notes?.toLowerCase().includes(q) ?? false)
      ) {
        return false;
      }
      return true;
    });
  }, [investments, typeFilter, search]);

  const totals = useMemo(() => {
    const invested = filtered.reduce((s, i) => s + i.amountInvested, 0);
    const current = filtered.reduce((s, i) => s + i.currentValue, 0);
    return { invested, current, ret: current - invested };
  }, [filtered]);

  const slices: DonutSlice[] = useMemo(() => {
    const byType = new Map<string, number>();
    filtered.forEach((i) => byType.set(i.type, (byType.get(i.type) ?? 0) + i.currentValue));
    return [...byType.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], idx) => ({
        name,
        value,
        color: ALLOC_PALETTE[idx % ALLOC_PALETTE.length],
      }));
  }, [filtered]);

  const confirmDelete = () => {
    if (toDelete?.id) deleteMutation.mutate(toDelete.id);
    setToDelete(null);
  };

  const num = 'tnum px-4 py-3 text-right text-[13px]';
  const numHead =
    'bg-[#fafbfc] px-4 py-[11px] text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-faint';
  const textHead = numHead.replace('text-right', 'text-left');

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Investimentos"
        subtitle={`${filtered.length} posições`}
        actions={
          <>
            <button
              type="button"
              className="h-[34px] rounded-control border border-[#d7dbe0] bg-white px-3.5 text-[13px] text-ink"
            >
              Sincronizar
            </button>
            <button
              type="button"
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
              Adicionar
            </button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total investido" value={formatCurrency(totals.invested)} caption={`em ${filtered.length} posições`} />
        <StatCard label="Valor atual" value={formatCurrency(totals.current)} caption="valor de mercado" />
        <StatCard
          label="Retorno total"
          value={`${totals.ret >= 0 ? '+' : '−'}${formatCurrency(Math.abs(totals.ret))}`}
          valueClassName={totals.ret >= 0 ? 'text-income' : 'text-expense'}
          delta={totals.invested > 0 ? (totals.ret / totals.invested) * 100 : null}
          caption="desde o início"
        />
      </div>

      <Card className="flex flex-wrap items-center gap-2.5 !p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar tipo, ticker, nota…"
          className="h-[34px] min-w-[220px] flex-1 rounded-control border border-[#d7dbe0] bg-white px-3 text-[13px] outline-none"
        />
        <FilterSelect
          label="Tipo"
          value={typeFilter}
          onChange={setTypeFilter}
          options={types.map((t) => ({ value: t, label: t }))}
        />
      </Card>

      {isLoading && <div className="text-[13px] text-faint">A carregar…</div>}
      {isError && <div className="text-[13px] text-expense">{(error as Error).message}</div>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-[1.45fr_1fr] items-start gap-4">
          <Card flush>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={textHead}>Tipo</th>
                  <th className={textHead}>Ticker</th>
                  <th className={numHead}>Investido</th>
                  <th className={numHead}>Valor atual</th>
                  <th className={numHead}>Retorno</th>
                  <th className={numHead}>Início</th>
                  <th className={numHead} aria-label="ações" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const ret = i.currentValue - i.amountInvested;
                  const pct = returnPct(i);
                  return (
                    <tr key={i.id} className="border-t border-[#f1f3f5]">
                      <td className="px-4 py-3 text-[13px] text-muted">{i.type}</td>
                      <td className="px-4 py-3 text-[13px] font-medium">{i.ticker ?? '—'}</td>
                      <td className={`${num} text-muted`}>{formatCurrency(i.amountInvested)}</td>
                      <td className={num}>{formatCurrency(i.currentValue)}</td>
                      <td className={`${num} font-medium ${ret >= 0 ? 'text-income' : 'text-expense'}`}>
                        {ret >= 0 ? '+' : '−'}
                        {formatCurrency(Math.abs(ret))}{' '}
                        <span className="font-normal text-faint">({formatPercent(pct)})</span>
                      </td>
                      <td className={`${num} text-faint`}>{formatMonthYear(i.startDate)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setToDelete(i)}
                          className="text-faint hover:text-expense"
                          aria-label={`Apagar ${i.ticker ?? i.type}`}
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
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-[13px] text-faint">
                      Nenhum investimento.
                    </td>
                  </tr>
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-line">
                    <td className="px-4 py-3 text-[13px] font-semibold">Total</td>
                    <td />
                    <td className={`${num} font-semibold`}>{formatCurrency(totals.invested)}</td>
                    <td className={`${num} font-semibold`}>{formatCurrency(totals.current)}</td>
                    <td
                      className={`${num} font-semibold ${totals.ret >= 0 ? 'text-income' : 'text-expense'}`}
                    >
                      {totals.ret >= 0 ? '+' : '−'}
                      {formatCurrency(Math.abs(totals.ret))}
                    </td>
                    <td />
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </Card>

          <Card>
            <SectionLabel>Alocação por tipo</SectionLabel>
            {slices.length ? (
              <CategoryDonut
                slices={slices}
                centerLabel="Valor atual"
                centerValue={formatCurrency(totals.current)}
                centerValueClassName="text-ink"
              />
            ) : (
              <div className="mt-6 text-[13px] text-faint">Sem posições.</div>
            )}
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Apagar investimento"
        message={`${toDelete?.type ?? ''} ${toDelete?.ticker ?? ''} será removido permanentemente.`}
        confirmLabel="Apagar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
