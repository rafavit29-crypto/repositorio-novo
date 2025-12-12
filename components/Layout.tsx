import React, { useState } from 'react';
import { Tab, Notification } from '../types';
import { 
  LayoutDashboard, Target, Utensils, Dumbbell, PlayCircle, 
  MessageCircleHeart, Clock, Menu, Bell, Moon, Grid, User, LogOut, X, Users, Trophy, Calendar, Link
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  currentFastingMode?: 'rabbit' | 'fox' | 'lion' | 'custom';
  notifications?: Notification[];
  user?: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentFastingMode, notifications = [], user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: Tab.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { id: Tab.CALENDARIO, icon: Calendar, label: 'Calendário' },
    { id: Tab.META, icon: Target, label: 'Metas' },
    { id: Tab.ALIMENTACAO, icon: Utensils, label: 'Alimentação' },
    { id: Tab.TREINOS, icon: Dumbbell, label: 'Treinos' },
    { id: Tab.JEJUM, icon: Clock, label: 'Jejum' },
    { id: Tab.RANKING, icon: Trophy, label: 'Conquistas' },
    { id: Tab.CALORIX, icon: PlayCircle, label: 'Aulas' },
    { id: Tab.COMUNIDADE, icon: Users, label: 'Comunidade' },
    { id: Tab.INTEGRACOES, icon: Link, label: 'Integrações' },
    { id: Tab.PERFIL, icon: User, label: 'Meu Perfil' },
    { id: Tab.NUTRIONLINE, icon: MessageCircleHeart, label: 'Nutri IA' },
  ];

  // Items specifically for the mobile bottom bar
  const bottomNavItems = [
    { id: Tab.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
    { id: Tab.ALIMENTACAO, icon: Utensils, label: 'Diário' },
    { id: Tab.NUTRIONLINE, icon: MessageCircleHeart, label: 'Nutri IA' },
    { id: Tab.TREINOS, icon: Dumbbell, label: 'Treino' },
    { id: 'MENU', icon: Menu, label: 'Menu' }, // Special action
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-background text-main font-sans flex flex-col lg:flex-row">
      
      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar (Desktop Fixed / Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-surface border-r border-gray-100 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:h-screen lg:flex-shrink-0
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-20 flex items-center px-8 border-b border-gray-50 bg-surface">
             <div className="flex items-center gap-2">
               {/* Apple Icon */}
               <div className="w-8 h-8 flex items-center justify-center text-primary">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.8687 4.09325C17.1524 4.07255 16.294 4.50284 15.6596 5.25307C15.0718 5.92248 14.5961 6.94276 14.7571 7.89679C15.6366 7.95462 16.5385 7.42426 17.1009 6.74477C17.6534 6.07921 18.068 5.12282 17.8687 4.09325ZM16.669 8.23235C15.5492 8.24683 14.0724 9.07923 13.5229 9.07923C12.9103 9.07923 11.6961 8.35649 10.7422 8.38131C8.28828 8.44128 6.13009 9.94038 6.13009 13.5678C6.13009 15.6293 6.93874 18.0858 7.97931 19.6641C8.71804 20.7858 9.5441 21.9054 10.8705 21.864C12.1124 21.8226 12.4497 21.0566 14.0494 21.0566C15.6074 21.0566 15.9344 21.864 17.2797 21.8226C18.6679 21.7812 19.3444 20.7382 20.1017 19.5875C20.9126 18.3547 21.2334 17.1308 21.252 17.0605C21.2189 17.0439 18.9968 16.1415 18.9802 13.3443C18.9637 11.0287 20.7803 9.77079 20.8527 9.72528C19.7997 8.16409 18.1501 8.26131 16.669 8.23235Z" />
                 </svg>
               </div>
               <span className="text-xl font-bold text-main tracking-tight">Calorix</span>
             </div>
             <button className="ml-auto lg:hidden text-secondary p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={toggleSidebar}>
               <X size={24} />
             </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu Principal</p>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-light text-primary font-semibold shadow-sm' 
                      : 'text-secondary hover:bg-gray-50 hover:text-main'}
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Snippet in Sidebar */}
          <div className="p-4 border-t border-gray-50 mb-safe">
             <div className="flex items-center gap-3 px-2 py-2 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-secondary border border-gray-200 overflow-hidden">
                  {user && user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <User size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-main truncate">{user?.name || 'Minha Conta'}</p>
                  <p className="text-xs text-secondary truncate">Nível {user?.level || 1}</p>
                </div>
                <LogOut size={16} className="text-gray-400 hover:text-red-500" />
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F7F9FB]">
        
        {/* Topbar */}
        <header className="h-16 lg:h-20 bg-surface/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-10 flex-shrink-0 relative z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-main tracking-tight">
              {activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <button className="text-secondary hover:text-main transition-colors hidden sm:block">
              <Grid size={20} strokeWidth={1.5} />
            </button>
            
            <div className="relative">
              <button 
                className="text-secondary hover:text-main transition-colors p-2 rounded-full hover:bg-gray-50"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} strokeWidth={1.5} />
              </button>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
              )}

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute top-12 right-0 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 z-50 animate-fade-in max-w-[calc(100vw-32px)] overflow-hidden">
                  <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Notificações</h4>
                    <span className="text-[10px] text-primary cursor-pointer hover:underline font-bold">Limpar</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                        <Bell size={24} className="opacity-20" />
                        Nenhuma notificação nova
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                           <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.type === 'achievement' ? 'bg-yellow-400' : 'bg-primary'}`}></div>
                           <div>
                             <p className="text-xs font-medium text-gray-800 leading-snug">{n.message}</p>
                             <span className="text-[10px] text-gray-400 mt-1 block">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
            <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
               {user && user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : 'M'}
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scroll-smooth custom-scrollbar pb-32 lg:pb-10 relative z-0">
          <div className="max-w-6xl mx-auto animate-fade-in">
             {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 lg:hidden z-50 flex items-center justify-around px-2 safe-pb h-[calc(60px+env(safe-area-inset-bottom))] shadow-[0_-4px_30px_rgba(0,0,0,0.04)]">
         {bottomNavItems.map((item) => {
           const isActive = activeTab === item.id;
           const isMenu = item.id === 'MENU';
           return (
             <button
               key={item.id}
               onClick={() => isMenu ? setIsSidebarOpen(true) : setActiveTab(item.id as Tab)}
               className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform pt-2 pb-1"
             >
               <div className={`
                 p-1 rounded-full transition-all duration-300
                 ${isActive && !isMenu ? 'text-primary transform -translate-y-1' : 'text-gray-400'}
                 ${isMenu ? 'text-gray-600' : ''}
               `}>
                 <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive && !isMenu ? "currentColor" : "none"} className={isActive && !isMenu ? "drop-shadow-sm" : ""} />
               </div>
               <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${isActive && !isMenu ? 'text-primary' : 'text-gray-400'}`}>
                 {item.label}
               </span>
             </button>
           );
         })}
      </div>
    </div>
  );
};

export default Layout;