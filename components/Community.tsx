
import React, { useState } from 'react';
import { AppState, Post, Comment, User, Notification } from '../types';
import { Heart, MessageCircle, Share2, Award, Image as ImageIcon, Video, Send, MoreHorizontal, Bookmark, Flag, UserPlus, UserCheck, X, Compass, Bell, Shield, Layers, Grid, Check, Filter, Hash } from 'lucide-react';

interface CommunityProps {
  state: AppState;
  toggleLike: (postId: string) => void;
  createPost: (content: string, media?: { type: 'image' | 'video', data: string }, category?: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleSave: (postId: string) => void;
  reportPost: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  user?: User; // Pass current user for profile view
  notifications?: Notification[]; // Pass notifications for notification view
}

type View = 'feed' | 'profile' | 'saved' | 'notifications' | 'guidelines';
type Category = 'all' | 'general' | 'motivation' | 'recipes' | 'tips';

const Community: React.FC<CommunityProps> = ({ 
  state, 
  toggleLike, 
  createPost, 
  addComment, 
  toggleSave, 
  reportPost, 
  toggleFollow,
  user,
  notifications = []
}) => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<string>('general');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [mediaPreview, setMediaPreview] = useState<{ type: 'image' | 'video', data: string } | null>(null);
  
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const [viewingProfile, setViewingProfile] = useState<{name: string, avatar: string, id: string, bio: string} | null>(null);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'general', label: 'Geral' },
    { id: 'motivation', label: 'Motivação' },
    { id: 'recipes', label: 'Receitas' },
    { id: 'tips', label: 'Dicas' },
  ];

  const menuItems = [
    { id: 'feed', icon: Layers, label: 'Feed Principal' },
    { id: 'saved', icon: Bookmark, label: 'Salvos' },
    { id: 'notifications', icon: Bell, label: 'Notificações', badge: notifications.filter(n => !n.read).length },
    { id: 'profile', icon: Grid, label: 'Meu Perfil' },
    { id: 'guidelines', icon: Shield, label: 'Diretrizes' },
  ];

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ type, data: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = () => {
    if (!newPostText.trim() && !mediaPreview) return;
    createPost(newPostText, mediaPreview || undefined, newPostCategory);
    setNewPostText('');
    setMediaPreview(null);
    setNewPostCategory('general');
  };

  const handleCommentSubmit = (postId: string) => {
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
  };

  const openProfile = (post: Post) => {
    setViewingProfile({
      name: post.author,
      avatar: post.avatar,
      id: post.authorId || 'u0',
      bio: 'Apaixonada por vida saudável, treinos funcionais e receitas fit. Em busca da minha melhor versão! ✨'
    });
  };

  const isFollowing = (userId: string) => state.user.following.includes(userId);

  // Filter Posts Logic
  const getPosts = () => {
    let posts = state.communityPosts;

    if (currentView === 'profile') {
      posts = posts.filter(p => p.authorId === 'me');
    } else if (currentView === 'saved') {
      posts = posts.filter(p => p.isSaved);
    }

    if (selectedCategory !== 'all') {
      posts = posts.filter(p => p.category === selectedCategory);
    }

    return posts;
  };

  const displayedPosts = getPosts();

  const getCategoryLabel = (cat?: string) => {
     const found = categories.find(c => c.id === cat);
     return found ? found.label : 'Geral';
  };

  const renderPost = (post: Post) => (
    <div key={post.id} className="card-saas p-0 overflow-hidden mb-6 animate-slide-up">
      {/* Post Header */}
      <div className="p-5 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => openProfile(post)}
            className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-xl cursor-pointer border border-pink-100 overflow-hidden"
          >
            {post.avatar.includes('data:image') ? <img src={post.avatar} className="w-full h-full object-cover" /> : post.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h4 onClick={() => openProfile(post)} className="font-bold text-gray-800 text-sm cursor-pointer hover:underline">{post.author}</h4>
               {post.category && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                    {getCategoryLabel(post.category)}
                  </span>
               )}
            </div>
            <span className="text-xs text-gray-400 block">{new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          {post.authorId !== 'me' && (
            <button 
              onClick={() => toggleFollow(post.authorId!)}
              className={`ml-2 text-xs font-bold px-3 py-1 rounded-full transition-colors ${isFollowing(post.authorId!) ? 'bg-gray-100 text-gray-500' : 'text-primary bg-primary-light'}`}
            >
              {isFollowing(post.authorId!) ? 'Seguindo' : 'Seguir'}
            </button>
          )}
        </div>
        <button className="text-gray-300 hover:text-gray-500">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
      </div>
      
      {post.image && (
        <div className="w-full bg-gray-50 max-h-[400px] flex items-center justify-center overflow-hidden">
          <img src={post.image} alt="Post" className="w-full object-cover" />
        </div>
      )}
      
      {post.video && (
        <div className="w-full bg-black">
          <video src={post.video} controls className="w-full max-h-[400px]" />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${post.isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
          >
              <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} /> {post.likes}
          </button>
          <button 
            onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
              <MessageCircle size={20} /> {post.commentsCount}
          </button>
        </div>
        <div className="flex gap-4">
          <button onClick={() => toggleSave(post.id)} className={`text-gray-400 hover:text-gray-700 ${post.isSaved ? 'text-yellow-500 fill-yellow-500' : ''}`}>
              <Bookmark size={20} />
          </button>
          <button onClick={() => reportPost(post.id)} className="text-gray-400 hover:text-red-500">
              <Flag size={20} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {activeCommentPost === post.id && (
        <div className="bg-gray-50/50 p-4 border-t border-gray-100 animate-fade-in">
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
            {post.comments.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Seja a primeira a comentar!</p>}
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                    {comment.avatar.includes('data:image') ? <img src={comment.avatar} className="w-full h-full object-cover" /> : comment.avatar}
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex-1">
                    <span className="text-xs font-bold text-gray-800 block mb-1">{comment.author}</span>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button 
              onClick={() => handleCommentSubmit(post.id)}
              disabled={!commentText.trim()}
              className="p-2 bg-primary text-white rounded-full shadow-md disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-24 animate-fade-in">
      
      {/* LEFT SIDEBAR (Desktop: Sticky / Mobile: Top Scroll) */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
        
        {/* User Stats Card (Desktop Only) */}
        {user && (
          <div className="hidden lg:block card-saas p-0 overflow-hidden relative">
             <div className="h-20 bg-gradient-to-r from-primary/80 to-emerald-600/80"></div>
             <div className="px-5 pb-5 text-center -mt-10">
                <div className="w-20 h-20 rounded-full bg-white p-1 mx-auto shadow-sm">
                   <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                     {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : '👩'}
                   </div>
                </div>
                <h3 className="font-bold text-gray-800 mt-2">{user.name}</h3>
                <p className="text-xs text-gray-500 mb-4">Membro Nível {user.level}</p>
                <div className="flex justify-center gap-4 text-xs font-bold border-t border-gray-50 pt-3">
                   <div className="text-center">
                     <span className="block text-gray-800 text-sm">{user.points}</span>
                     <span className="text-gray-400 font-normal uppercase text-[10px]">Pontos</span>
                   </div>
                   <div className="w-px bg-gray-100"></div>
                   <div className="text-center">
                     <span className="block text-gray-800 text-sm">{user.following.length}</span>
                     <span className="text-gray-400 font-normal uppercase text-[10px]">Seguindo</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="bg-white lg:rounded-2xl lg:shadow-sm lg:border border-gray-100 lg:p-2 sticky top-4 z-30">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 p-1 lg:p-0">
            {menuItems.map((item) => (
               <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap relative
                    ${currentView === item.id 
                      ? 'bg-primary-light text-primary font-bold shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
                  `}
               >
                  <item.icon size={18} strokeWidth={currentView === item.id ? 2.5 : 2} />
                  <span>{item.label}</span>
                  
                  {/* Active Indicator (Desktop) */}
                  {currentView === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full hidden lg:block"></div>
                  )}

                  {/* Badge */}
                  {item.badge ? (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  ) : null}
               </button>
            ))}
          </div>
        </div>

        {/* Trending Topics (Desktop) */}
        <div className="hidden lg:block card-saas p-5 sticky top-64">
           <h4 className="font-bold text-gray-800 text-sm mb-4">Em Alta 🔥</h4>
           <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary">
                 <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-xs">#1</div>
                 <span>Desafio 30 Dias</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center font-bold text-xs">#2</div>
                 <span>Receitas Low Carb</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary">
                 <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center font-bold text-xs">#3</div>
                 <span>Jejum Intermitente</span>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0">
        
        {/* VIEW: FEED */}
        {currentView === 'feed' && (
          <div className="space-y-6">
            
            {/* Create Post */}
            <div className="card-saas p-6">
              <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                    {state.user.avatar ? <img src={state.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👩</div>}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPostText}
                      onChange={e => setNewPostText(e.target.value)}
                      placeholder="No que você está pensando hoje?"
                      className="w-full bg-transparent outline-none text-gray-700 resize-none h-20 placeholder-gray-400"
                    />
                    
                    {mediaPreview && (
                      <div className="relative mt-2 rounded-xl overflow-hidden bg-gray-100 max-h-60 w-fit">
                          <button 
                            onClick={() => setMediaPreview(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                          >
                            <X size={14} />
                          </button>
                          {mediaPreview.type === 'image' ? (
                            <img src={mediaPreview.data} className="max-h-60 object-contain" />
                          ) : (
                            <video src={mediaPreview.data} controls className="max-h-60" />
                          )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50 flex-wrap gap-2">
                        <div className="flex gap-3">
                          <label className="cursor-pointer text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg hover:bg-gray-50">
                              <ImageIcon size={18} /> Foto
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleMediaUpload(e, 'image')} />
                          </label>
                          <label className="cursor-pointer text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg hover:bg-gray-50">
                              <Video size={18} /> Vídeo
                              <input type="file" accept="video/*" className="hidden" onChange={e => handleMediaUpload(e, 'video')} />
                          </label>
                          <select 
                            value={newPostCategory}
                            onChange={(e) => setNewPostCategory(e.target.value)}
                            className="bg-gray-50 border-none text-xs font-bold text-gray-600 rounded-lg px-2 py-1 outline-none"
                          >
                            <option value="general">Geral</option>
                            <option value="motivation">Motivação</option>
                            <option value="recipes">Receitas</option>
                            <option value="tips">Dicas</option>
                          </select>
                        </div>
                        <button 
                          onClick={handlePostSubmit}
                          disabled={!newPostText.trim() && !mediaPreview}
                          className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md shadow-green-100 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                          Publicar
                        </button>
                    </div>
                  </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
               {categories.map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id as Category)}
                   className={`
                     px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                     ${selectedCategory === cat.id 
                        ? 'bg-gray-800 text-white border-gray-800' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}
                   `}
                 >
                   {cat.label}
                 </button>
               ))}
            </div>

            <h3 className="font-bold text-gray-800 text-lg px-2">Feed Recente</h3>
            {displayedPosts.length === 0 && <p className="text-gray-400 text-center py-10">Nenhum post encontrado nesta categoria.</p>}
            {displayedPosts.map(renderPost)}
          </div>
        )}

        {/* VIEW: PROFILE */}
        {currentView === 'profile' && user && (
          <div className="space-y-6">
             <div className="card-saas p-0 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary to-emerald-600"></div>
                <div className="px-6 pb-6 relative">
                   <div className="flex justify-between items-end -mt-10 mb-4">
                     <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-3xl overflow-hidden">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : '👩'}
                        </div>
                     </div>
                     <div className="flex gap-3 mb-1">
                        <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200">Editar Perfil</button>
                     </div>
                   </div>
                   
                   <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                   <p className="text-gray-500 mb-4">Membro desde {new Date(user.lastLogin).getFullYear()}</p>
                   
                   <div className="flex gap-6 border-t border-gray-50 pt-4">
                      <div>
                         <span className="block font-bold text-xl text-gray-800">{displayedPosts.length}</span>
                         <span className="text-xs text-gray-400 uppercase">Posts</span>
                      </div>
                      <div>
                         <span className="block font-bold text-xl text-gray-800">12</span>
                         <span className="text-xs text-gray-400 uppercase">Seguidores</span>
                      </div>
                      <div>
                         <span className="block font-bold text-xl text-gray-800">{user.following.length}</span>
                         <span className="text-xs text-gray-400 uppercase">Seguindo</span>
                      </div>
                   </div>
                </div>
             </div>
             
             <h3 className="font-bold text-gray-800 text-lg px-2">Meus Posts</h3>
             {displayedPosts.length === 0 ? (
               <div className="card-saas p-10 text-center">
                  <p className="text-gray-400">Você ainda não publicou nada.</p>
                  <button onClick={() => setCurrentView('feed')} className="text-primary font-bold text-sm mt-2">Criar primeiro post</button>
               </div>
             ) : (
               displayedPosts.map(renderPost)
             )}
          </div>
        )}

        {/* VIEW: SAVED */}
        {currentView === 'saved' && (
           <div className="space-y-6">
             <h3 className="font-bold text-gray-800 text-lg px-2">Posts Salvos</h3>
             {displayedPosts.length === 0 ? (
                <div className="card-saas p-10 text-center flex flex-col items-center">
                   <Bookmark className="text-gray-300 mb-2" size={48} />
                   <p className="text-gray-400">Nenhum post salvo ainda.</p>
                </div>
             ) : (
               displayedPosts.map(renderPost)
             )}
           </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
        {currentView === 'notifications' && (
           <div className="card-saas p-0">
              <div className="p-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-800">Suas Notificações</h3>
              </div>
              <div className="divide-y divide-gray-50">
                 {notifications.length === 0 && <p className="text-gray-400 p-6 text-center">Tudo tranquilo por aqui.</p>}
                 {notifications.map(n => (
                   <div key={n.id} className={`p-4 flex gap-4 ${!n.read ? 'bg-green-50/30' : ''} hover:bg-gray-50 transition-colors`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        n.type === 'like' ? 'bg-pink-100 text-pink-500' :
                        n.type === 'comment' ? 'bg-blue-100 text-blue-500' :
                        n.type === 'follow' ? 'bg-green-100 text-green-500' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                         {n.type === 'like' ? <Heart size={18} /> : 
                          n.type === 'comment' ? <MessageCircle size={18} /> :
                          n.type === 'follow' ? <UserPlus size={18} /> :
                          <Bell size={18} />}
                      </div>
                      <div>
                         <p className="text-sm text-gray-800">{n.message}</p>
                         <span className="text-xs text-gray-400">{new Date(n.timestamp).toLocaleDateString()} às {new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* VIEW: GUIDELINES */}
        {currentView === 'guidelines' && (
           <div className="card-saas p-8">
              <div className="flex items-center gap-3 mb-6">
                 <Shield className="text-primary" size={32} />
                 <h2 className="text-2xl font-bold text-gray-900">Diretrizes da Comunidade</h2>
              </div>
              
              <div className="space-y-6 text-gray-700">
                 <p>Bem-vinda à comunidade Calorix! Este é um espaço seguro e de apoio. Para manter essa energia, pedimos que siga estas regras:</p>
                 
                 <ul className="space-y-4">
                    <li className="flex gap-3">
                       <Check size={20} className="text-green-500 flex-shrink-0 mt-1" />
                       <div>
                          <strong className="block text-gray-900">Respeito e Empatia</strong>
                          Seja gentil. Não toleramos bullying, discursos de ódio ou julgamentos. Estamos aqui para nos ajudar.
                       </div>
                    </li>
                    <li className="flex gap-3">
                       <Check size={20} className="text-green-500 flex-shrink-0 mt-1" />
                       <div>
                          <strong className="block text-gray-900">Conteúdo Saudável</strong>
                          Evite compartilhar dietas extremas ou conselhos médicos não verificados.
                       </div>
                    </li>
                    <li className="flex gap-3">
                       <Check size={20} className="text-green-500 flex-shrink-0 mt-1" />
                       <div>
                          <strong className="block text-gray-900">Privacidade</strong>
                          Não compartilhe informações pessoais sensíveis suas ou de outras pessoas.
                       </div>
                    </li>
                    <li className="flex gap-3">
                       <Check size={20} className="text-green-500 flex-shrink-0 mt-1" />
                       <div>
                          <strong className="block text-gray-900">Sem Spam</strong>
                          Não utilize este espaço para vender produtos ou serviços não autorizados.
                       </div>
                    </li>
                 </ul>

                 <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-500 mt-6">
                    Se você ver algo que viola estas regras, por favor use o botão de <strong>Denunciar</strong> no post.
                 </div>
              </div>
           </div>
        )}

      </div>

      {/* Profile Modal (View Other User) */}
      {viewingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingProfile(null)}></div>
          <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden relative z-10 animate-slide-up shadow-2xl">
             <div className="h-24 bg-gradient-to-r from-primary to-emerald-600"></div>
             <div className="px-6 pb-6 relative">
                <button onClick={() => setViewingProfile(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
                <div className="w-20 h-20 rounded-full bg-white p-1 -mt-10 mb-3 shadow-lg">
                   <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-3xl overflow-hidden">
                     {viewingProfile.avatar.includes('data:image') ? <img src={viewingProfile.avatar} className="w-full h-full object-cover" /> : viewingProfile.avatar}
                   </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{viewingProfile.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{viewingProfile.bio}</p>
                
                <div className="flex gap-4 mb-6 border-y border-gray-50 py-4">
                  <div className="text-center flex-1">
                     <span className="block font-bold text-lg text-gray-800">128</span>
                     <span className="text-xs text-gray-400 uppercase">Seguidores</span>
                  </div>
                  <div className="text-center flex-1 border-l border-gray-50">
                     <span className="block font-bold text-lg text-gray-800">45</span>
                     <span className="text-xs text-gray-400 uppercase">Seguindo</span>
                  </div>
                </div>

                {viewingProfile.id !== 'me' && (
                  <button 
                    onClick={() => toggleFollow(viewingProfile.id)}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isFollowing(viewingProfile.id) 
                        ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500' 
                        : 'bg-primary text-white shadow-lg shadow-green-200'
                    }`}
                  >
                    {isFollowing(viewingProfile.id) ? (
                      <><UserCheck size={18} /> Seguindo</>
                    ) : (
                      <><UserPlus size={18} /> Seguir</>
                    )}
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
