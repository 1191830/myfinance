import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDeleteTransaction, useTransactions, useTransactionsPage } from '../hook/useTransaction';
import { useCategories } from '../hook/useCategory';
import { useCashflow } from '../hook/useReports';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Segmented } from '../components/ui/Segmented';
import { FilterSelect } from '../components/ui/FilterSelect';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TransactionFormModal } from '../components/forms/TransactionFormModal';
import { MonthlyBarChart, type MonthlyDatum } from '../components/charts/MonthlyBarChart';
import {
  FREQUENCY_LABEL,
  formatDayMonth,
  formatSignedCurrency,
} from '../lib/format';
import type { TransactionModel, Frequency, TransactionType } from '../model/TransactionModel';

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

const PALETTE = ['#b5333a', '#cf4b4b', '#df6a5a', '#e88a6b', '#efab80', '#e0a53a', '#cbb6a6'];
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const catColor = (name: string, income: boolean) =>
  income ? 'var(--color-income)' : PALETTE[hash(name) % PALETTE.length];

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const PAGE_SIZE = 12;

type TypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export const TransactionsListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteTransaction();

  const [type, setType] = useState<TypeFilter>('ALL');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<TransactionModel | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TransactionModel | null>(null);

  const year = useMemo(() => {
    if (transactions && transactions.length) {
      return Number(
        transactions
          .reduce((max, t) => (t.date > max ? t.date : max), transactions[0].date)
          .slice(0, 4),
      );
    }
    return new Date().getFullYear();
  }, [transactions]);

  const { data: cashflow } = useCashflow(`${year}-01-01`, `${year}-12-31`, 'MONTH');

  const chartData: MonthlyDatum[] = useMemo(() => {
    const base: MonthlyDatum[] = MONTH_LETTERS.map((label, monthIndex) => ({
      label,
      monthIndex,
      income: 0,
      expense: 0,
    }));
    (cashflow ?? []).forEach((b) => {
      const m = Number(b.start.slice(5, 7)) - 1;
      if (base[m]) {
        base[m].income = type === 'EXPENSE' ? 0 : b.income;
        base[m].expense = type === 'INCOME' ? 0 : b.expense;
      }
    });
    return base;
  }, [cashflow, type]);

  const {
    data: pageData,
    isLoading: pageLoading,
    isError: pageIsError,
    error: pageError,
  } = useTransactionsPage({
    page: page - 1,
    size: PAGE_SIZE,
    type: type === 'ALL' ? undefined : (type as TransactionType),
    categoryId: categoryId || undefined,
    frequency: (frequency || undefined) as Frequency | undefined,
    search: search.trim() || undefined,
  });

  const rows = pageData?.content ?? [];
  const totalElements = pageData?.page.totalElements ?? 0;
  const pageCount = Math.max(1, pageData?.page.totalPages ?? 1);
  const current = Math.min(page, pageCount);

  const resetFilters = () => {
    setType('ALL');
    setCategoryId('');
    setFrequency('');
    setSearch('');
    setPage(1);
  };
  const onFilterChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const openEdit = (t: TransactionModel) => {
    setEditing(t);
    setFormOpen(true);
  };
  const confirmDelete = () => {
    if (toDelete?.id) deleteMutation.mutate(toDelete.id);
    setToDelete(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Transações"
        subtitle={`${totalElements} movimentos · ${year}`}
        actions={
          <Segmented<TypeFilter>
            value={type}
            onChange={onFilterChange(setType)}
            options={[
              { value: 'ALL', label: 'Todas' },
              { value: 'INCOME', label: 'Rendimentos' },
              { value: 'EXPENSE', label: 'Despesas' },
            ]}
          />
        }
      />

      <Card>
        <div className="flex items-baseline justify-between">
          <SectionLabel>Rendimento vs. despesa · {year}</SectionLabel>
          <div className="flex gap-3.5 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-income" />
              Rendimento
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-expense" />
              Despesa
            </span>
          </div>
        </div>
        <MonthlyBarChart
          data={chartData}
          onSelect={(monthIndex) =>
            navigate(`/transactions/monthly?year=${year}&month=${monthIndex + 1}`)
          }
        />
      </Card>

      <Card className="flex flex-wrap items-center gap-2.5 !p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => onFilterChange(setSearch)(e.target.value)}
          placeholder="Procurar descrição…"
          className="h-[34px] min-w-[220px] flex-1 rounded-control border border-[#d7dbe0] bg-white px-3 text-[13px] outline-none"
        />
        <FilterSelect
          label="Categoria"
          value={categoryId}
          onChange={onFilterChange(setCategoryId)}
          options={(categories ?? []).map((c) => ({ value: c.id ?? '', label: c.name }))}
        />
        <FilterSelect
          label="Recorrência"
          value={frequency}
          onChange={onFilterChange(setFrequency)}
          options={[
            { value: 'ONE_TIME', label: 'Único' },
            { value: 'RECURRING', label: 'Recorrente' },
          ]}
        />
        <button
          type="button"
          onClick={resetFilters}
          className="h-[34px] px-3 text-[13px] font-medium text-brand"
        >
          Limpar
        </button>
      </Card>

      <Card flush>
        {pageLoading && <div className="p-6 text-[13px] text-faint">A carregar…</div>}
        {pageIsError && (
          <div className="p-6 text-[13px] text-expense">{(pageError as Error).message}</div>
        )}
        {!pageLoading && !pageIsError && (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Data', 'Descrição', 'Categoria', 'Recorrência', 'Valor', ''].map((h, i) => (
                    <th
                      key={h || 'actions'}
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
                {rows.map((t) => {
                  const income = t.type === 'INCOME';
                  const name = t.category?.name ?? 'Sem categoria';
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
                            style={{ background: catColor(name, income) }}
                          />
                          {name}
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
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            className="text-faint hover:text-brand"
                            aria-label="Editar"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(t)}
                            className="text-faint hover:text-expense"
                            aria-label="Apagar"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-[13px] text-faint">
                      Nenhuma transação corresponde aos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              page={current}
              pageCount={pageCount}
              total={totalElements}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          </>
        )}
      </Card>

      <TransactionFormModal open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Apagar transação"
        message={`"${toDelete?.description ?? ''}" será removida permanentemente.`}
        confirmLabel="Apagar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};
