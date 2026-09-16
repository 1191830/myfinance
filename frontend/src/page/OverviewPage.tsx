import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCashflow, useExpensesByCategory, useMonthSummary } from '../hook/useReports';
import { useTransactions } from '../hook/useTransaction';
import { useSavingGoals } from '../hook/useSavingGoal';
import { useCategories } from '../hook/useCategory';
import { usePeriod } from '../context/PeriodContext';
import { latestTransactionMonth, monthBounds, oneMonthBefore } from '../lib/period';
import { LAST_UPDATE_LABEL, NEXT_UPDATE_LABEL } from '../config/updates';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CashflowLineChart } from '../components/charts/CashflowLineChart';
import { CategoryDonut, type DonutSlice } from '../components/charts/CategoryDonut';
import {
  FREQUENCY_LABEL,
  formatCurrency,
  formatCurrencyShort,
  formatDayMonth,
  formatMonthYear,
  formatPercent,
  formatSignedCurrency,
} from '../lib/format';

const PALETTE = ['#b5333a', '#cf4b4b', '#df6a5a', '#e88a6b', '#efab80', '#e0a53a', '#cbb6a6'];
const colorFor = (i: number) => PALETTE[((i % PALETTE.length) + PALETTE.length) % PALETTE.length];
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const accumulate = (rows: { expense: number }[]): number[] => {
  let sum = 0;
  return rows.map((r) => {
    sum += r.expense;
    return sum;
  });
};

export const OverviewPage = () => {
  const { data: transactions } = useTransactions();
  const { period } = usePeriod();

  // Anchor the dashboard on the month of the most recent transaction (falls back to now).
  const latestMonth = useMemo(() => latestTransactionMonth(transactions), [transactions]);

  // The Topbar's period selector can step back one month from that anchor.
  const activeMonth = period === 'PREVIOUS' ? oneMonthBefore(latestMonth) : latestMonth;

  const { first, last, prevFirst, prevYm } = useMemo(
    () => monthBounds(activeMonth),
    [activeMonth],
  );

  const { data: summary } = useMonthSummary(activeMonth);
  const { data: cashflow } = useCashflow(prevFirst, last, 'DAY');
  const { data: categories } = useExpensesByCategory(first, last);
  const { data: goals } = useSavingGoals();
  const { data: allCategories } = useCategories();

  const cumulative = useMemo(() => {
    const rows = cashflow ?? [];
    return {
      thisMonth: accumulate(rows.filter((b) => b.start.startsWith(activeMonth))),
      lastMonth: accumulate(rows.filter((b) => b.start.startsWith(prevYm))),
    };
  }, [cashflow, activeMonth, prevYm]);

  const slices: DonutSlice[] = (categories ?? []).map((c, i) => ({
    name: c.categoryName,
    value: c.total,
    color: colorFor(i),
  }));
  const expenseTotal = slices.reduce((s, x) => s + x.value, 0);

  const recent = useMemo(
    () => [...(transactions ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7),
    [transactions],
  );

  const topGoals = (goals ?? []).slice(0, 3);
  const net = summary?.net ?? 0;

  const overBudget = useMemo(() => {
    const budgetById = new Map(
      (allCategories ?? [])
        .filter((c) => c.id && c.monthlyBudget != null)
        .map((c) => [c.id as string, c.monthlyBudget as number]),
    );
    return (categories ?? [])
      .filter((c) => c.categoryId && budgetById.has(c.categoryId))
      .map((c) => ({
        name: c.categoryName,
        over: c.total - (budgetById.get(c.categoryId as string) as number),
      }))
      .filter((c) => c.over > 0);
  }, [categories, allCategories]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 rounded-control bg-line-soft px-2.5 py-1 font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {LAST_UPDATE_LABEL}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-control bg-gold-tint px-2.5 py-1 font-medium text-gold-text">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {NEXT_UPDATE_LABEL}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-light">Visão geral</h1>
          <div className="mt-1 text-[13px] text-faint capitalize">
            {formatMonthYear(`${activeMonth}-01`)}
          </div>
        </div>
        <div className="flex rounded-control border border-line bg-line-soft p-[3px]">
          <span className="rounded-[4px] bg-white px-3.5 py-1.5 text-[13px] font-medium shadow-[0_1px_2px_rgba(18,32,47,0.07)]">
            Fluxo de caixa
          </span>
          <span className="px-3.5 py-1.5 text-[13px] text-muted">Rendimento</span>
          <span className="px-3.5 py-1.5 text-[13px] text-muted">Despesa</span>
        </div>
      </div>

      {overBudget.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-card bg-expense-tint px-4 py-3 text-[13px] text-expense">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9 2.5 18a1.5 1.5 0 0 0 1.3 2.2h16.4a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" />
          </svg>
          <span>
            Acima do orçamento:{' '}
            {overBudget.map((c, i) => (
              <span key={c.name}>
                {i > 0 && ', '}
                <strong className="font-semibold">{c.name}</strong> (+{formatCurrency(c.over)})
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Saldo do mês"
          value={formatSignedCurrency(net)}
          valueClassName={net >= 0 ? 'text-income' : 'text-expense'}
          delta={summary?.netDeltaPct ?? null}
          caption="vs. mês anterior"
        />
        <StatCard
          label="Rendimentos"
          value={formatCurrency(summary?.income ?? 0)}
          delta={summary?.incomeDeltaPct ?? null}
          caption="vs. mês anterior"
        />
        <StatCard
          label="Despesas"
          value={formatCurrency(summary?.expense ?? 0)}
          delta={summary?.expenseDeltaPct ?? null}
          deltaInvert
          caption="vs. mês anterior"
        />
        <StatCard
          label="Taxa de poupança"
          value={formatPercent(summary?.savingsRate ?? 0)}
          caption="rendimento poupado"
        />
      </div>

      <div className="grid grid-cols-[1.15fr_1fr] gap-4">
        <Card>
          <div className="flex items-baseline justify-between">
            <SectionLabel>Fluxo de caixa</SectionLabel>
            <div className="flex gap-3.5 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-3.5 bg-brand" />
                Este mês
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 border-t-2 border-dotted border-gold" />
                Mês passado
              </span>
            </div>
          </div>
          <div className="mt-0.5 text-[13px] text-muted">Gasto acumulado</div>
          <CashflowLineChart
            thisMonth={cumulative.thisMonth}
            lastMonth={cumulative.lastMonth}
          />
          <div className="mt-2 text-xs text-faint">
            {formatCurrency(cumulative.lastMonth[cumulative.lastMonth.length - 1] ?? 0)} gastos no
            mesmo período do mês
            passado.
          </div>
        </Card>

        <Card>
          <SectionLabel>Despesas por categoria</SectionLabel>
          {slices.length ? (
            <CategoryDonut
              slices={slices}
              centerLabel="Despesas"
              centerValue={`−${formatCurrency(expenseTotal)}`}
            />
          ) : (
            <div className="mt-6 text-[13px] text-faint">Sem despesas neste período.</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <Card flush>
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <SectionLabel>Transações recentes</SectionLabel>
            <Link
              to="/transactions"
              className="text-xs font-medium text-brand hover:text-brand-strong"
            >
              Ver todas
            </Link>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'].map((h, i) => (
                  <th
                    key={h}
                    className={`border-b border-line-soft bg-[#fafbfc] px-5 py-[11px] text-[11px] font-semibold uppercase tracking-[0.05em] text-faint ${
                      i === 4 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => {
                const income = t.type === 'INCOME';
                return (
                  <tr key={t.id} className="border-t border-[#f1f3f5] text-[13px]">
                    <td className="whitespace-nowrap px-5 py-3 text-faint">
                      {formatDayMonth(t.date)}
                    </td>
                    <td className="px-5 py-3">{t.description}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                        <span
                          className="h-2 w-2 rounded-[2px]"
                          style={{
                            background: income
                              ? 'var(--color-income)'
                              : colorFor(hash(t.category?.name ?? '')),
                          }}
                        />
                        {t.category?.name ?? 'Sem categoria'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-faint">
                      {FREQUENCY_LABEL[t.frequency]}
                    </td>
                    <td
                      className={`tnum whitespace-nowrap px-5 py-3 text-right font-medium ${
                        income ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {formatSignedCurrency(income ? t.amount : -t.amount)}
                    </td>
                  </tr>
                );
              })}
              {!recent.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[13px] text-faint">
                    Sem transações.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <SectionLabel>Objetivos</SectionLabel>
            <Link
              to="/saving-goals"
              className="text-xs font-medium text-brand hover:text-brand-strong"
            >
              Gerir
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {topGoals.map((g) => {
              const pct =
                g.targetAmount > 0 ? ((g.currentAmount ?? 0) / g.targetAmount) * 100 : 0;
              return (
                <div key={g.id ?? g.name}>
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium">{g.name}</span>
                    <span className="tnum text-muted">
                      {formatCurrencyShort(g.currentAmount ?? 0)} /{' '}
                      {formatCurrencyShort(g.targetAmount)}
                    </span>
                  </div>
                  <ProgressBar percent={pct} className="mt-2" />
                  <div className="mt-1.5 text-[11px] text-faint">
                    {formatPercent(pct, 0)}
                    {g.endDate ? ` · meta ${formatMonthYear(g.endDate)}` : ''}
                  </div>
                </div>
              );
            })}
            {!topGoals.length && (
              <div className="text-[13px] text-faint">Sem objetivos.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
