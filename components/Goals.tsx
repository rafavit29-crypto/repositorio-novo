import React, { useState } from 'react';
import { AppState, Goal, GoalType } from '../types';
import { Target, ArrowRight, Sparkles, Scale } from 'lucide-react';

interface GoalsProps {
  state: AppState;
  updateGoal: (goal: Goal) => void;
}

const Goals: React.FC<GoalsProps> = ({ state, updateGoal }) => {
  const [currentWeight, setCurrentWeight] = useState(state.goal?.currentWeight || '');
  const [targetWeight, setTargetWeight] = useState(state.goal?.targetWeight || '');
  const [days, setDays] = useState(state.goal?.days || 30);
  const [type, setType] = useState<GoalType>(state.goal?.type || 'lose_weight');

  const goalOptions: { value: GoalType; label: string }[] = [
    { value: 'lose_weight', label: 'Emagrecer' },
    { value: 'define', label: 'Definir' },
    { value: 'gain_muscle', label: 'Ganhar Massa' }
  ];

  const calculateProjections = () => {
    const cw = Number(currentWeight);
    const tw = Number(targetWeight);
    const d = Number(days);

    if (!cw || !tw || !d) return null;

    const diff = cw - tw;
    if (diff <= 0 && type === 'lose_weight') return null;

    const totalCaloriesToBurn = diff * 7000;
    const dailyDeficit = Math.round(totalCaloriesToBurn / d);
    const weeklyLoss = (dailyDeficit * 7) / 7000;

    return { totalCaloriesToBurn, dailyDeficit, weeklyLoss };
  };

  const projections = calculateProjections();

  const handleSave = () => {
    const cw = Number(currentWeight);
    const tw = Number(targetWeight);
    const d = Number(days);
    
    // Default base metabolic rate assumption for calculation (can be refined)
    const baseCalories = 2000; 
    let dailyCalories = baseCalories;

    if (projections) {
        dailyCalories = baseCalories - projections.dailyDeficit;
    }
    
    // Safety check for calories
    if (dailyCalories < 1200) dailyCalories = 1200;

    // Standard macro split (can be adjusted based on type)
    const macros = {
        protein: Math.round((dailyCalories * 0.3) / 4),
        carbs: Math.round((dailyCalories * 0.4) / 4),
        fat: Math.round((dailyCalories * 0.3) / 9)
    };

    updateGoal({
      currentWeight: cw,
      targetWeight: tw,
      days: d,
      type,
      startDate: new Date().toISOString(),
      dailyCalories: Math.round(dailyCalories),
      dailyWater: Math.round(cw * 35), // 35ml per kg
      macros: macros
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Defina sua Meta <span className="text-primary">🎯</span></h1>
        <p className="text-gray-500 text-sm">Onde você quer chegar?</p>
      </header>

      <div className="glass-card p-6 rounded-[30px] space-y-6">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Objetivo Principal</label>
          <div className="flex bg-gray-50 p-1.5 rounded-2xl">
            {goalOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setType(option.value)}
                className={`flex-1 py-3 text-sm rounded-xl transition-all duration-300 font-medium ${
                  type === option.value 
                    ? 'bg-white text-primary shadow-sm scale-100' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm text-gray-500 font-medium">
              <Scale size={14} /> Peso Atual
            </label>
            <div className="relative">
              <input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="00"
                className="w-full bg-gray-50 p-4 rounded-2xl text-center text-xl font-bold text-gray-800 outline-none input-elegant placeholder-gray-300"
              />
              <span className="absolute right-4 top-5 text-xs text-gray-400">kg</span>
            </div>
          </div>
          <div className="space-y-2">
             <label className="flex items-center gap-1 text-sm text-gray-500 font-medium">
               <Target size={14} /> Meta
             </label>
             <div className="relative">
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="00"
                className="w-full bg-gray-50 p-4 rounded-2xl text-center text-xl font-bold text-gray-800 outline-none input-elegant placeholder-gray-300"
              />
              <span className="absolute right-4 top-5 text-xs text-gray-400">kg</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-500 font-medium">Em quanto tempo?</label>
            <span className="text-primary font-bold bg-pink-50 px-3 py-1 rounded-lg text-sm">{days} dias</span>
          </div>
          <input
            type="range"
            min="15"
            max="180"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-pink-600 transition-all"
          />
        </div>
      </div>

      {projections && (
        <div className="space-y-4 animate-slide-up">
           <div className="relative bg-gradient-to-r from-pink-500 via-primary to-purple-500 p-6 rounded-[30px] text-white shadow-lg shadow-pink-200 overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
             
             <div className="relative z-10 flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                   <h3 className="font-semibold text-white/90 text-sm">Meta Diária Calculada</h3>
                   <p className="text-3xl font-bold">{projections.dailyDeficit} <span className="text-base font-normal opacity-80">kcal/dia</span></p>
                </div>
             </div>
             
             <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm font-medium">
               <span className="opacity-80">Perda estimada:</span>
               <span className="bg-white/20 px-3 py-1 rounded-full">~{projections.weeklyLoss.toFixed(1)} kg / semana</span>
             </div>
           </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold shadow-xl shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        Confirmar Plano <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default Goals;