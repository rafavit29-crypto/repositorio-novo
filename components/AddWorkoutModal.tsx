
import React, { useState, useEffect } from 'react';
import { X, Camera, Edit3, Plus, Trash2, Dumbbell, Save, Loader2, Calendar, Home, Sparkles } from 'lucide-react';
import { analyzeWorkoutImage, generateHomeWorkout } from '../services/geminiService';
import { WorkoutDay } from '../types';

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: WorkoutDay[];
  onSave: (dayId: string, exercises: { name: string, sets: number, reps: string }[]) => void;
  initialDayId?: string;
  initialExercises?: { name: string, sets: number, reps: string }[];
}

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ isOpen, onClose, days, onSave, initialDayId, initialExercises }) => {
  const [mode, setMode] = useState<'manual' | 'ai' | 'home_ai'>('manual');
  const [selectedDayId, setSelectedDayId] = useState(initialDayId || days[0]?.id || '1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Manual Form State
  const [exercises, setExercises] = useState<{ name: string, sets: number, reps: string }[]>([
    { name: '', sets: 3, reps: '12' }
  ]);

  // Home Workout Form State
  const [homeLevel, setHomeLevel] = useState('Iniciante');
  const [homeDuration, setHomeDuration] = useState('20');
  const [homeEquipment, setHomeEquipment] = useState('Peso do corpo (Sem equipamento)');

  // Update state when modal opens with initial data (Edit Mode)
  useEffect(() => {
    if (isOpen) {
        if (initialDayId) {
            setSelectedDayId(initialDayId);
        } else {
             // Reset to first day if not editing specific
             setSelectedDayId(days[0]?.id || '1');
        }

        if (initialExercises && initialExercises.length > 0) {
            setExercises([...initialExercises]);
            setMode('manual');
        } else {
             // Reset exercises if adding new
             setExercises([{ name: '', sets: 3, reps: '12' }]);
        }
    }
  }, [isOpen, initialDayId, initialExercises, days]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '12' }]);
  };

  const handleRemoveRow = (index: number) => {
    const newEx = [...exercises];
    newEx.splice(index, 1);
    setExercises(newEx);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const newEx = [...exercises];
    // @ts-ignore
    newEx[index][field] = value;
    setExercises(newEx);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeWorkoutImage(base64);
        setIsAnalyzing(false);
        
        if (result && result.exercises && Array.isArray(result.exercises)) {
          setExercises(result.exercises);
          setMode('manual'); // Switch to manual to review
        } else {
          alert('Não consegui identificar os exercícios. Tente uma foto mais nítida.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateHomeWorkout = async () => {
    setIsAnalyzing(true);
    const result = await generateHomeWorkout(homeLevel, homeDuration, homeEquipment);
    setIsAnalyzing(false);

    if (result && result.exercises && Array.isArray(result.exercises)) {
        setExercises(result.exercises);
        setMode('manual'); // Switch to manual to review
    } else {
        alert('Ocorreu um erro ao gerar o treino. Tente novamente.');
    }
  };

  const handleSave = () => {
    // Filter empty exercises if adding new, but if editing we might want to allow empty to clear list?
    // Let's filter empty names to avoid junk data
    const validExercises = exercises.filter(e => e.name.trim() !== '');
    
    // If editing and list is empty, we assume user wants to clear the workout.
    // If adding new, we prevent saving empty.
    if (!initialDayId && validExercises.length === 0) return;
    
    onSave(selectedDayId, validExercises);
    onClose();
    // Reset form
    setExercises([{ name: '', sets: 3, reps: '12' }]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-lg rounded-[30px] z-10 animate-slide-up shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                {initialDayId ? 'Editar Planejamento' : 'Novo Planejamento'}
            </span>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {initialDayId ? 'Editar Treino' : 'Adicionar Treino'} <Dumbbell className="text-primary" size={20} />
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Day Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
              <Calendar size={14} /> {initialDayId ? 'Editando Dia' : 'Selecione o Dia'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {days.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayId(day.id)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
                    selectedDayId === day.id 
                      ? 'bg-primary text-white border-primary shadow-md' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {day.dayName.substring(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-xs text-primary font-medium mt-2 text-right">
              {days.find(d => d.id === selectedDayId)?.dayName} - {days.find(d => d.id === selectedDayId)?.focus}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-gray-50 p-1 rounded-xl mb-6 overflow-x-auto">
            <button 
              onClick={() => setMode('manual')} 
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'manual' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
            >
              <Edit3 size={16} /> Manual
            </button>
            <button 
              onClick={() => setMode('ai')} 
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'ai' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
            >
              <Camera size={16} /> Scan Ficha
            </button>
            <button 
              onClick={() => setMode('home_ai')} 
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${mode === 'home_ai' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
            >
              <Home size={16} /> Treino em Casa
            </button>
          </div>

          {/* AI SCAN Mode */}
          {mode === 'ai' && (
             <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
               {isAnalyzing ? (
                 <div className="flex flex-col items-center">
                   <Loader2 size={40} className="text-primary animate-spin mb-3" />
                   <p className="text-sm font-bold text-gray-600">Lendo sua ficha...</p>
                 </div>
               ) : (
                 <>
                   <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-primary mb-3">
                     <Camera size={30} />
                   </div>
                   <h4 className="font-bold text-gray-800">Escanear Ficha de Treino</h4>
                   <p className="text-xs text-gray-400 mb-4 px-4">Tire uma foto legível da sua ficha da academia e a IA preencherá os exercícios.</p>
                   <label className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-100 cursor-pointer hover:bg-primary-dark transition-all w-full">
                     Carregar Foto
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                   </label>
                 </>
               )}
             </div>
          )}

          {/* HOME AI Mode */}
          {mode === 'home_ai' && (
             <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                   <Sparkles className="text-blue-500 flex-shrink-0" size={20} />
                   <p className="text-xs text-blue-700">A IA criará um treino personalizado para você fazer em casa agora mesmo.</p>
                </div>

                <div className="space-y-3">
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nível</label>
                      <select 
                        value={homeLevel}
                        onChange={(e) => setHomeLevel(e.target.value)}
                        className="input-saas w-full p-3 text-sm"
                      >
                         <option value="Iniciante">Iniciante</option>
                         <option value="Intermediário">Intermediário</option>
                         <option value="Avançado">Avançado</option>
                      </select>
                   </div>
                   
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duração (minutos)</label>
                      <select 
                        value={homeDuration}
                        onChange={(e) => setHomeDuration(e.target.value)}
                        className="input-saas w-full p-3 text-sm"
                      >
                         <option value="10">10 min (Rápido)</option>
                         <option value="20">20 min</option>
                         <option value="30">30 min (Ideal)</option>
                         <option value="45">45 min</option>
                         <option value="60">60 min (Completo)</option>
                      </select>
                   </div>

                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Equipamento disponível</label>
                      <select 
                        value={homeEquipment}
                        onChange={(e) => setHomeEquipment(e.target.value)}
                        className="input-saas w-full p-3 text-sm"
                      >
                         <option value="Peso do corpo">Peso do corpo (Nenhum)</option>
                         <option value="Elásticos">Elásticos (Minibands)</option>
                         <option value="Halteres">Halteres / Pesos Livres</option>
                         <option value="Cadeira e Garrafas">Cadeira e Garrafas d'água</option>
                         <option value="Completo">Academia em casa (Bancos, barras)</option>
                      </select>
                   </div>
                </div>

                <button 
                  onClick={handleGenerateHomeWorkout}
                  disabled={isAnalyzing}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 mt-2"
                >
                  {isAnalyzing ? (
                    <><Loader2 size={18} className="animate-spin" /> Criando Treino...</>
                  ) : (
                    <><Sparkles size={18} /> Gerar Treino em Casa</>
                  )}
                </button>
             </div>
          )}

          {/* Manual Mode (Also shows results from AI) */}
          {mode === 'manual' && (
            <div className="space-y-3">
              <div className="flex justify-between px-2 text-[10px] font-bold text-gray-400 uppercase">
                 <span className="flex-[2]">Exercício</span>
                 <span className="flex-1 text-center">Séries</span>
                 <span className="flex-1 text-center">Reps</span>
                 <span className="w-8"></span>
              </div>
              
              {exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2 animate-slide-up">
                   <input 
                     value={ex.name}
                     onChange={e => updateExercise(idx, 'name', e.target.value)}
                     placeholder="Nome do exercício"
                     className="flex-[2] bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm outline-none focus:border-primary"
                   />
                   <input 
                     type="number"
                     value={ex.sets}
                     onChange={e => updateExercise(idx, 'sets', Number(e.target.value))}
                     className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm text-center outline-none focus:border-primary"
                   />
                   <input 
                     value={ex.reps}
                     onChange={e => updateExercise(idx, 'reps', e.target.value)}
                     className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-2 text-sm text-center outline-none focus:border-primary"
                   />
                   <button 
                    onClick={() => handleRemoveRow(idx)}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              ))}

              <button 
                onClick={handleAddRow}
                className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all mt-2"
              >
                <Plus size={16} /> Adicionar Exercício
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50">
           <button 
             onClick={handleSave}
             className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-200 flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
           >
             <Save size={18} /> {initialDayId ? 'Atualizar Planejamento' : 'Salvar no Planejamento'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AddWorkoutModal;
