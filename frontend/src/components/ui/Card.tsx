import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** remove default padding (e.g. for a full-bleed table) */
  flush?: boolean;
}

export const Card = ({ children, className = '', flush = false }: CardProps) => (
  <div
    className={`rounded-card border border-line bg-white shadow-[0_1px_2px_rgba(18,32,47,0.05)] ${
      flush ? '' : 'p-5'
    } ${className}`}
  >
    {children}
  </div>
);
