// Visual-only for now: search, period selector and "Adicionar" get wired up
// when the add/edit flows land.
export const Topbar = () => (
  <header className="flex h-14 shrink-0 items-center justify-between bg-navy-900 px-6">
    <div className="relative w-[280px]">
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
        placeholder="Procurar transações…"
        className="h-[34px] w-full rounded-control border border-navy-700 bg-navy-800 pl-8 pr-3 text-[13px] text-white outline-none placeholder:text-[#7f9cba]"
      />
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="flex h-[34px] items-center gap-2 rounded-control border border-navy-700 bg-navy-800 px-3 text-[13px] text-[#dfe8f1]"
      >
        Este mês
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
    </div>
  </header>
);
