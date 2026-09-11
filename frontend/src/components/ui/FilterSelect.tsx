interface FilterSelectProps {
  /** shown as the placeholder / "all" option */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

/** White dropdown-styled native select for a filter bar. Empty value = "all". */
export const FilterSelect = ({ label, value, onChange, options }: FilterSelectProps) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-[34px] appearance-none rounded-control border border-[#d7dbe0] bg-white pl-3 pr-8 text-[13px] outline-none ${
        value ? 'text-ink' : 'text-muted'
      }`}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute right-2.5 top-[10px] text-muted"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </div>
);
