'use client';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartPoint {
  day: string;
  dor: number;
  energia: number;
}

const FALLBACK_DATA: ChartPoint[] = [
  { day: 'Seg', dor: 0, energia: 0 },
  { day: 'Ter', dor: 0, energia: 0 },
  { day: 'Qua', dor: 0, energia: 0 },
  { day: 'Qui', dor: 0, energia: 0 },
  { day: 'Sex', dor: 0, energia: 0 },
  { day: 'Sáb', dor: 0, energia: 0 },
  { day: 'Dom', dor: 0, energia: 0 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-dark-card border border-gray-100 dark:border-white/10 p-3 rounded-xl shadow-modal backdrop-blur-md">
        <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
        <p className="text-salmon font-semibold text-sm">Dor/Inchaço: {payload[0]?.value ?? 0}</p>
        <p className="text-sky font-semibold text-sm">Disposição: {payload[1]?.value ?? 0}</p>
      </div>
    );
  }
  return null;
};

interface PainTrendChartProps {
  data?: ChartPoint[];
}

export function PainTrendChart({ data }: PainTrendChartProps) {
  const chartData = (data && data.length > 0) ? data : FALLBACK_DATA;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-salmon)" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="var(--color-salmon)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEnergia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-sky)" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="var(--color-sky)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            tick={{ fill: '#888', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dx={-10}
            domain={[0, 10]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="dor"
            stroke="var(--color-salmon)"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorDor)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-salmon)" }}
          />
          <Area
            type="monotone"
            dataKey="energia"
            stroke="var(--color-sky)"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorEnergia)"
            activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-sky)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
