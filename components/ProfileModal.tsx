import React, { useState, useEffect } from 'react';
import { Camera, X, Check, User as UserIcon, Activity, AlertCircle } from 'lucide-react';
import { AppState, ActivityLevel, Gender, GoalType } from '../types';
import { generateGoal } from '../utils/calculations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppState['user'];
  currentGoal: AppState['goal'];
  onSave: (userData: AppState['user'], newGoal: AppState['goal']) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, currentGoal, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user.name,
    age: user.age || 25,
    height: user.height || 165,
    weight: user.weight || 60,
    gender: user.gender || 'female',
    activityLevel: user.activityLevel || 'moderate',
    sports: user.sports || false,
    allergies: user.allergies || [],
    avatar: user.avatar || '',
    goalType: currentGoal?.type || 'lose_weight' as GoalType
  });

  const goalOptions: { value: GoalType; label: string }[] = [
    { value: 'lose_weight', label: 'Emagrecer' },
    { value: 'define', label: 'Definir' },
    { value: 'gain_muscle', label: 'Massa' }
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: user.name,
        age: user.age || 25,
        height: user.height || 165,
        weight: user.weight || 60,
        gender: user.gender || 'female',
        activityLevel: user.activityLevel || 'moderate',
        sports: user.sports || false,
        allergies: user.allergies || [],
        avatar: user.avatar || '',
        goalType: currentGoal?.type || 'lose_weight'
      });
    }
  }, [isOpen, user, currentGoal]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    const newGoal = generateGoal(
      formData.weight,
      formData.height,
      formData.age,
      formData.gender as Gender,
      formData.activityLevel as ActivityLevel,
      formData.sports,
      formData.goalType as GoalType
    );

    const updatedUser = {
      ...user,
      name: formData.name,
      age: formData.age,
      height: formData.height,
      weight: formData.weight,
      gender: formData.gender as Gender,
      activityLevel: formData.activityLevel as ActivityLevel,
      sports: formData.sports,
      allergies: formData.allergies,
      avatar: formData.avatar,
      goalType: formData.goalType as GoalType
    };

    onSave(updatedUser, newGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-sm rounded-[30px] shadow-2xl relative z-10 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-24 bg-gradient-to-r from-pink-400 to-purple-500 relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
            <X size={20} />
          </button>
          <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
             <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 shadow-lg overflow-hidden relative group">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><UserIcon size={40} /></div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" size={24} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
             </div>
          </div>
        </div>

        <div className="mt-12 text-center px-4 mb-2 flex-shrink-0">
           <h2 className="text-xl font-bold text-gray-800">Seu Perfil Biofísico</h2>
           <p className="text-xs text-gray-500">Usamos isso para calcular suas metas.</p>
        </div>

        {/* Scrolling Form */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Basic Info */}
          <div className="space-y-3">
             <p className="text-xs font-bold text-gray-400 uppercase border-b pb-1">Dados Básicos</p>
             <div className="space-y-2">
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl text-sm" placeholder="Nome" />
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                     <span className="text-xs text-gray-500">Idade</span>
                     <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="bg-transparent w-12 text-right font-bold outline-none" />
                   </div>
                   <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                     <span className="text-xs text-gray-500">Sexo</span>
                     <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="bg-transparent text-sm font-bold outline-none">
                       <option value="female">Fem</option>
                       <option value="male">Masc</option>
                     </select>
                   </div>
                </div>
             </div>
          </div>

          {/* Measurements */}
          <div className="space-y-3">
             <p className="text-xs font-bold text-gray-400 uppercase border-b pb-1">Medidas</p>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                   <span className="text-xs text-gray-500 block mb-1">Peso (kg)</span>
                   <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full bg-transparent font-bold text-lg outline-none text-green-600" />
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                   <span className="text-xs text-gray-500 block mb-1">Altura (cm)</span>
                   <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full bg-transparent font-bold text-lg outline-none text-blue-600" />
                </div>
             </div>
          </div>

          {/* Activity */}
          <div className="space-y-3">
             <p className="text-xs font-bold text-gray-400 uppercase border-b pb-1">Rotina & Objetivo</p>
             <select 
               value={formData.activityLevel} 
               onChange={e => setFormData({...formData, activityLevel: e.target.value as ActivityLevel})}
               className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none font-medium text-gray-700"
             >
               <option value="sedentary">Sedentária (Pouco ou nenhum exercício)</option>
               <option value="light">Leve (1-3 dias/semana)</option>
               <option value="moderate">Moderada (3-5 dias/semana)</option>
               <option value="active">Ativa (6-7 dias/semana)</option>
               <option value="athlete">Atleta (Intenso 2x/dia)</option>
             </select>
             
             <div className="flex items-center gap-2">
               <input type="checkbox" checked={formData.sports} onChange={e => setFormData({...formData, sports: e.target.checked})} className="w-5 h-5 accent-primary" />
               <span className="text-sm text-gray-600">Pratico esportes regularmente (+Água)</span>
             </div>

             <div className="grid grid-cols-3 gap-2 mt-2">
                {goalOptions.map(option => (
                  <button 
                    key={option.value}
                    onClick={() => setFormData({...formData, goalType: option.value})}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition-colors ${formData.goalType === option.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {option.label}
                  </button>
                ))}
             </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="p-6 pt-2 bg-white border-t border-gray-50 flex-shrink-0">
          <button 
            onClick={handleFinish}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-black"
          >
            <Activity size={18} /> Calcular Novas Metas & Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;