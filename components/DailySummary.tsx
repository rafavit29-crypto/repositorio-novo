
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AppState } from '../types';
import { Droplets, Zap } from 'lucide-react';

interface DailySummaryProps {
  state: AppState;
}

const DailySummary: React.FC<DailySummaryProps> = ({ state }) => {
  const today = new Date().toISOString().split('T')[0];
  const logs = state.foodLog.filter(f => f.date === today);
  const stats = state.dailyStats[today];

  const macros = logs.reduce((acc, item) => ({
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat
  }), { protein: 0, carbs: 0, fat: 0 });

  const data = [
    { name: 'Proteína', value: macros.protein, color: '#10B981' }, // emerald-500
    { name: 'Carboidrato', value: macros.carbs, color: '#60A5FA' }, // blue-400
    { name: 'Gordura', value: macros.fat, color: '#FBBF24' }, // amber-400
  ];

  // Verifica se há dados para exibir
  const hasData = macros.protein > 0 || macros.carbs > 0 || macros.fat > 0;

  const micronutrients = stats?.micronutrients || {
     vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0
  };

  const MicroRow = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-800">{Math.round(value)} <span className="text-xs font-normal text-gray-400">{unit}</span></span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in mt-6">
        {/* Macros Pie Chart */}
        <div className="card-saas p-6 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4 self-start flex items-center gap-2">
                Resumo de Macros
            </h3>
            <div className="h-48 w-full min-w-0">
                {hasData ? (
                    <ResponsiveContainer width="99%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-full w-48 h-48 mx-auto border-4 border-gray-100 border-dashed">
                        <span>Sem dados hoje</span>
                        <span className="text-xs mt-1">Registre refeições</span>
                    </div>
                )}
            </div>
             <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center border-t border-gray-50 pt-4">
                <div>
                    <span className="block font-bold text-lg text-gray-800">{Math.round(macros.protein)}g</span>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Prot</span>
                </div>
                <div className="border-x border-gray-50">
                    <span className="block font-bold text-lg text-gray-800">{Math.round(macros.carbs)}g</span>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Carb</span>
                </div>
                <div>
                    <span className="block font-bold text-lg text-gray-800">{Math.round(macros.fat)}g</span>
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Gord</span>
                </div>
            </div>
        </div>

        {/* Details: Hydration & Micronutrients */}
        <div className="space-y-6">
            {/* Hydration Mini Card */}
            <div className="card-saas p-6 flex items-center justify-between bg-blue-50 border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-blue-100 text-blue-500 rounded-full shadow-sm">
                        <Droplets size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">Hidratação</h4>
                        <p className="text-sm text-gray-600 font-medium">{stats?.waterIntake || 0} / {state.goal?.dailyWater || 2000} ml</p>
                    </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 relative z-10">
                    {Math.round(((stats?.waterIntake || 0) / (state.goal?.dailyWater || 2000)) * 100)}%
                </div>
            </div>

            {/* Micronutrients Table */}
            <div className="card-saas p-6 flex-1">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-teal-50 text-teal-500 rounded-lg">
                        <Zap size={18} />
                    </div>
                    Micronutrientes
                </h3>
                <div className="space-y-1">
                    <MicroRow label="Vitamina C" value={micronutrients.vitaminC} unit="mg" />
                    <MicroRow label="Ferro" value={micronutrients.iron} unit="mg" />
                    <MicroRow label="Cálcio" value={micronutrients.calcium} unit="mg" />
                    <MicroRow label="Potássio" value={micronutrients.potassium} unit="mg" />
                    <MicroRow label="Magnésio" value={micronutrients.magnesium} unit="mg" />
                </div>
            </div>
        </div>
    </div>
  );
};

export default DailySummary;
