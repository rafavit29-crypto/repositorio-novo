
import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, User, Activity, Heart, Utensils, Moon, Brain, Lock, Check,
  Dumbbell, Apple, Coffee, Wine, Battery, AlertCircle, Scale, Ruler, Calendar
} from 'lucide-react';
import { User as UserType, ActivityLevel, Gender, UnitSystem, GoalType, HealthCondition, Allergy, DietStyle, SleepDuration, SleepQuality, DisciplineLevel, MotivationType } from '../types';

interface OnboardingProps {
  finish: (userData: UserType) => void;
}

const steps = [
  { id: 1, title: 'Perfil', icon: User, desc: 'Vamos nos conhecer melhor' },
  { id: 2, title: 'Objetivos', icon: Activity, desc: 'Onde você quer chegar?' },
  { id: 3, title: 'Saúde', icon: Heart, desc: 'Condições e restrições' },
  { id: 4, title: 'Nutrição', icon: Utensils, desc: 'Seus hábitos alimentares' },
  { id: 5, title: 'Sono', icon: Moon, desc: 'Qualidade do descanso' },
  { id: 6, title: 'Mente', icon: Brain, desc: 'Comportamento e foco' },
  { id: 7, title: 'Privacidade', icon: Lock, desc: 'Seus dados seguros' },
];

const Onboarding: React.FC<OnboardingProps> = ({ finish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: '',
    age: undefined,
    gender: 'female',
    weight: undefined,
    height: undefined,
    unitSystem: 'metric',
    activityLevel: 'sedentary',
    sports: false,
    goalType: 'lose_weight',
    conditions: [],
    allergies: [],
    dietStyle: 'normal',
    waterConsumption: 'medium',
    alcoholConsumption: 'sometimes',
    sleepHours: '6_7',
    sleepQuality: 'average',
    discipline: 'medium',
    motivation: [],
    likesNotifications: true,
    allowLocalStorage: true,
    autoPersonalization: true
  });

  const handleNext = () => {
    // Basic validation
    if (currentStep === 1) {
        if (!formData.name || !formData.age || !formData.weight || !formData.height) return alert("Por favor, preencha todos os campos do perfil.");
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      finish(formData as UserType);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateField = (field: keyof UserType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleList = (field: 'conditions' | 'allergies' | 'motivation', value: string) => {
    const list = formData[field] as string[] || [];
    if (list.includes(value)) {
      updateField(field, list.filter(i => i !== value));
    } else {
      updateField(field, [...list, value]);
    }
  };

  const SelectionCard = ({ selected, onClick, label, icon: Icon }: any) => (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-center gap-3
        ${selected 
          ? 'bg-primary-light border-primary text-primary shadow-sm' 
          : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}
      `}
    >
      {Icon && <Icon size={20} />}
      <span className="font-medium text-sm">{label}</span>
      {selected && <Check size={16} className="ml-auto" />}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#F7F9FB] z-[100] flex flex-col items-center justify-center p-4">
      
      {/* Progress Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-center mb-4 px-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-100">
                <span className="font-bold text-lg">{currentStep}</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-400 text-sm">{steps[currentStep - 1].desc}</p>
              </div>
           </div>
           <span className="text-xs font-bold text-gray-300 tracking-wider">PASSO {currentStep} DE 7</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentStep / 7) * 100}%` }}></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-2xl rounded-[20px] shadow-soft border border-gray-100 p-6 md:p-10 flex flex-col h-[70vh] md:h-auto overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          
          {/* STEP 1: PERFIL */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Como devemos te chamar?</label>
                <input 
                  value={formData.name} 
                  onChange={e => updateField('name', e.target.value)}
                  className="input-saas w-full p-3" 
                  placeholder="Seu nome"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Idade</label>
                   <input type="number" value={formData.age || ''} onChange={e => updateField('age', Number(e.target.value))} className="input-saas w-full p-3" placeholder="Anos" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Sexo</label>
                   <select value={formData.gender} onChange={e => updateField('gender', e.target.value)} className="input-saas w-full p-3">
                     <option value="female">Feminino</option>
                     <option value="male">Masculino</option>
                     <option value="prefer_not_to_say">Prefiro não dizer</option>
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Peso ({formData.unitSystem === 'metric' ? 'kg' : 'lbs'})</label>
                   <div className="relative">
                      <input type="number" value={formData.weight || ''} onChange={e => updateField('weight', Number(e.target.value))} className="input-saas w-full p-3 pl-10" placeholder="0.0" />
                      <Scale className="absolute left-3 top-3.5 text-gray-400" size={18} />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Altura ({formData.unitSystem === 'metric' ? 'cm' : 'ft'})</label>
                   <div className="relative">
                      <input type="number" value={formData.height || ''} onChange={e => updateField('height', Number(e.target.value))} className="input-saas w-full p-3 pl-10" placeholder="0" />
                      <Ruler className="absolute left-3 top-3.5 text-gray-400" size={18} />
                   </div>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nível de Atividade</label>
                <div className="grid grid-cols-1 gap-2">
                   {[
                     { v: 'sedentary', l: 'Sedentário (Pouco mov.)' },
                     { v: 'light', l: 'Leve (1-3 dias/sem)' },
                     { v: 'moderate', l: 'Moderado (3-5 dias/sem)' },
                     { v: 'active', l: 'Ativo (6-7 dias/sem)' },
                     { v: 'very_active', l: 'Muito Ativo (2x/dia)' },
                   ].map(opt => (
                     <SelectionCard 
                        key={opt.v} 
                        label={opt.l} 
                        selected={formData.activityLevel === opt.v} 
                        onClick={() => updateField('activityLevel', opt.v)} 
                        icon={Activity}
                     />
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OBJETIVOS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Qual seu objetivo principal?</label>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { v: 'lose_weight', l: 'Perder Peso' },
                     { v: 'gain_muscle', l: 'Ganhar Massa' },
                     { v: 'define', l: 'Definir Corpo' },
                     { v: 'maintain', l: 'Manter Peso' },
                     { v: 'reduce_measurements', l: 'Reduzir Medidas' },
                     { v: 'healthy_lifestyle', l: 'Vida Saudável' },
                   ].map(opt => (
                     <SelectionCard 
                        key={opt.v} 
                        label={opt.l} 
                        selected={formData.goalType === opt.v} 
                        onClick={() => updateField('goalType', opt.v)} 
                     />
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Peso Desejado</label>
                   <input type="number" value={formData.targetWeight || ''} onChange={e => updateField('targetWeight', Number(e.target.value))} className="input-saas w-full p-3" placeholder="Kg" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Prazo (Dias)</label>
                   <select value={formData.deadline || 60} onChange={e => updateField('deadline', Number(e.target.value))} className="input-saas w-full p-3">
                     <option value={30}>30 dias</option>
                     <option value={60}>60 dias</option>
                     <option value={90}>90 dias</option>
                     <option value={180}>6 meses</option>
                   </select>
                 </div>
              </div>
            </div>
          )}

          {/* STEP 3: SAÚDE */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Possui alguma condição?</label>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { v: 'none', l: 'Nenhuma' },
                     { v: 'hypertension', l: 'Hipertensão' },
                     { v: 'diabetes', l: 'Diabetes' },
                     { v: 'joints', l: 'Prob. Articulares' },
                     { v: 'heart', l: 'Prob. Cardíacos' },
                   ].map(opt => (
                     <SelectionCard 
                        key={opt.v} 
                        label={opt.l} 
                        selected={formData.conditions?.includes(opt.v as any)} 
                        onClick={() => opt.v === 'none' ? updateField('conditions', []) : toggleList('conditions', opt.v)}
                     />
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Possui alergias?</label>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { v: 'none', l: 'Nenhuma' },
                     { v: 'lactose', l: 'Lactose' },
                     { v: 'gluten', l: 'Glúten' },
                     { v: 'peanuts', l: 'Amendoim' },
                     { v: 'seafood', l: 'Frutos do Mar' },
                     { v: 'eggs', l: 'Ovos' },
                   ].map(opt => (
                     <SelectionCard 
                        key={opt.v} 
                        label={opt.l} 
                        selected={formData.allergies?.includes(opt.v as any)} 
                        onClick={() => opt.v === 'none' ? updateField('allergies', []) : toggleList('allergies', opt.v)}
                     />
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: NUTRIÇÃO */}
          {currentStep === 4 && (
             <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Estilo Alimentar</label>
                   <select value={formData.dietStyle} onChange={e => updateField('dietStyle', e.target.value)} className="input-saas w-full p-3">
                     <option value="normal">Normal / Sem restrições</option>
                     <option value="vegetarian">Vegetariano</option>
                     <option value="vegan">Vegano</option>
                     <option value="low_carb">Low Carb</option>
                     <option value="high_protein">Alta Proteína</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Consumo de Água</label>
                   <div className="grid grid-cols-3 gap-2">
                     {['low', 'medium', 'high'].map(l => (
                       <SelectionCard 
                         key={l} 
                         label={l === 'low' ? 'Baixo' : l === 'medium' ? 'Médio' : 'Alto'} 
                         selected={formData.waterConsumption === l} 
                         onClick={() => updateField('waterConsumption', l)} 
                       />
                     ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Álcool</label>
                   <div className="grid grid-cols-3 gap-2">
                     {['never', 'sometimes', 'frequent'].map(l => (
                       <SelectionCard 
                         key={l} 
                         label={l === 'never' ? 'Nunca' : l === 'sometimes' ? 'Às vezes' : 'Frequente'} 
                         selected={formData.alcoholConsumption === l} 
                         onClick={() => updateField('alcoholConsumption', l)} 
                       />
                     ))}
                   </div>
                </div>
             </div>
          )}

          {/* STEP 5: SONO */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700">Horas de Sono</label>
                 <div className="grid grid-cols-1 gap-2">
                   {[
                     { v: 'less_5', l: 'Menos de 5h' },
                     { v: '5_6', l: '5 a 6 horas' },
                     { v: '6_7', l: '6 a 7 horas' },
                     { v: '7_8', l: '7 a 8 horas' },
                     { v: 'more_8', l: 'Mais de 8 horas' },
                   ].map(opt => (
                     <SelectionCard 
                        key={opt.v} 
                        label={opt.l} 
                        selected={formData.sleepHours === opt.v} 
                        onClick={() => updateField('sleepHours', opt.v)} 
                        icon={Moon}
                     />
                   ))}
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700">Qualidade</label>
                 <div className="flex gap-2">
                    {['bad', 'average', 'good'].map(q => (
                      <div 
                        key={q}
                        onClick={() => updateField('sleepQuality', q)}
                        className={`flex-1 p-4 rounded-xl text-center border cursor-pointer transition-all ${
                          formData.sleepQuality === q ? 'bg-primary-light border-primary text-primary font-bold' : 'bg-white border-gray-100'
                        }`}
                      >
                         {q === 'bad' ? 'Ruim 😫' : q === 'average' ? 'Média 😐' : 'Boa 😴'}
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {/* STEP 6: COMPORTAMENTO */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700">Seu nível de disciplina</label>
                 <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(q => (
                      <div 
                        key={q}
                        onClick={() => updateField('discipline', q)}
                        className={`flex-1 p-4 rounded-xl text-center border cursor-pointer transition-all ${
                          formData.discipline === q ? 'bg-primary-light border-primary text-primary font-bold' : 'bg-white border-gray-100'
                        }`}
                      >
                         {q === 'low' ? 'Baixa' : q === 'medium' ? 'Média' : 'Alta'}
                      </div>
                    ))}
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">O que te motiva? (Múltipla)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'quotes', l: 'Frases' },
                      { v: 'videos', l: 'Vídeos' },
                      { v: 'workouts', l: 'Treinos' },
                      { v: 'recipes', l: 'Receitas' },
                      { v: 'reminders', l: 'Lembretes' }
                    ].map(opt => (
                      <SelectionCard 
                        key={opt.v} 
                        label={opt.l} 
                        selected={formData.motivation?.includes(opt.v as any)} 
                        onClick={() => toggleList('motivation', opt.v)}
                      />
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* STEP 7: PRIVACIDADE */}
          {currentStep === 7 && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center">
                   <Lock className="mx-auto text-primary mb-2" size={32} />
                   <h3 className="font-bold text-gray-800">Seus dados estão seguros</h3>
                   <p className="text-sm text-gray-500 mt-2">
                     Armazenamos tudo localmente no seu dispositivo. Nenhuma informação é compartilhada com terceiros.
                   </p>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="text-gray-400" size={20} />
                        <span className="text-sm font-medium text-gray-700">Salvar dados no dispositivo</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.allowLocalStorage} 
                        onChange={e => updateField('allowLocalStorage', e.target.checked)}
                        className="w-5 h-5 accent-primary" 
                      />
                   </div>
                   
                   <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Brain className="text-gray-400" size={20} />
                        <span className="text-sm font-medium text-gray-700">Personalização Automática (IA)</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.autoPersonalization} 
                        onChange={e => updateField('autoPersonalization', e.target.checked)}
                        className="w-5 h-5 accent-primary" 
                      />
                   </div>
                </div>
             </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="pt-6 mt-4 border-t border-gray-50 flex justify-between items-center">
           {currentStep > 1 ? (
             <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 font-medium hover:text-gray-800 transition-colors">
               <ChevronLeft size={20} /> Voltar
             </button>
           ) : <div></div>}

           <button 
             onClick={handleNext}
             className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-primary-dark transition-all flex items-center gap-2"
           >
             {currentStep === 7 ? 'Finalizar' : 'Próximo'} <ChevronRight size={20} />
           </button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
