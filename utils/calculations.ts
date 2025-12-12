
import { ActivityLevel, Gender, Goal, GoalType } from '../types';

export const calculateBMR = (weight: number, height: number, age: number, gender: Gender): number => {
  // Mifflin-St Jeor Equation
  // Handle 'prefer_not_to_say' as female for calculation safety/average, or average of both. Defaulting to female formula as per original app context (Calorix - female focus).
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

export const calculateTDEE = (bmr: number, activity: ActivityLevel): number => {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activity] || 1.2));
};

export const calculateWaterGoal = (weight: number, sports: boolean): number => {
  let water = weight * 35; // 35ml per kg base
  if (sports) water += 500; // Add 500ml for sports
  return Math.round(water);
};

export const generateGoal = (
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activity: ActivityLevel,
  sports: boolean,
  goalType: GoalType,
  targetWeight?: number,
  deadline?: number
): Goal => {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activity);
  
  let dailyCalories = tdee;
  let proteinRatio = 0.3;
  let carbsRatio = 0.4;
  let fatRatio = 0.3;

  switch (goalType) {
    case 'lose_weight':
    case 'reduce_measurements':
      dailyCalories = tdee - 500; // Deficit standard
      proteinRatio = 0.35;
      carbsRatio = 0.35;
      fatRatio = 0.30;
      break;
    case 'define':
    case 'condition':
      dailyCalories = tdee - 250; // Small deficit
      proteinRatio = 0.40;
      carbsRatio = 0.35;
      fatRatio = 0.25;
      break;
    case 'gain_muscle':
      dailyCalories = tdee + 300; // Surplus
      proteinRatio = 0.30;
      carbsRatio = 0.50;
      fatRatio = 0.20;
      break;
    case 'maintain':
    case 'healthy_lifestyle':
      dailyCalories = tdee; // Maintenance
      proteinRatio = 0.30;
      carbsRatio = 0.40;
      fatRatio = 0.30;
      break;
  }

  // Safety floor
  if (dailyCalories < 1200) dailyCalories = 1200;

  return {
    currentWeight: weight,
    targetWeight: targetWeight || weight,
    days: deadline || 60,
    type: goalType,
    startDate: new Date().toISOString(),
    dailyCalories: Math.round(dailyCalories),
    dailyWater: calculateWaterGoal(weight, sports),
    macros: {
      protein: Math.round((dailyCalories * proteinRatio) / 4),
      carbs: Math.round((dailyCalories * carbsRatio) / 4),
      fat: Math.round((dailyCalories * fatRatio) / 9),
    }
  };
};
