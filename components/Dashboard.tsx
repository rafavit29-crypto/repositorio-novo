
import React, { useState, useEffect } from 'react';
import { AppState, Tab, FoodItem, Micronutrients } from '../types';
import { Coffee, Sun, Moon, Cookie, Plus, Clock, Droplets, ChevronRight, Zap, MessageCircle, User, Calendar } from 'lucide-react';
import CalorieRing from './CalorieRing';
import MacroDisplay from './MacroDisplay';
import MealCard from './MealCard';
import AddFoodModal from './AddFoodModal';
import MicronutrientTracker from './MicronutrientTracker';
import ProfileModal from './ProfileModal';
import RemindersModal from './RemindersModal';
import DailyGoalChart from './DailyGoalChart';
import DailySummary from './DailySummary'; // Importação corrigida para caminho relativo

interface DashboardProps {
  state: AppState;
  setActiveTab: (tab: Tab) => void;
  addFood?: (item: FoodItem) => void;
  editFood?: (item: FoodItem) => void;
  removeFood?: (id: string) => void;
  updateMicronutrients?: (key: keyof Micronutrients, value: number) => void;
  updateProfile?: (userData: AppState['user'], newGoal: AppState['goal']) => void;
  isProfileOpen?: boolean;
  setReminders?: (reminders: AppState['reminders']) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setActiveTab, addFood, editFood, removeFood, updateMicronutrients, updateProfile, isProfileOpen, setReminders }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('cafe');
  const [editingFoodItem, setEditingFoodItem] = useState<FoodItem | null>(null);
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    if (isProfileOpen) {
      setIsProfileModalOpen(true);
    }
  }, [isProfileOpen]);

  useEffect(() => {
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
    if (state.user.lastLogin < twoDaysAgo) {
      setShowCoach(true);
    }
  }, [state.user.lastLogin]);

  const today = new Date().toISOString().split('T')[0];
  const todaysLog = state.foodLog.filter(f => f.date === today);
  const todaysStats = state.dailyStats[today];

  const consumedCalories = todaysLog.reduce((acc, item) => acc + item.calories, 0);
  const consumedMacros = todaysLog.reduce((acc, item) => ({
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat
  }), { protein: 0, carbs: 0, fat: 0 });

  const targetCalories = state.goal?.dailyCalories || 2000;
  const targetMacros = state.goal?.macros || { protein: 150, carbs: 200, fat: 60 };

  const getMealItems = (type: string) => todaysLog.filter(item => item.mealType === type);

  const openAddModal = (type: string) => {
    setSelectedMealType(type);
    setEditingFoodItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: FoodItem) => {
    setSelectedMealType(item.mealType);
    setEditingFoodItem(item);
    setIsModalOpen(true);
  };

  const handleSaveFood = (foodData: any) => {
    if (editingFoodItem) {
        if (editFood) {
            editFood({
                ...editingFoodItem,
                ...foodData
            });
        }
    } else {
        if (addFood) {
            addFood({
                id: Date.now().toString(),
                date: today,
                timestamp: Date.now(),
                ...foodData
            });
        }
    }
  };

  const fastingActive = state.fasting.isActive;
  const waterIntake = todaysStats?.waterIntake || 0;
  const waterGoal = state.goal?.dailyWater || 2000;

  return (
    <div className="space-y-6 md:space-y-8 pb-4">
      
      {/* Coach Banner */}
      {showCoach && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between animate-slide-up">
           <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-full text-primary shadow-sm"><MessageCircle size={20} /></div>
             <div>
               <p className="font-semibold text-main text-sm">Bem-vinda de volta!</p>
               <p className="text-xs text-secondary">Vamos retomar o foco hoje?</p>
             </div>
           </div>
           <button onClick={() => setShowCoach(false)} className="text-primary text-xs font-semibold hover:underline">Fechar</button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           {/* User Avatar */}
           <div 
             onClick={() => setIsProfileModalOpen(true)}
             className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-soft bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
           >
             {state.user.avatar ? (
               <img src={state.user.avatar} alt="Perfil" className="w-full h-full object-cover" />
             ) : (
               <User size={24} className="text-gray-300" />
             )}
           </div>
           
           <div className="flex flex-col">
             <h1 className="text-xl md:text-3xl font-bold text-main">Olá, {state.user.name || 'Usuária'}</h1>
             <p className="text-xs md:text-base text-secondary mt-0.5 md:mt-1">Aqui está o resumo do seu dia.</p>
           </div>
        </div>

        <div className="flex gap-2 pl-16 md:pl-0">
           <button 
             onClick={() => setIsRemindersOpen(true)}
             className="px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 rounded-lg text-xs md:text-sm font-medium text-secondary hover:border-primary hover:text-primary transition-all"
           >
             Lembretes
           </button>
           <button 
             onClick={() => setIsProfileModalOpen(true)}
             className="px-3 py-1.5 md:px-4 md:py-2 bg-primary text-white rounded-lg text-xs md:text-sm font-medium hover:bg-primary-dark transition-all shadow-sm"
           >
             Editar Perfil
           </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calorie & Macro Card */}
        <div className="lg:col-span-2 card-saas p-5 md:p-8 space-y-6 md:space-y-8">
           {/* Top Row: Ring and Macros */}
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="flex flex-col items-center">
                <CalorieRing consumed={consumedCalories} target={targetCalories} />
              </div>
              
              <div className="h-px w-full sm:w-px sm:h-32 bg-gray-100"></div>

              <div className="flex-1 w-full">
                <MacroDisplay consumed={consumedMacros} target={targetMacros} />
              </div>
           </div>
           
           {/* Bottom Row: Goal Chart */}
           <div className="pt-4 md:pt-6 border-t border-gray-50">
              <DailyGoalChart consumed={consumedCalories} target={targetCalories} />
           </div>
        </div>

        {/* Quick Access Grid */}
        <div className="flex flex-col gap-4">
          
          {/* Fasting Widget */}
          <div 
            onClick={() => setActiveTab(Tab.JEJUM)}
            className="flex-1 card-saas p-5 md:p-6 cursor-pointer hover:shadow-hover transition-all group border-l-4 border-l-primary"
          >
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary-light text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <Clock size={20} />
                </div>
                {fastingActive && <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>}
             </div>
             <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Jejum</p>
             <h3 className="text-lg font-bold text-main mt-1">
               {fastingActive ? 'Ativo' : 'Iniciar'}
             </h3>
          </div>

          {/* Hydration Widget */}
          <div 
            onClick={() => setActiveTab(Tab.JEJUM)}
            className="flex-1 card-saas p-5 md:p-6 cursor-pointer hover:shadow-hover transition-all group border-l-4 border-l-blue-400"
          >
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Droplets size={20} />
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500" />
             </div>
             <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Hidratação</p>
             <div className="flex items-baseline gap-1 mt-1">
               <h3 className="text-lg font-bold text-main">{waterIntake}</h3>
               <span className="text-xs text-gray-400">/ {waterGoal}ml</span>
             </div>
             <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${Math.min((waterIntake/waterGoal)*100, 100)}%` }}></div>
             </div>
          </div>

          {/* Calendar Widget */}
          <div 
            onClick={() => setActiveTab(Tab.CALENDARIO)}
            className="flex-1 card-saas p-5 md:p-6 cursor-pointer hover:shadow-hover transition-all group border-l-4 border-l-purple-400"
          >
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Calendar size={20} />
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-500" />
             </div>
             <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Histórico</p>
             <h3 className="text-lg font-bold text-main mt-1">Calendário</h3>
          </div>
        </div>
      </div>

      {/* NEW SECTION: DAILY SUMMARY (Pie Chart & Micronutrients) */}
      <DailySummary state={state} />

      {/* Manual Micro Entry (If needed) */}
      {updateMicronutrients && (
        <MicronutrientTracker 
          data={todaysStats?.micronutrients} 
          onUpdate={updateMicronutrients} 
        />
      )}

      {/* Meals Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
           <h2 className="text-lg font-bold text-main">Refeições de Hoje</h2>
           <button onClick={() => openAddModal('lanche')} className="text-primary text-sm font-semibold hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
             <Plus size={16} /> Adicionar
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MealCard 
            title="Café da Manhã" 
            items={getMealItems('cafe')} 
            icon={<Coffee size={18} />}
            onAddClick={() => openAddModal('cafe')}
            onEditClick={openEditModal}
            onRemove={removeFood}
          />
          
          <MealCard 
            title="Almoço" 
            items={getMealItems('almoco')} 
            icon={<Sun size={18} />}
            onAddClick={() => openAddModal('almoco')}
            onEditClick={openEditModal}
            onRemove={removeFood}
          />

          <MealCard 
            title="Jantar" 
            items={getMealItems('jantar')} 
            icon={<Moon size={18} />}
            onAddClick={() => openAddModal('jantar')}
            onEditClick={openEditModal}
            onRemove={removeFood}
          />

          <MealCard 
            title="Lanches" 
            items={getMealItems('lanche')} 
            icon={<Cookie size={18} />}
            onAddClick={() => openAddModal('lanche')}
            onEditClick={openEditModal}
            onRemove={removeFood}
          />
        </div>
      </div>

      {/* Modals */}
      <AddFoodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveFood}
        mealType={selectedMealType}
        initialData={editingFoodItem}
      />
      
      {updateProfile && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            if(isProfileOpen) setActiveTab(Tab.DASHBOARD);
          }}
          user={state.user}
          currentGoal={state.goal}
          onSave={updateProfile}
        />
      )}

      {setReminders && (
        <RemindersModal 
          isOpen={isRemindersOpen}
          onClose={() => setIsRemindersOpen(false)}
          reminders={state.reminders}
          setReminders={setReminders}
        />
      )}
    </div>
  );
};

export default Dashboard;
