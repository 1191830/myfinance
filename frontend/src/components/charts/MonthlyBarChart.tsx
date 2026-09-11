export interface MonthlyDatum {
  label: string; // short month label, e.g. "J"
  monthIndex: number; // 0..11
  income: number;
  expense: number;
}

interface MonthlyBarChartProps {
  data: MonthlyDatum[];
  onSelect?: (monthIndex: number) => void;
}

const LEFT = 44;
const RIGHT = 748;
const TOP = 18;
const BASE = 190;

export const MonthlyBarChart = ({ data, onSelect }: MonthlyBarChartProps) => {
  const max =
    Math.max(1, ...data.flatMap((d) => [d.income, d.expense])) * 1.1;
  const groupW = (RIGHT - LEFT) / Math.max(1, data.length);
  const y = (v: number) => BASE - ((BASE - TOP) * v) / max;
  const gridY = [TOP, TOP + (BASE - TOP) / 2, BASE];

  return (
    <svg viewBox="0 0 760 224" className="mt-3 block h-auto w-full">
      <g stroke="#eceef1" strokeWidth="1">
        {gridY.map((gy) => (
          <line key={gy} x1={LEFT} y1={gy} x2={RIGHT} y2={gy} />
        ))}
      </g>
      {data.map((d, i) => {
        const cx = LEFT + groupW * i + groupW / 2;
        const bw = Math.min(11, groupW / 3);
        return (
          <g
            key={d.monthIndex}
            className={onSelect ? 'cursor-pointer' : undefined}
            onClick={onSelect ? () => onSelect(d.monthIndex) : undefined}
          >
            <rect
              x={cx - bw - 1}
              y={y(d.income)}
              width={bw}
              height={BASE - y(d.income)}
              fill="var(--color-income)"
            />
            <rect
              x={cx + 1}
              y={y(d.expense)}
              width={bw}
              height={BASE - y(d.expense)}
              fill="var(--color-expense)"
            />
            <text
              x={cx}
              y={208}
              textAnchor="middle"
              fill="#8a97a4"
              fontSize="10"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
