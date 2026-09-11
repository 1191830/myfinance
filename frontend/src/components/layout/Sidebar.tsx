import { NavLink } from 'react-router-dom';
import { useNetWorth } from '../../hook/useReports';
import { formatCurrency } from '../../lib/format';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const NAV = [
  {
    to: '/inicio',
    label: 'Início',
    icon: (
      <svg {...iconProps}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transações',
    icon: (
      <svg {...iconProps}>
        <rect x="5" y="3" width="14" height="18" rx="1.6" />
        <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
      </svg>
    ),
  },
  {
    to: '/investments',
    label: 'Investimentos',
    icon: (
      <svg {...iconProps}>
        <path d="M3 17l5-5 4 4 8-9" />
        <path d="M15 7h5v5" />
      </svg>
    ),
  },
  {
    to: '/saving-goals',
    label: 'Objetivos',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.6" />
      </svg>
    ),
  },
];
// Categorias / Definições: no pages yet — added when those screens land.

const SidebarSummary = () => {
  const { data } = useNetWorth();
  const total = data?.total ?? 0;
  const invShare = total > 0 ? (data!.investmentsValue / total) * 100 : 0;
  const savShare = total > 0 ? (data!.savingsValue / total) * 100 : 0;

  return (
    <div className="m-3 rounded-card bg-navy-800 px-[15px] py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#7f9cba]">
        Património
      </div>
      <div className="tnum mt-1 text-[25px] font-light tracking-tight text-white">
        {formatCurrency(total)}
      </div>
      <div className="mt-3 flex gap-3.5">
        <div className="flex-1">
          <div className="text-[11px] text-[#7f9cba]">Investimentos</div>
          <div className="tnum mt-px text-[13px] font-medium text-[#dfe8f1]">
            {formatCurrency(data?.investmentsValue ?? 0)}
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-navy-active">
            <div
              className="h-1 rounded-full bg-gold"
              style={{ width: `${invShare}%` }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-[#7f9cba]">Objetivos</div>
          <div className="tnum mt-px text-[13px] font-medium text-[#dfe8f1]">
            {formatCurrency(data?.savingsValue ?? 0)}
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-navy-active">
            <div
              className="h-1 rounded-full bg-navy-600"
              style={{ width: `${savShare}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = () => (
  <aside className="flex w-[248px] shrink-0 flex-col bg-navy-900">
    <div className="flex items-center gap-2.5 px-5 pb-3.5 pt-[18px]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
          stroke="var(--color-gold)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8 12.5l2.6 2.6L16 9.4"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-base font-semibold tracking-tight text-white">myfinance</span>
    </div>

    <nav className="flex flex-col gap-0.5 px-3 py-1.5">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex h-10 items-center gap-[11px] rounded-control px-3 text-sm ${
              isActive
                ? 'bg-navy-active font-medium text-white shadow-[inset_3px_0_0_var(--color-gold)]'
                : 'text-[#b9c9da] hover:bg-[#16375a] hover:text-white'
            }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>

    <div className="flex-1" />
    <SidebarSummary />

    <div className="flex items-center gap-2.5 border-t border-navy-700 px-[18px] py-3">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-navy-600 text-xs font-semibold text-white">
        RM
      </div>
      <div className="flex-1 leading-tight">
        <div className="text-[13px] font-medium text-white">Rui Marques</div>
        <div className="text-[11px] text-[#7f9cba]">Conta pessoal</div>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7f9cba"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  </aside>
);
