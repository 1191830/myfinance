import type { ReactNode } from 'react';
import { Card } from './Card';
import { SectionLabel } from './SectionLabel';
import { DeltaBadge } from './DeltaBadge';

interface StatCardProps {
  label: string;
  value: string;
  /** colour the value (e.g. green net, crimson expense) */
  valueClassName?: string;
  /** percent delta shown as a badge */
  delta?: number | null;
  /** when true a rising delta is bad -> crimson */
  deltaInvert?: boolean;
  /** small caption next to the delta, or standalone */
  caption?: ReactNode;
}

export const StatCard = ({
  label,
  value,
  valueClassName = '',
  delta,
  deltaInvert,
  caption,
}: StatCardProps) => (
  <Card className="px-[18px] py-4">
    <SectionLabel>{label}</SectionLabel>
    <div className={`tnum mt-2 text-[23px] font-medium ${valueClassName}`}>{value}</div>
    {(delta !== undefined || caption) && (
      <div className="mt-[9px] flex items-center gap-1.5">
        {delta !== undefined && <DeltaBadge value={delta ?? null} invert={deltaInvert} />}
        {caption && <span className="text-xs text-faint">{caption}</span>}
      </div>
    )}
  </Card>
);
