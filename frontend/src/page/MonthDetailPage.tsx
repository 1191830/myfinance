import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTransactions } from '../hook/useTransaction';
import { useMonthSummary } from '../hook/useReports';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { SectionLabel } from '../components/ui/SectionLabel';
import { StatCard } from '../components/ui/StatCard';
import {
  FREQUENCY_LABEL,
  formatCurrency,
  formatDayMonth,
  formatSignedCurrency,
} from '../lib/format';
import type { TransactionModel } from '../model/TransactionModel';

const PALETTE = ['#b5333a', '#cf4b4b', '#df6a5a', '#e88a6b', '#efab80', '#e0a53a', '#cbb6a6'];
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const monthTitle = (year: number, month: number) => {
  const s = new Date(year, month - 1, 1).toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const Row = ({ t }: { t: TransactionModel }) => {
  const income = t.type === 'INCOME';
  const name = t.category?.name ?? 'Sem categoria';
  return (
    <div className="flex items-center gap-3 border-t border-[#f1f3f5] py-[13px] first:border-t-0">
      <span
        className="h-2 w-2 shrink-0 rounded-[2px]"
        style={{ background: income ? 'var(--color-income)' : PALETTE[hash(name) % PALETTE.length] }}
      />
      <div className="flex-1">
        <div className="text-[13px] font-medium text-ink">{t.description}</div>
        <div className="mt-0.5 text-xs text-faint">
          {formatDayMonth(t.date)} · {name} · {FREQUENCY_LABEL[t.frequency]}
        </div>
      </div>
      <span
        className={`tnum text-[13px] font-medium ${income ? 'text-income' : 'text-expense'}`}
      >
        {formatSignedCurrency(income ? t.amount : -t.amount)}
      </span>
    </div>
  );
};

export const MonthlyTransactionsPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const now = new Date();
  const year = Number(params.get('year')) || now.getFullYear();
  const month = Number(params.get('month')) || now.getMonth() + 1;
  const mm = String(month).padStart(2, '0');

  const { data: summary } = useMonthSummary(`${year}-${mm}`);
  const { data: transactions } = useTransactions();

  const monthTx = useMemo(
    () =>
      (transactions ?? [])
        .filter((t) => t.date.slice(0, 7) === `${year}-${mm}`)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    [transactions, year, mm],
  );
  const receitas = monthTx.filter((t) => t.type === 'INCOME');
  const despesas = monthTx.filter((t) => t.type === 'EXPENSE');

  const goMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    navigate(`/transactions/monthly?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  };

  const net = summary?.net ?? 0;
  const ArrowBtn = ({ dir }: { dir: -1 | 1 }) => (
    <button
      type="button"
      onClick={() => goMonth(dir)}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-control border border-[#d7dbe0] bg-white text-muted"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={dir === -1 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
      </svg>
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1.5 text-xs text-faint">
        <Link to="/transactions" className="text-faint hover:text-brand">
          Transações
        </Link>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        <span className="text-muted">{monthTitle(year, month)}</span>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <ArrowBtn dir={-1} />
            {monthTitle(year, month)}
            <ArrowBtn dir={1} />
          </span>
        }
        subtitle={`${monthTx.length} movimentos`}
        actions={
          <button
            type="button"
            className="h-[34px] rounded-control border border-[#d7dbe0] bg-white px-3.5 text-[13px] text-ink"
          >
            Exportar
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Balanço"
          value={formatSignedCurrency(net)}
          valueClassName={net >= 0 ? 'text-income' : 'text-expense'}
          delta={summary?.netDeltaPct ?? null}
          caption="vs. mês anterior"
        />
        <StatCard
          label="Receitas"
          value={formatCurrency(summary?.income ?? 0)}
          caption={`${receitas.length} movimento(s)`}
        />
        <StatCard
          label="Despesas"
          value={formatCurrency(summary?.expense ?? 0)}
          valueClassName="text-expense"
          caption={`${despesas.length} movimento(s)`}
        />
      </div>

      <div className="grid grid-cols-2 items-start gap-4">
        <Card>
          <div className="mb-1 flex items-baseline justify-between">
            <SectionLabel>Receitas</SectionLabel>
            <span className="text-xs text-faint">{receitas.length} movimento(s)</span>
          </div>
          {receitas.length ? (
            receitas.map((t) => <Row key={t.id} t={t} />)
          ) : (
            <div className="py-4 text-[13px] text-faint">Sem receitas neste mês.</div>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-baseline justify-between">
            <SectionLabel>Despesas</SectionLabel>
            <span className="text-xs text-faint">{despesas.length} movimento(s)</span>
          </div>
          {despesas.length ? (
            despesas.map((t) => <Row key={t.id} t={t} />)
          ) : (
            <div className="py-4 text-[13px] text-faint">Sem despesas neste mês.</div>
          )}
        </Card>
      </div>
    </div>
  );
};
