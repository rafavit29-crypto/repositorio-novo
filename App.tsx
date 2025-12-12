
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import FoodTracker from './components/FoodTracker';
import WorkoutPlanner from './components/WorkoutPlanner';
import MemberArea from './components/MemberArea';
import NutriChat from './components/NutriChat';
import FastingTimer from './components/FastingTimer';
import Community from './components/Community';
import Onboarding from './components/Onboarding';
import Gamification from './components/Gamification';
import CalendarHistory from './components/CalendarHistory';
import Integrations from './components/Integrations'; // Import
import ToastSystem, { Toast } from './components/ToastSystem';
import { AppState, Tab, FoodItem, Goal, Post, Micronutrients, Reminder, DailyStats, User, Notification, Badge, WorkoutDay } from './types';
import { generateGoal } from './utils/calculations';

const INITIAL_PLAN = [
  { id: '1', dayName: 'Segunda', focus: 'quadriceps', completed: false, exercises: [{ name: 'Agachamento', sets: 4, reps: '12' }] },
  { id: '2', dayName: 'Terça', focus: 'superiores', completed: false, exercises: [{ name: 'Supino', sets: 3, reps: '15' }] },
  { id: '3', dayName: 'Quarta', focus: 'gluteos', completed: false, exercises: [{ name: 'Elev. Pélvica', sets: 4, reps: '12' }] },
  { id: '4', dayName: 'Quinta', focus: 'posterior', completed: false, exercises: [{ name: 'Stiff', sets: 4, reps: '12' }] },
  { id: '5', dayName: 'Sexta', focus: 'inferiores', completed: false, exercises: [{ name: 'Afundo', sets: 3, reps: '12' }] },
  { id: '6', dayName: 'Sábado', focus: 'cardio', completed: false, exercises: [{ name: 'Esteira', sets: 1, reps: '30min' }] },
  { id: '7', dayName: 'Domingo', focus: 'descanso', completed: true, exercises: [] },
];

const MOCK_POSTS: Post[] = [
  { id: '1', author: 'Ana Clara', authorId: 'u1', avatar: '👱‍♀️', content: 'Meninas, consegui bater minha meta de jejum de 16h hoje! Estou muito feliz! 💪', likes: 12, commentsCount: 1, comments: [{id: 'c1', postId: '1', author: 'Mariana', avatar: '👩', content: 'Parabéns!!', timestamp: Date.now()}], timestamp: Date.now(), isLiked: false, isSaved: false, category: 'motivation' },
  { id: '2', author: 'Beatriz Costa', authorId: 'u2', avatar: '👩‍🦱', content: 'Alguém tem receita de panqueca fit sem banana? 🥞', likes: 5, commentsCount: 0, comments: [], timestamp: Date.now() - 3600000, isLiked: true, isSaved: false, category: 'recipes' },
  { id: '3', author: 'Carla Dias', authorId: 'u3', avatar: '👩‍🦰', content: 'Dica rápida: Bebam 500ml de água logo ao acordar. Ajuda muito a despertar e acelerar o metabolismo! 💧', likes: 25, commentsCount: 3, comments: [], timestamp: Date.now() - 7200000, isLiked: false, isSaved: true, category: 'tips' },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'like', message: 'Beatriz curtiu seu post.', timestamp: Date.now() - 100000, read: false, fromUser: 'Beatriz Costa' },
  { id: 'n2', type: 'system', message: 'Bem-vinda à comunidade!', timestamp: Date.now() - 500000, read: true },
];

const INITIAL_BADGES: Badge[] = [
  { id: 'b1', name: 'Iniciante', description: 'Criou sua conta', icon: 'Star', unlocked: true, color: 'bg-blue-400' },
  { id: 'b2', name: 'Focada', description: 'Registrou 1ª refeição', icon: 'Utensils', unlocked: false, color: 'bg-green-400' },
  { id: 'b3', name: 'Hidratada', description: 'Bebeu 2L de água', icon: 'Droplets', unlocked: false, color: 'bg-blue-500' },
  { id: 'b4', name: 'Fitness', description: 'Completou 1º treino', icon: 'Dumbbell', unlocked: false, color: 'bg-orange-400' },
  { id: 'b5', name: 'Social', description: 'Fez 1º post', icon: 'MessageCircle', unlocked: false, color: 'bg-pink-400' },
  { id: 'b6', name: 'Musa', description: 'Atingiu Nível 5', icon: 'Crown', unlocked: false, color: 'bg-purple-500' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('calorix_super_state_v7'); // Increased version
    if (saved) return JSON.parse(saved);
    
    return {
      user: { 
        name: '', 
        age: 0, 
        gender: 'female',
        weight: 0,
        height: 0,
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
        autoPersonalization: true,
        onboardingCompleted: false, 
        points: 0, 
        level: 1, 
        badges: INITIAL_BADGES,
        lastLogin: Date.now(),
        following: []
      },
      goal: null,
      foodLog: [],
      workoutPlan: INITIAL_PLAN,
      dailyStats: {},
      fasting: { isActive: false, startTime: null, targetDuration: 12, mode: 'rabbit', history: [] },
      communityPosts: MOCK_POSTS,
      notifications: MOCK_NOTIFICATIONS,
      reminders: [],
      settings: { notifications: true, unitSystem: 'metric' },
      integrations: { 
        googleFit: false, 
        appleHealth: false, 
        fitbit: false, 
        samsungHealth: false, 
        garmin: false, 
        strava: false, 
        xiaomi: false, 
        appleWatch: false 
      }
    };
  });

  useEffect(() => {
    if (state.user.allowLocalStorage) {
        localStorage.setItem('calorix_super_state_v7', JSON.stringify(state));
    }
    
    // Update last login
    const today = new Date().toISOString().split('T')[0];
    const lastLoginDay = new Date(state.user.lastLogin).toISOString().split('T')[0];
    if (today !== lastLoginDay) {
      setState(prev => ({ ...prev, user: { ...prev.user, lastLogin: Date.now() }}));
    }
  }, [state]);

  // AUTO-SYNC INTERVAL (Every 2 hours)
  useEffect(() => {
    const hasActiveIntegrations = Object.values(state.integrations).some(v => v === true);
    
    if (hasActiveIntegrations) {
      const interval = setInterval(() => {
        syncIntegrationsData(true); // Silent sync
      }, 2 * 60 * 60 * 1000); // 2 hours

      return () => clearInterval(interval);
    }
  }, [state.integrations]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const addPointsAndCheckBadges = (pointsToAdd: number, actionType: 'meal' | 'water' | 'workout' | 'post') => {
    setState(prev => {
      const newPoints = prev.user.points + pointsToAdd;
      const newLevel = Math.floor(newPoints / 1000) + 1;
      let newBadges = [...prev.user.badges];
      const newNotifications = [...prev.notifications];

      const unlockBadge = (id: string, name: string) => {
        const badgeIdx = newBadges.findIndex(b => b.id === id);
        if (badgeIdx !== -1 && !newBadges[badgeIdx].unlocked) {
           newBadges[badgeIdx] = { ...newBadges[badgeIdx], unlocked: true, dateUnlocked: Date.now() };
           
           newNotifications.unshift({
             id: Date.now().toString(),
             type: 'achievement',
             message: `Você desbloqueou a medalha ${name}!`,
             timestamp: Date.now(),
             read: false
           });
        }
      };

      if (actionType === 'meal') {
         if (prev.foodLog.length === 0) unlockBadge('b2', 'Focada');
      }
      if (actionType === 'workout') {
         const completedCount = prev.workoutPlan.filter(d => d.completed).length;
         if (completedCount === 0) unlockBadge('b4', 'Fitness');
      }
      if (actionType === 'post') {
         const myPosts = prev.communityPosts.filter(p => p.authorId === 'me');
         if (myPosts.length === 0) unlockBadge('b5', 'Social');
      }
      if (newLevel >= 5) unlockBadge('b6', 'Musa');

      return {
        ...prev,
        user: { ...prev.user, points: newPoints, level: newLevel, badges: newBadges },
        notifications: newNotifications
      };
    });
  };

  useEffect(() => {
    if (!state.goal) return;
    const today = new Date().toISOString().split('T')[0];
    const log = state.foodLog.filter(f => f.date === today);
    const stats = state.dailyStats[today] || { 
        date: today, steps: 0, caloriesBurned: 0, waterIntake: 0, fastingHours: 0,
        notifiedGoals: { calories: false, protein: false, water: false }
    };
    
    const cals = log.reduce((a, b) => a + b.calories, 0);
    const protein = log.reduce((a, b) => a + b.protein, 0);
    const notified = stats.notifiedGoals || { calories: false, protein: false, water: false };

    if (Math.abs(cals - state.goal.dailyCalories) < 50 && cals > 1000 && !notified.calories) {
      showToast('Parabéns! Você atingiu sua meta de calorias! 🎉', 'success');
      updateDailyStats(today, { notifiedGoals: { ...notified, calories: true } });
      addPointsAndCheckBadges(100, 'meal');
    }

    if (protein >= state.goal.macros.protein && !notified.protein) {
      showToast('Meta de proteínas batida! 💪', 'success');
      updateDailyStats(today, { notifiedGoals: { ...notified, protein: true } });
    }

    if ((stats.waterIntake || 0) >= state.goal.dailyWater && !notified.water) {
      showToast('Hidratação completa! 💧', 'success');
      updateDailyStats(today, { notifiedGoals: { ...notified, water: true } });
    }

    if ((stats.waterIntake || 0) >= 2000) {
        const isUnlocked = state.user.badges.find(b => b.id === 'b3')?.unlocked;
        if (!isUnlocked) {
            setState(prev => { 
                const badges = [...prev.user.badges];
                const idx = badges.findIndex(b => b.id === 'b3');
                if (idx !== -1 && !badges[idx].unlocked) {
                    badges[idx] = { ...badges[idx], unlocked: true, dateUnlocked: Date.now() };
                    const newNotifications = [...prev.notifications, {
                        id: Date.now().toString(),
                        type: 'achievement' as const,
                        message: `Você desbloqueou a medalha Hidratada!`,
                        timestamp: Date.now(),
                        read: false
                    }];
                    setTimeout(() => showToast('Conquista Desbloqueada: Hidratada! 🏆', 'success'), 0);
                    return { ...prev, user: { ...prev.user, badges }, notifications: newNotifications };
                }
                return prev;
            });
        }
    }
  }, [state.foodLog, state.dailyStats]);

  const updateDailyStats = (date: string, data: Partial<DailyStats>) => {
    setState(prev => {
        const current: DailyStats = prev.dailyStats[date] || { 
            date: date, steps: 0, caloriesBurned: 0, waterIntake: 0, fastingHours: 0,
            micronutrients: { vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0 }
        };
        return {
            ...prev,
            dailyStats: {
                ...prev.dailyStats,
                [date]: { ...current, ...data }
            }
        };
    });
  };

  const updateGoal = (goal: Goal) => {
    setState(prev => ({ ...prev, goal }));
    setActiveTab(Tab.DASHBOARD);
  };

  const updateProfile = (userData: User, newGoal: Goal) => {
    setState(prev => ({ ...prev, user: { ...prev.user, ...userData }, goal: newGoal }));
    showToast('Perfil e metas atualizados com sucesso!', 'success');
  };

  const addFood = (item: FoodItem) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      const currentStats = prev.dailyStats[today] || { 
        date: today, steps: 0, caloriesBurned: 0, waterIntake: 0, fastingHours: 0, 
        micronutrients: { vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0 } 
      };
      const currentMicros = currentStats.micronutrients || { vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0 };
      
      const newMicros = { ...currentMicros };
      if (item.micronutrients) {
        newMicros.vitaminC += (item.micronutrients.vitaminC || 0);
        newMicros.iron += (item.micronutrients.iron || 0);
        newMicros.calcium += (item.micronutrients.calcium || 0);
        newMicros.potassium += (item.micronutrients.potassium || 0);
        newMicros.magnesium += (item.micronutrients.magnesium || 0);
      }
      return {
        ...prev,
        foodLog: [item, ...prev.foodLog],
        dailyStats: {
          ...prev.dailyStats,
          [today]: { ...currentStats, micronutrients: newMicros }
        }
      };
    });
    addPointsAndCheckBadges(10, 'meal');
    showToast('Refeição registrada!', 'success');
  };

  const editFood = (updatedItem: FoodItem) => {
    setState(prev => {
        // Find original to subtract its micronutrients if necessary (simplified here to just recalc or just update list)
        // For simplicity and correctness with micros, best is to recalculate micros for day or handle difference
        // Here we will just update the log. A full recalc of daily stats would be better but this is MVP.
        const newLog = prev.foodLog.map(f => f.id === updatedItem.id ? updatedItem : f);
        return { ...prev, foodLog: newLog };
    });
    showToast('Refeição atualizada!', 'success');
  };

  const removeFood = (foodId: string) => {
    setState(prev => {
      const itemToRemove = prev.foodLog.find(f => f.id === foodId);
      if (!itemToRemove) return prev;

      const date = itemToRemove.date;
      const currentStats = prev.dailyStats[date] || { 
          date: date, steps: 0, caloriesBurned: 0, waterIntake: 0, fastingHours: 0,
          micronutrients: { vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0 } 
      };
      const currentMicros = currentStats.micronutrients || { vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0 };

      const newMicros = { ...currentMicros };
      if (itemToRemove.micronutrients) {
        newMicros.vitaminC = Math.max(0, newMicros.vitaminC - (itemToRemove.micronutrients.vitaminC || 0));
        newMicros.iron = Math.max(0, newMicros.iron - (itemToRemove.micronutrients.iron || 0));
        newMicros.calcium = Math.max(0, newMicros.calcium - (itemToRemove.micronutrients.calcium || 0));
        newMicros.potassium = Math.max(0, newMicros.potassium - (itemToRemove.micronutrients.potassium || 0));
        newMicros.magnesium = Math.max(0, newMicros.magnesium - (itemToRemove.micronutrients.magnesium || 0));
      }

      const newFoodLog = prev.foodLog.filter(f => f.id !== foodId);

      return {
        ...prev,
        foodLog: newFoodLog,
        dailyStats: {
          ...prev.dailyStats,
          [date]: {
            ...currentStats,
            micronutrients: newMicros
          }
        }
      };
    });
    showToast('Refeição removida.', 'info');
  };

  const toggleWorkout = (dayId: string) => {
    setState(prev => {
      const updatedPlan = prev.workoutPlan.map(day => 
        day.id === dayId ? { ...day, completed: !day.completed } : day
      );
      return { ...prev, workoutPlan: updatedPlan };
    });
    const day = state.workoutPlan.find(d => d.id === dayId);
    if (!day?.completed) { // If it was false, now true
        addPointsAndCheckBadges(50, 'workout');
        showToast('Treino concluído! 💪', 'success');
    }
  };

  const updateStats = (steps: number, calories: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateDailyStats(today, { 
        steps: (state.dailyStats[today]?.steps || 0) + steps,
        caloriesBurned: (state.dailyStats[today]?.caloriesBurned || 0) + calories
    });
    showToast('Atividade registrada!', 'success');
  };

  const updateWorkoutDay = (dayId: string, exercises: { name: string; sets: number; reps: string }[]) => {
    setState(prev => ({
        ...prev,
        workoutPlan: prev.workoutPlan.map(d => d.id === dayId ? { ...d, exercises } : d)
    }));
    showToast('Plano de treino atualizado!', 'success');
  };

  const updateFasting = (isActive: boolean, startTime: number | null, mode: any, duration?: number) => {
    setState(prev => ({
      ...prev,
      fasting: { ...prev.fasting, isActive, startTime, mode, targetDuration: duration || prev.fasting.targetDuration }
    }));
    if (isActive) showToast('Jejum iniciado! Boa sorte.', 'info');
    else showToast('Jejum encerrado.', 'info');
  };

  const addWater = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const currentWater = state.dailyStats[today]?.waterIntake || 0;
    const newAmount = Math.max(0, currentWater + amount);
    updateDailyStats(today, { waterIntake: newAmount });
    if (amount > 0) addPointsAndCheckBadges(5, 'water');
  };

  // COMMUNITY ACTIONS
  const toggleLike = (postId: string) => {
    setState(prev => ({
      ...prev,
      communityPosts: prev.communityPosts.map(p => {
         if (p.id === postId) {
            const isLiked = !p.isLiked;
            return { ...p, isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 };
         }
         return p;
      })
    }));
  };

  const createPost = (content: string, media?: { type: 'image' | 'video', data: string }, category?: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: state.user.name || 'Usuária',
      authorId: 'me',
      avatar: state.user.avatar || '👩',
      content,
      image: media?.type === 'image' ? media.data : undefined,
      video: media?.type === 'video' ? media.data : undefined,
      likes: 0,
      commentsCount: 0,
      comments: [],
      timestamp: Date.now(),
      isLiked: false,
      isSaved: false,
      category: category || 'general'
    };
    setState(prev => ({ ...prev, communityPosts: [newPost, ...prev.communityPosts] }));
    addPointsAndCheckBadges(20, 'post');
    showToast('Post publicado com sucesso!', 'success');
  };

  const addComment = (postId: string, content: string) => {
      // Find post author to notify
      const post = state.communityPosts.find(p => p.id === postId);
      if (post && post.authorId !== 'me') {
          // Add notification logic here if needed (mocked)
      }

      const newComment = {
          id: Date.now().toString(),
          postId,
          author: state.user.name || 'Eu',
          avatar: state.user.avatar || '👩',
          content,
          timestamp: Date.now()
      };

      setState(prev => ({
          ...prev,
          communityPosts: prev.communityPosts.map(p => 
              p.id === postId ? { ...p, comments: [...p.comments, newComment], commentsCount: p.commentsCount + 1 } : p
          )
      }));
      showToast('Comentário enviado.', 'success');
  };

  const toggleSave = (postId: string) => {
      setState(prev => ({
          ...prev,
          communityPosts: prev.communityPosts.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p)
      }));
      showToast('Post salvo/removido.', 'info');
  };

  const reportPost = (postId: string) => {
      showToast('Post denunciado. Iremos analisar.', 'warning');
  };

  const toggleFollow = (userId: string) => {
      setState(prev => {
          const isFollowing = prev.user.following.includes(userId);
          const newFollowing = isFollowing 
              ? prev.user.following.filter(id => id !== userId)
              : [...prev.user.following, userId];
          return { ...prev, user: { ...prev.user, following: newFollowing } };
      });
  };

  const updateMicronutrients = (key: keyof Micronutrients, value: number) => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
       const stats = prev.dailyStats[today] || { 
           date: today, steps: 0, caloriesBurned: 0, waterIntake: 0, fastingHours: 0,
           micronutrients: { vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0 }
       };
       const micros = stats.micronutrients || { vitaminC: 0, iron: 0, calcium: 0, potassium: 0, magnesium: 0 };
       return {
          ...prev,
          dailyStats: {
             ...prev.dailyStats,
             [today]: {
                ...stats,
                micronutrients: { ...micros, [key]: value }
             }
          }
       };
    });
  };

  const setReminders = (reminders: Reminder[]) => {
    setState(prev => ({ ...prev, reminders }));
    showToast('Lembretes atualizados.', 'success');
  };

  const toggleIntegration = (key: keyof AppState['integrations']) => {
    setState(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: !prev.integrations[key]
      }
    }));
  };

  const syncIntegrationsData = (silent = false) => {
    // Mock sync data
    const stepsToAdd = Math.floor(Math.random() * 500);
    const calsToAdd = Math.floor(Math.random() * 50);
    
    updateStats(stepsToAdd, calsToAdd);
    
    setState(prev => ({
      ...prev,
      integrations: { ...prev.integrations, lastSync: Date.now() }
    }));
    
    if (!silent) showToast(`Sincronizado: +${stepsToAdd} passos, +${calsToAdd} kcal`, 'success');
  };

  if (!state.user.onboardingCompleted) {
    return (
      <Onboarding 
        finish={(userData) => {
          const goal = generateGoal(
            userData.weight, 
            userData.height, 
            userData.age, 
            userData.gender, 
            userData.activityLevel, 
            userData.sports, 
            userData.goalType,
            userData.targetWeight,
            userData.deadline
          );
          
          setState(prev => ({ 
             ...prev, 
             user: { ...prev.user, ...userData, onboardingCompleted: true },
             goal
          }));
        }} 
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentFastingMode={state.fasting.mode}
      notifications={state.notifications}
      user={state.user}
    >
      <ToastSystem toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {activeTab === Tab.DASHBOARD && (
        <Dashboard 
          state={state} 
          setActiveTab={setActiveTab} 
          addFood={addFood}
          editFood={editFood}
          removeFood={removeFood}
          updateMicronutrients={updateMicronutrients}
          updateProfile={updateProfile}
          isProfileOpen={false}
          setReminders={setReminders}
        />
      )}
      {activeTab === Tab.CALENDARIO && <CalendarHistory state={state} />}
      {activeTab === Tab.META && <Goals state={state} updateGoal={updateGoal} />}
      {activeTab === Tab.ALIMENTACAO && <FoodTracker state={state} addFood={addFood} />}
      {activeTab === Tab.TREINOS && (
        <WorkoutPlanner 
          state={state} 
          toggleWorkout={toggleWorkout} 
          updateStats={updateStats} 
          updateWorkoutDay={updateWorkoutDay}
        />
      )}
      {activeTab === Tab.JEJUM && <FastingTimer state={state} updateFasting={updateFasting} addWater={addWater} />}
      {activeTab === Tab.RANKING && <Gamification state={state} />}
      {activeTab === Tab.CALORIX && <MemberArea />}
      {activeTab === Tab.COMUNIDADE && (
        <Community 
          state={state} 
          toggleLike={toggleLike} 
          createPost={createPost} 
          addComment={addComment}
          toggleSave={toggleSave}
          reportPost={reportPost}
          toggleFollow={toggleFollow}
          user={state.user}
          notifications={state.notifications}
        />
      )}
      {activeTab === Tab.INTEGRACOES && <Integrations state={state} toggleIntegration={toggleIntegration} syncNow={() => syncIntegrationsData()} />}
      {activeTab === Tab.PERFIL && (
        <Dashboard 
          state={state} 
          setActiveTab={setActiveTab} 
          updateProfile={updateProfile}
          isProfileOpen={true}
        />
      )}
      {activeTab === Tab.NUTRIONLINE && <NutriChat />}
    </Layout>
  );
};

export default App;
