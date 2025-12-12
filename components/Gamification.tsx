
import React from 'react';
import { AppState, Badge, LeaderboardEntry } from '../types';
import { Trophy, Medal, Star, Lock, Crown, Utensils, Droplets, Dumbbell, MessageCircle } from 'lucide-react';

interface GamificationProps {
  state: AppState;
}

const Gamification: React.FC<GamificationProps> = ({ state }) => {
  const { user } = state;
  const nextLevelPoints = user.level * 1000;
  const progressPercent = Math.min((user.points / nextLevelPoints) * 100, 100);

  // Mock Leaderboard Data
  const leaderboard: LeaderboardEntry[] = [
    { userId: 'u1', name: 'Ana Clara', points: 3450, rank: 1, avatar: '👩', isCurrentUser: false },
    { userId: 'u2', name: 'Beatriz Costa', points: 3120, rank: 2, avatar: '👱‍♀️', isCurrentUser: false },
    { userId: 'me', name: user.name || 'Você', points: user.points, rank: 3, avatar: user.avatar || '👩', isCurrentUser: true },
    { userId: 'u3', name: 'Carla Dias', points: 2800, rank: 4, avatar: '👩‍🦱', isCurrentUser: false },
    { userId: 'u4', name: 'Daniela S.', points: 1500, rank: 5, avatar: '👩‍🦰', isCurrentUser: false },
  ].sort((a, b) => b.points - a.points); // Ensure sorted by points

  // Recalculate ranks after sort
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const getBadgeIcon = (iconName: string) => {
      switch(iconName) {
          case 'Utensils': return <Utensils size={20} className="text-white" />;
          case 'Droplets': return <Droplets size={20} className="text-white" />;
          case 'Dumbbell': return <Dumbbell size={20} className="text-white" />;
          case 'MessageCircle': return <MessageCircle size={20} className="text-white" />;
          case 'Crown': return <Crown size={20} className="text-white" />;
          default: return <Star size={20} fill="white" className="text-white" />;
      }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      
      {/* Level Header */}
      <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 opacity-10 rounded-bl-[100px] -mr-10 -mt-10"></div>
         
         <div className="relative z-10 flex-1 w-full text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
              <Crown className="text-yellow-500 fill-yellow-500" /> Nível {user.level}
            </h2>
            <p className="text-gray-500 text-sm mt-1 mb-4">Continue assim para alcançar o nível {user.level + 1}!</p>
            
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                 style={{ width: `${progressPercent}%` }}
               ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
               <span>{user.points} pts</span>
               <span>{nextLevelPoints} pts</span>
            </div>
         </div>

         <div className="bg-yellow-50 p-6 rounded-2xl flex flex-col items-center min-w-[150px]">
            <Star className="text-yellow-500 mb-2 w-8 h-8" fill="currentColor" />
            <span className="text-3xl font-bold text-gray-800">{user.points}</span>
            <span className="text-xs text-gray-500 uppercase font-bold">Total Pontos</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Leaderboard */}
        <div className="card-saas p-6">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
             <Trophy className="text-primary" size={20} /> Ranking Semanal
           </h3>
           <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div 
                  key={entry.userId} 
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    entry.isCurrentUser 
                      ? 'bg-primary/5 border-primary/20 scale-[1.02] shadow-sm' 
                      : 'bg-white border-gray-50'
                  }`}
                >
                   <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                      ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                        entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                        entry.rank === 3 ? 'bg-orange-100 text-orange-600' : 
                        'bg-white text-gray-400'}
                   `}>
                      {entry.rank <= 3 ? <Medal size={16} /> : entry.rank}
                   </div>
                   
                   <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {entry.avatar.includes('data:image') ? <img src={entry.avatar} className="w-full h-full object-cover"/> : entry.avatar}
                   </div>
                   
                   <div className="flex-1">
                      <p className={`font-bold text-sm ${entry.isCurrentUser ? 'text-primary' : 'text-gray-800'}`}>
                        {entry.name} {entry.isCurrentUser && '(Você)'}
                      </p>
                      <p className="text-xs text-gray-400">{entry.points} XP</p>
                   </div>
                   
                   {entry.rank === 1 && <Crown size={20} className="text-yellow-500 fill-yellow-500 animate-bounce" />}
                </div>
              ))}
           </div>
        </div>

        {/* Badges / Achievements */}
        <div className="card-saas p-6">
           <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
             <Medal className="text-purple-500" size={20} /> Suas Conquistas
           </h3>
           
           <div className="grid grid-cols-3 gap-4">
              {user.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    badge.unlocked 
                      ? 'bg-white border-gray-100 shadow-sm' 
                      : 'bg-gray-50 border-transparent opacity-60 grayscale'
                  }`}
                >
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      badge.unlocked ? badge.color : 'bg-gray-200 text-gray-400'
                   }`}>
                      {badge.unlocked ? getBadgeIcon(badge.icon) : <Lock size={16} />}
                   </div>
                   <p className="font-bold text-xs text-gray-800">{badge.name}</p>
                   <p className="text-[10px] text-gray-400 mt-1 leading-tight">{badge.description}</p>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Gamification;
