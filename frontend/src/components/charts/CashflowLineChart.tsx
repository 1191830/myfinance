interface CashflowLineChartProps {
  /** cumulative spend per day, this month */
  thisMonth: number[];
  /** cumulative spend per day, previous month */
  lastMonth: number[];
}

const LEFT = 40;
const RIGHT = 540;
const TOP = 20;
const BASE = 210;

const buildPoints = (values: number[], max: number): string => {
  if (values.length < 2) return '';
  const span = RIGHT - LEFT;
  return values
    .map((v, i) => {
      const x = LEFT + (span * i) / (values.length - 1);
      const y = BASE - ((BASE - TOP) * v) / max;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
};

export const CashflowLineChart = ({ thisMonth, lastMonth }: CashflowLineChartProps) => {
  const max = Math.max(1, ...thisMonth, ...lastMonth) * 1.1;
  const thisPts = buildPoints(thisMonth, max);
  const lastPts = buildPoints(lastMonth, max);
  const gridY = [TOP, TOP + (BASE - TOP) / 3, TOP + (2 * (BASE - TOP)) / 3, BASE];
  const lastIdx = thisMonth.length - 1;
  const lastX = LEFT + (RIGHT - LEFT);
  const lastYv = thisMonth.length
    ? BASE - ((BASE - TOP) * thisMonth[lastIdx]) / max
    : BASE;

  return (
    <svg viewBox="0 0 560 240" className="mt-3 block h-auto w-full">
      <g stroke="#eceef1" strokeWidth="1">
        {gridY.map((y) => (
          <line key={y} x1={LEFT} y1={y} x2={RIGHT} y2={y} />
        ))}
      </g>
      {lastPts && (
        <polyline
          points={lastPts}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeDasharray="2 4"
          strokeLinecap="round"
        />
      )}
      {thisPts && (
        <>
          <polyline
            points={`${thisPts} ${lastX},${BASE} ${LEFT},${BASE}`}
            fill="var(--color-brand)"
            fillOpacity="0.08"
            stroke="none"
          />
          <polyline
            points={thisPts}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={lastX} cy={lastYv} r="3.5" fill="var(--color-brand)" />
        </>
      )}
      <g fill="#8a97a4" fontSize="10">
        <text x="34" y="228">
          01
        </text>
        <text x="270" y="228">
          15
        </text>
        <text x="516" y="228">
          {thisMonth.length || 30}
        </text>
      </g>
    </svg>
  );
};
