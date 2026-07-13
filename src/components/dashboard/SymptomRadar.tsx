'use client';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

// Visão Analítica do Lipedema (Multidimensional)
const data = [
  { subject: 'Dor Geral', intensidade: 8, base: 10 },
  { subject: 'Inchaço', intensidade: 6, base: 10 },
  { subject: 'Sensação Peso', intensidade: 9, base: 10 },
  { subject: 'Desidratação', intensidade: 5, base: 10 },
  { subject: 'Estresse', intensidade: 7, base: 10 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-dark-card border border-gray-100 dark:border-white/10 p-3 rounded-xl shadow-modal backdrop-blur-md">
        <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{payload[0].payload.subject}</p>
        <p className="text-teal font-semibold text-sm">Escala: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function SymptomRadar() {
  return (
    <div className="h-64 w-full flex items-center justify-center -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="var(--color-dark-border)" strokeDasharray="3 3"/>
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--color-teal)', fontSize: 11, fontWeight: 600 }} 
          />
          <Tooltip content={<CustomTooltip/>} />
          <Radar 
            name="Sintomas" 
            dataKey="intensidade" 
            stroke="var(--color-teal)" 
            strokeWidth={3} 
            fill="var(--color-mint)" 
            fillOpacity={0.6} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
