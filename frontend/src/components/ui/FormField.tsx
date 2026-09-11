import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Label + error-message wrapper around a caller-supplied input/select/textarea. */
export const FormField = ({ label, error, children, className = '' }: FormFieldProps) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-xs font-medium text-muted">{label}</span>
    {children}
    {error && <span className="text-xs text-expense">{error}</span>}
  </label>
);

/** Shared input/select/textarea classes so every field in every form looks the same. */
// eslint-disable-next-line react-refresh/only-export-components
export const formInputClass = (hasError = false) =>
  `h-9 w-full rounded-control border bg-white px-3 text-[13px] text-ink outline-none focus:border-brand ${
    hasError ? 'border-expense' : 'border-[#d7dbe0]'
  }`;
