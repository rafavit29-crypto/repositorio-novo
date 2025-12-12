
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface DailyGoalChartProps {
  consumed: number;
  target: number;
}

const DailyGoalChart: React.FC<DailyGoalChartProps> = ({ consumed, target }) => {
  const data = [
    {
      name: 'Hoje',
      consumido: consumed,
      restante: Math.max(0, target - consumed),
      meta: target
    }
  ];

  const percentage = Math.min((consumed / target) * 100, 100);
  const isOver = consumed > target;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const remaining = Math.max(0, target - consumed);
      const over = Math.max(0, consumed - target);

      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
          <p className="font-bold text-gray-800 mb-1">Resumo Calórico</p>
          <p className="text-primary">Consumido: <span className="font-bold">{consumed}</span> kcal</p>
          <p className="text-gray-400">Meta: <span className="font-bold">{target}</span> kcal</p>
          <div className="mt-2 pt-2 border-t border-gray-50">
            {isOver ? (
              <p className="text-red-500 font-bold">Excedeu: {over} kcal</p>
            ) : (
              <p className="text-orange-500 font-bold">Faltam: {remaining} kcal</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48 flex flex-col">
      <div className="flex justify-between items-end mb-2 px-2">
        <div>
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Progresso da Meta</span>
           <div className="flex items-baseline gap-1">
             <span className={`text-xl font-bold ${isOver ? 'text-red-500' : 'text-gray-800'}`}>
               {percentage.toFixed(0)}%
             </span>
             <span className="text-xs text-gray-400">concluído</span>
           </div>
        </div>
        <div className="text-right">
           <span className="text-xs text-gray-400 block">Faltam</span>
           <span className="text-sm font-bold text-primary">
             {Math.max(0, target - consumed)} <span className="text-[10px] font-normal text-gray-400">kcal</span>
           </span>
        </div>
      </div>

      <div className="flex-1 w-full bg-gray-50 rounded-2xl p-2 border border-gray-100 relative min-w-0">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            barSize={32}
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide domain={[0, Math.max(target, consumed)]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            
            {/* Background Bar (Goal) */}
            <Bar dataKey="meta" fill="#E2E8F0" radius={[10, 10, 10, 10]} stackId="a" isAnimationActive={false} className="opacity-30" />
            
            {/* Foreground Bar (Consumed) - We use a trick to overlay or separate chart if needed, but here simple comparison */}
          </BarChart>
        </ResponsiveContainer>

        {/* Custom Overlay Bar for better visual control than Recharts stack sometimes allows for this specific 'progress bar' look */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-8 bg-gray-200 rounded-full overflow-hidden pointer-events-none">
           {/* Marker for Goal */}
           <div className="absolute right-0 top-0 bottom-0 w-1 bg-gray-300 z-10" title="Meta"></div>
           
           {/* Progress */}
           <div 
             className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-400' : 'bg-primary'}`}
             style={{ width: `${Math.min((consumed / target) * 100, 100)}%` }}
           >
              {/* Striped pattern overlay */}
              <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DailyGoalChart;
