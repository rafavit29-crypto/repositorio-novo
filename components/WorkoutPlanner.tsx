
import React, { useState } from 'react';
import { AppState, WorkoutDay } from '../types';
import { CheckCircle2, Circle, Dumbbell, Flame, Footprints, Plus, Edit2 } from 'lucide-react';
import AddWorkoutModal from './AddWorkoutModal';

interface WorkoutPlannerProps {
  state: AppState;
  toggleWorkout: (dayId: string) => void;
  updateStats: (steps: number, calories: number) => void;
  addExercisesToPlan?: (dayId: string, exercises: { name: string; sets: number; reps: string }[]) => void;
  updateWorkoutDay?: (dayId: string, exercises: { name: string; sets: number; reps: string }[]) => void;
}

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ state, toggleWorkout, updateStats, addExercisesToPlan, updateWorkoutDay }) => {
  const [stepsInput, setStepsInput] = useState('');
  const [calInput, setCalInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
  
  const dayIndex = new Date().getDay();
  const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = daysMap[dayIndex];

  const handleUpdateStats = () => {
    if(stepsInput || calInput) {
      updateStats(Number(stepsInput || 0), Number(calInput || 0));
      setStepsInput('');
      setCalInput('');
    }
  }

  const handleSaveExercises = (dayId: string, exercises: { name: string; sets: number; reps: string }[]) => {
    // If we were editing a day (replacing exercises), call updateWorkoutDay
    if (editingDay && updateWorkoutDay) {
        updateWorkoutDay(dayId, exercises);
    } 
    // Otherwise, assume we are appending (default behavior of the 'add' button)
    else if (addExercisesToPlan) {
        addExercisesToPlan(dayId, exercises);
    }
  };

  const openNewWorkoutModal = () => {
      setEditingDay(null);
      setIsModalOpen(true);
  };

  const openEditWorkoutModal = (day: WorkoutDay) => {
      setEditingDay(day);
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <header className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Seus Treinos <span className="text-primary">💪</span></h1>
            <p className="text-gray-500 text-sm">Construindo sua melhor versão.</p>
         </div>
         <button 
           onClick={openNewWorkoutModal}
           className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-black transition-colors"
         >
           <Plus size={18} /> Novo Treino
         </button>
      </header>

      {/* Daily Input */}
      <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-20 h-20 bg-primary/5 rounded-bl-[100px]"></div>
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Flame size={18} className="text-orange-500" /> Registro Rápido
        </h3>
        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-gray-50 p-2 rounded-2xl flex items-center gap-2 border border-transparent focus-within:border-primary/30 transition-colors">
             <div className="bg-white p-2 rounded-xl shadow-sm text-blue-400"><Footprints size={18} /></div>
             <input 
                type="number" 
                value={stepsInput}
                onChange={e => setStepsInput(e.target.value)}
                placeholder="Passos"
                className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none placeholder-gray-400"
             />
          </div>
          <div className="flex-1 bg-gray-50 p-2 rounded-2xl flex items-center gap-2 border border-transparent focus-within:border-primary/30 transition-colors">
             <div className="bg-white p-2 rounded-xl shadow-sm text-orange-400"><Flame size={18} /></div>
             <input 
                type="number" 
                value={calInput}
                onChange={e => setCalInput(e.target.value)}
                placeholder="Kcal"
                className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none placeholder-gray-400"
             />
          </div>
        </div>
        <button 
          onClick={handleUpdateStats}
          className="w-full text-xs font-bold text-white uppercase tracking-wider py-3 bg-gray-900 rounded-xl hover:bg-black transition-colors"
        >
          Salvar Dados
        </button>
      </div>

      {/* Weekly Planner */}
      <div className="space-y-4">
        {state.workoutPlan.map((day) => {
          const isToday = day.dayName === todayName;
          
          return (
            <div 
              key={day.id} 
              className={`p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden group ${
                day.completed 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                  : isToday 
                    ? 'bg-white border-primary shadow-lg shadow-pink-100 scale-[1.02] z-10' 
                    : 'bg-white border-gray-100 opacity-90 hover:opacity-100'
              }`}
            >
              {isToday && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Hoje</div>}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isToday ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isToday ? 'text-gray-900' : 'text-gray-600'}`}>{day.dayName}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        {day.focus}
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); openEditWorkoutModal(day); }}
                            className="p-1 text-gray-300 hover:text-primary transition-colors"
                            title="Editar treino"
                        >
                            <Edit2 size={12} />
                        </button>
                    </div>
                  </div>
                </div>
                <button onClick={() => toggleWorkout(day.id)} className="transition-transform active:scale-90">
                  {day.completed 
                    ? <CheckCircle2 className="text-green-500 w-8 h-8 drop-shadow-sm" fill="white" /> 
                    : <Circle className="text-gray-200 w-8 h-8 hover:text-primary transition-colors" strokeWidth={1.5} />
                  }
                </button>
              </div>

              <div className="space-y-2 pl-2 border-l-2 border-gray-100 ml-4">
                 {day.exercises.map((ex, idx) => (
                   <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                     <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                     <span className="flex-1">{ex.name} <span className="text-xs text-gray-400">({ex.sets}x {ex.reps})</span></span>
                   </div>
                 ))}
                 {day.exercises.length === 0 && (
                   <p className="text-xs text-gray-300 italic">Nenhum exercício registrado.</p>
                 )}
                 <div className="flex items-center gap-2 text-sm font-medium text-primary mt-3 pt-2 border-t border-dashed border-gray-200">
                   <Flame size={14} /> Cardio (30min)
                 </div>
              </div>
            </div>
          )
        })}
      </div>

      <AddWorkoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        days={state.workoutPlan}
        onSave={handleSaveExercises}
        initialDayId={editingDay?.id}
        initialExercises={editingDay?.exercises}
      />
    </div>
  );
};

export default WorkoutPlanner;
