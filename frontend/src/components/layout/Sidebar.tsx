import { NavLink } from 'react-router-dom';
import { useNetWorth } from '../../hook/useReports';
import { useSettings } from '../../hook/useSettings';
import { formatCurrency } from '../../lib/format';

const DEFAULT_NAME = 'Rui Marques';

const initialsOf = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase() || 'RM';
};

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

const SECONDARY_NAV = [
  {
    to: '/categories',
    label: 'Categorias',
    icon: (
      <svg {...iconProps}>
        <path d="M4 12V5.5A1.5 1.5 0 0 1 5.5 4H12l8 8-8 8-8-8Z" />
        <circle cx="8.4" cy="8.4" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/recurring-transactions',
    label: 'Recorrências',
    icon: (
      <svg {...iconProps}>
        <path d="M4 4v6h6M20 20v-6h-6" />
        <path d="M5.5 15A8 8 0 0 0 19 8.5M18.5 9A8 8 0 0 0 5 15.5" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Definições',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      </svg>
    ),
  },
];

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

export const Sidebar = () => {
  const { data: settings } = useSettings();
  const displayName = settings?.displayName ?? DEFAULT_NAME;

  return (
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
      <div className="mx-3 my-2.5 h-px bg-navy-700" />
      {SECONDARY_NAV.map((item) => (
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
        {initialsOf(displayName)}
      </div>
      <div className="flex-1 leading-tight">
        <div className="text-[13px] font-medium text-white">{displayName}</div>
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
};
