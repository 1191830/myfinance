import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeriod } from '../../context/PeriodContext';

interface TopbarProps {
  onAdd: () => void;
}

const PERIOD_LABEL = {
  CURRENT: 'Este mês',
  PREVIOUS: 'Mês passado',
} as const;

export const Topbar = ({ onAdd }: TopbarProps) => {
  const navigate = useNavigate();
  const { period, setPeriod } = usePeriod();
  const [search, setSearch] = useState('');
  const [periodOpen, setPeriodOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
    navigate(`/transactions?search=${encodeURIComponent(term)}`);
    setSearch('');
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-navy-900 px-6">
      <form onSubmit={handleSearch} className="relative w-[280px]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7f9cba"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="absolute left-2.5 top-[9px]"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar transações…"
          className="h-[34px] w-full rounded-control border border-navy-700 bg-navy-800 pl-8 pr-3 text-[13px] text-white outline-none placeholder:text-[#7f9cba]"
        />
      </form>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPeriodOpen((o) => !o)}
            className="flex h-[34px] items-center gap-2 rounded-control border border-navy-700 bg-navy-800 px-3 text-[13px] text-[#dfe8f1]"
          >
            {PERIOD_LABEL[period]}
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
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {periodOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-[150px] rounded-control border border-line bg-white py-1 shadow-lg">
              {(Object.keys(PERIOD_LABEL) as Array<keyof typeof PERIOD_LABEL>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setPeriod(key);
                    setPeriodOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-[13px] hover:bg-line-soft ${
                    key === period ? 'font-medium text-brand' : 'text-ink'
                  }`}
                >
                  {PERIOD_LABEL[key]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
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
      </div>
    </header>
  );
};
