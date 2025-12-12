
export interface Goal {
  currentWeight: number;
  targetWeight: number;
  days: number;
  type: GoalType;
  startDate: string;
  dailyCalories: number;
  dailyWater: number; // ml
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Micronutrients {
  vitaminC: number;
  iron: number;
  calcium: number;
  potassium: number;
  magnesium: number;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string; // e.g., "100g", "1 unidade"
  feeling: 'satisfeita' | 'nao_satisfez' | 'mal' | 'arrependida';
  date: string;
  mealType: 'cafe' | 'almoco' | 'jantar' | 'lanche';
  timestamp: number;
  micronutrients?: Micronutrients;
}

export interface WorkoutDay {
  id: string;
  dayName: string;
  focus: 'quadriceps' | 'posterior' | 'gluteos' | 'inferiores' | 'superiores' | 'cardio' | 'descanso';
  completed: boolean;
  exercises: { name: string; sets: number; reps: string }[];
}

export interface DailyStats {
  date: string;
  steps: number;
  caloriesBurned: number;
  waterIntake: number; // ml
  fastingHours: number;
  mood?: 'happy' | 'neutral' | 'sad';
  micronutrients?: Micronutrients;
  notifiedGoals?: {
    calories: boolean;
    protein: boolean;
    water: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- Community Extended Types ---

export interface Comment {
  id: string;
  postId: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  author: string;
  authorId?: string;
  avatar: string; // emoji or url
  content: string;
  image?: string;
  video?: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  timestamp: number;
  isLiked: boolean;
  isSaved: boolean;
  category?: string; // general, motivation, recipes, tips
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'follow' | 'system' | 'achievement';
  message: string;
  timestamp: number;
  read: boolean;
  fromUser?: string;
}

export interface FastingState {
  isActive: boolean;
  startTime: number | null;
  targetDuration: number; // hours
  mode: 'rabbit' | 'fox' | 'lion' | 'custom';
  history: { date: string; duration: number; completed: boolean }[];
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:mm
  active: boolean;
  type: 'water' | 'meal' | 'workout';
}

// --- Gamification Types ---

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  unlocked: boolean;
  dateUnlocked?: number;
  color: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  isCurrentUser: boolean;
}

// --- Extended Profile Types ---

export type UnitSystem = 'metric' | 'imperial';
export type Gender = 'male' | 'female' | 'prefer_not_to_say';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose_weight' | 'gain_muscle' | 'define' | 'condition' | 'maintain' | 'reduce_measurements' | 'healthy_lifestyle';
export type HealthCondition = 'hypertension' | 'diabetes' | 'joints' | 'heart' | 'none' | 'other';
export type Allergy = 'lactose' | 'gluten' | 'peanuts' | 'eggs' | 'seafood' | 'none' | 'other';
export type DietStyle = 'normal' | 'vegetarian' | 'vegan' | 'low_carb' | 'high_protein' | 'flexible';
export type SleepDuration = 'less_5' | '5_6' | '6_7' | '7_8' | 'more_8';
export type SleepQuality = 'bad' | 'average' | 'good';
export type DisciplineLevel = 'low' | 'medium' | 'high';
export type MotivationType = 'quotes' | 'videos' | 'workouts' | 'recipes' | 'reminders';

export interface User {
  // 1. Profile
  name: string;
  age: number;
  gender: Gender;
  weight: number;
  height: number;
  unitSystem: UnitSystem;
  activityLevel: ActivityLevel;
  sports: boolean;
  sportsType?: string;

  // 2. Goal Details
  goalType: GoalType;
  targetWeight?: number;
  deadline?: number; // days

  // 3. Health
  conditions: HealthCondition[];
  allergies: Allergy[];
  otherCondition?: string;
  otherAllergy?: string;

  // 4. Diet
  dietStyle: DietStyle;
  dietPreferences?: string[]; // sweet, salty, home_cooked, eat_out
  waterConsumption: 'low' | 'medium' | 'high';
  alcoholConsumption: 'never' | 'sometimes' | 'frequent';

  // 5. Sleep
  sleepHours: SleepDuration;
  sleepQuality: SleepQuality;

  // 6. Behavior
  discipline: DisciplineLevel;
  motivation: MotivationType[];
  likesNotifications: boolean;

  // 7. System
  onboardingCompleted: boolean;
  allowLocalStorage: boolean;
  autoPersonalization: boolean;
  
  // Gamification
  avatar?: string;
  points: number;
  level: number;
  badges: Badge[]; // Array of user's badges
  lastLogin: number;
  following: string[]; // List of user IDs being followed
}

export interface AppState {
  user: User;
  goal: Goal | null;
  foodLog: FoodItem[];
  workoutPlan: WorkoutDay[];
  dailyStats: Record<string, DailyStats>;
  fasting: FastingState;
  communityPosts: Post[];
  notifications: Notification[];
  reminders: Reminder[];
  settings: {
    notifications: boolean;
    unitSystem: UnitSystem;
  };
  integrations: {
    googleFit: boolean;
    appleHealth: boolean;
    fitbit: boolean;
    samsungHealth: boolean;
    garmin: boolean;
    strava: boolean;
    xiaomi: boolean;
    appleWatch: boolean;
    lastSync?: number;
  };
}

export enum Tab {
  DASHBOARD = 'Dashboard',
  META = 'Meta',
  ALIMENTACAO = 'Alimentação',
  TREINOS = 'Treinos',
  CALORIX = 'Calorix',
  NUTRIONLINE = 'NutriOnline',
  JEJUM = 'Jejum',
  COMUNIDADE = 'Comunidade',
  PERFIL = 'Perfil',
  LOJA = 'Loja',
  ONBOARDING = 'Onboarding',
  RANKING = 'Conquistas',
  CALENDARIO = 'Calendário',
  INTEGRACOES = 'Integrações'
}
