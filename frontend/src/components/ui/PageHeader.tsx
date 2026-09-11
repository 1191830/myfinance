import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** left-side element rendered before the title (breadcrumb, back arrow) */
  above?: ReactNode;
  /** right-aligned actions (buttons, segmented control) */
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, above, actions }: PageHeaderProps) => (
  <div className="flex items-end justify-between">
    <div>
      {above}
      <h1 className="text-2xl font-light">{title}</h1>
      {subtitle && <div className="mt-1 text-[13px] text-faint">{subtitle}</div>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
