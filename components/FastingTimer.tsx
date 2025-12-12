
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { Moon, Sun, Clock, Droplets, Plus, Minus, Settings, X, Check } from 'lucide-react';

interface FastingProps {
  state: AppState;
  updateFasting: (isActive: boolean, startTime: number | null, mode: any, duration?: number) => void;
  addWater: (amount: number) => void;
}

const FastingTimer: React.FC<FastingProps> = ({ state, updateFasting, addWater }) => {
  const [elapsed, setElapsed] = useState(0);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customHours, setCustomHours] = useState('');

  useEffect(() => {
    if (state.fasting.isActive && state.fasting.startTime) {
      const interval = setInterval(() => {
        setElapsed(Date.now() - state.fasting.startTime!);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsed(0);
    }
  }, [state.fasting.isActive, state.fasting.startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCustomStart = () => {
    const hours = Number(customHours);
    if (hours > 0) {
      updateFasting(true, Date.now(), 'custom', hours);
      setIsCustomModalOpen(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const waterIntake = state.dailyStats[today]?.waterIntake || 0;
  const waterGoal = state.goal?.dailyWater || 2000;

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Fasting Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[30px] p-8 text-white text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        
        <div className="relative z-10">
          <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs font-bold mb-6 backdrop-blur-sm border border-white/20">
             {state.fasting.isActive ? 'JEJUM ATIVO' : 'ALIMENTAÇÃO LIBERADA'}
          </div>

          <div className="text-5xl font-mono font-bold tracking-wider mb-2 tabular-nums">
             {state.fasting.isActive ? formatTime(elapsed) : '00:00:00'}
          </div>
          <p className="text-indigo-200 text-sm mb-8">
            {state.fasting.isActive 
              ? `Meta: ${state.fasting.targetDuration}h ${state.fasting.mode === 'custom' ? '(Personalizado)' : `(${state.fasting.mode === 'rabbit' ? 'Coelho' : state.fasting.mode === 'fox' ? 'Raposa' : 'Leão'})`}` 
              : 'Escolha seu modo para começar:'}
          </p>

          {!state.fasting.isActive ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '12h', mode: 'rabbit', icon: '🐰' },
                { label: '14h', mode: 'fox', icon: '🦊' },
                { label: '16h', mode: 'lion', icon: '🦁' },
              ].map((opt) => (
                <button 
                  key={opt.label}
                  onClick={() => updateFasting(true, Date.now(), opt.mode)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-3 backdrop-blur-sm transition-all active:scale-95 flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="text-xs font-bold">{opt.label}</div>
                </button>
              ))}
              <button 
                onClick={() => setIsCustomModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-3 backdrop-blur-sm transition-all active:scale-95 flex flex-col items-center justify-center"
              >
                 <div className="text-2xl mb-1 text-white"><Settings size={24} /></div>
                 <div className="text-xs font-bold">Definir</div>
              </button>
            </div>
          ) : (
             <button 
               onClick={() => updateFasting(false, null, 'rabbit')}
               className="w-full bg-white text-indigo-900 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg"
             >
               Encerrar Jejum
             </button>
          )}
        </div>
      </div>

      {/* Hydration Section */}
      <div className="bg-white p-6 rounded-[30px] shadow-sm border border-blue-50">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-500">
                <Droplets size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Hidratação</h3>
                <p className="text-xs text-gray-400">Meta: {waterGoal}ml</p>
              </div>
           </div>
           <div className="text-2xl font-bold text-blue-600">{waterIntake} <span className="text-sm text-gray-400 font-normal">ml</span></div>
        </div>

        {/* Visual Cups */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
           {Array.from({ length: Math.ceil(waterGoal / 250) }).map((_, i) => (
             <div key={i} className={`w-8 h-12 rounded-b-md border-2 border-blue-200 transition-all ${
               (i + 1) * 250 <= waterIntake ? 'bg-blue-400 border-blue-400' : 'bg-blue-50'
             }`}></div>
           ))}
        </div>

        <div className="flex gap-4">
           <button onClick={() => addWater(-250)} className="p-4 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200"><Minus /></button>
           <button onClick={() => addWater(250)} className="flex-1 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
             <Plus size={20} /> Beber 250ml
           </button>
        </div>
      </div>

      {/* Custom Fasting Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCustomModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xs p-6 rounded-[30px] relative z-10 animate-slide-up shadow-2xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800">Jejum Personalizado</h3>
               <button onClick={() => setIsCustomModalOpen(false)} className="p-1 bg-gray-100 rounded-full text-gray-500">
                 <X size={18} />
               </button>
             </div>
             
             <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Quantas horas?</label>
                  <input 
                    type="number"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    placeholder="Ex: 18"
                    className="w-full bg-gray-50 p-4 rounded-xl text-center text-2xl font-bold text-indigo-900 outline-none focus:ring-2 ring-indigo-100 transition-all"
                    autoFocus
                  />
               </div>
               
               <button 
                 onClick={handleCustomStart}
                 disabled={!customHours}
                 className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
               >
                 <Check size={18} /> Iniciar Agora
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FastingTimer;
