import type { ReactNode } from 'react';

/** The small uppercase "eyebrow" label above a card's content. */
export const SectionLabel = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`text-[11px] font-semibold uppercase tracking-[0.07em] text-faint ${className}`}
  >
    {children}
  </div>
);
