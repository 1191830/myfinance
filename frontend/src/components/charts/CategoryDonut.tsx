import { formatCurrency } from '../../lib/format';

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface CategoryDonutProps {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
  centerValueClassName?: string;
}

const R = 70;
const CIRC = 2 * Math.PI * R;

export const CategoryDonut = ({
  slices,
  centerLabel,
  centerValue,
  centerValueClassName = 'text-expense',
}: CategoryDonutProps) => {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;
  const arcs = slices.map((s) => {
    const frac = total > 0 ? s.value / total : 0;
    const len = frac * CIRC;
    const arc = { ...s, len, dashOffset: -offset };
    offset += len;
    return arc;
  });

  return (
    <div className="mt-3.5 flex items-center gap-[18px]">
      <div className="relative h-[168px] w-[168px] shrink-0">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="#f0f1f3" strokeWidth="26" />
          {arcs.map((a) => (
            <circle
              key={a.name}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth="26"
              strokeDasharray={`${a.len} ${CIRC - a.len}`}
              strokeDashoffset={a.dashOffset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[11px] text-faint">{centerLabel}</div>
          <div className={`tnum text-lg font-medium ${centerValueClassName}`}>{centerValue}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {slices.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="h-[9px] w-[9px] shrink-0 rounded-[2px]"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-muted">{s.name}</span>
            <span className="tnum font-medium">{formatCurrency(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
