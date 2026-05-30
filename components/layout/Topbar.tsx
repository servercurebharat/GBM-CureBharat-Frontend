'use client';

import { useState, useEffect, useRef } from 'react';
import { IUser } from '@/types';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { usersAPI, notificationAPI } from '@/lib/api';
import Link from 'next/link';

interface TopbarProps {
  pageTitle: string;
  user: IUser;
  setSidebarOpen: (val: boolean) => void;
}

export default function Topbar({ pageTitle, user, setSidebarOpen }: TopbarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Autocomplete & Dropdown Refs
  const [suggestions, setSuggestions] = useState<IUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.data?.filter((n: any) => !n.isRead).length || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await notificationAPI.markAsRead(id);
      if (link) {
        router.push(link);
        setShowNotifications(false);
      }
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  // Handle Search Suggestion Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 2) {
        setIsSearching(true);
        try {
          const res = await usersAPI.getAll({ search, limit: 5 });
          if (res.data.success) {
            setSuggestions(res.data.data || []);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error('Search failed', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setShowSuggestions(false);
      if (notificationRef.current && !notificationRef.current.contains(target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const searchPath = user.role === 'admin' ? '/admin/members' : `/${user.role}/team`;
      router.push(`${searchPath}?search=${encodeURIComponent(search.trim())}`);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (member: IUser) => {
    const memberPath = user.role === 'admin' ? `/admin/members/${member._id}` : `/${user.role}/team?search=${member.memberId}`;
    router.push(memberPath);
    setSearch('');
    setShowSuggestions(false);
  };

  return (
    <header className="h-[90px] bg-[#131241] flex items-center px-4 md:px-10 gap-4 md:gap-10 flex-shrink-0 z-20 border-b border-white/5">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div className="hidden lg:flex flex-col justify-center min-w-[200px]">
         <p className="text-[9px] font-black text-[#10b981] uppercase tracking-[0.3em] mb-1">COMMAND CENTER</p>
         <div className="font-display text-xl font-black text-white tracking-tight leading-none uppercase truncate">
           {pageTitle}
         </div>
      </div>

      {/* Center: Search with Autocomplete */}
      <div className="flex-1 max-w-xl hidden md:block relative" ref={searchRef}>
        <form onSubmit={handleSearch} className="relative group">
          <svg className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-4 h-4 ${isSearching ? 'text-[#10b981] animate-pulse' : 'text-white/20 group-focus-within:text-[#10b981]'}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => search.length >= 2 && setShowSuggestions(true)}
            placeholder="Search Members, IDs, Ranks..." 
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:bg-white/[0.06] focus:border-[#10b981]/50 focus:outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
          />
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full mt-3 left-0 w-full bg-[#131241] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="p-2">
                <div className="px-6 py-3 border-b border-white/5">
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Quick Results</p>
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                   {suggestions.length === 0 ? (
                      <div className="px-6 py-10 text-center">
                         <p className="text-xs font-bold text-white/20 italic">No members found matching "{search}"</p>
                      </div>
                   ) : (
                      suggestions.map((m) => (
                        <div 
                          key={m._id}
                          onClick={() => selectSuggestion(m)}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all cursor-pointer group"
                        >
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-[#10b981] group-hover:bg-[#10b981] group-hover:text-white transition-all">
                              {m.name.slice(0, 1)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-white truncate group-hover:text-[#10b981] transition-colors">{m.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{m.memberId}</span>
                                 <div className="w-1 h-1 rounded-full bg-white/10" />
                                 <span className="text-[9px] font-black text-[#10b981] uppercase tracking-widest">{m.role}</span>
                              </div>
                           </div>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                      ))
                   )}
                </div>
                <div 
                  onClick={handleSearch}
                  className="px-6 py-4 bg-white/[0.02] border-t border-white/5 text-center cursor-pointer hover:bg-white/5 transition-all"
                >
                   <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">View All Results for "{search}"</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Right: Icons & Profile */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative border ${showNotifications ? 'bg-[#10b981] text-white border-[#10b981] shadow-lg shadow-[#10b981]/20' : 'bg-white/5 text-white/40 border-white/5 hover:text-[#10b981] hover:bg-white/10'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {unreadCount > 0 && (
              <span className={`absolute top-3 right-3 w-2 h-2 rounded-full border-2 ${showNotifications ? 'bg-white border-[#10b981]' : 'bg-rose-500 border-[#131241]'}`} />
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute top-full mt-4 right-0 w-80 bg-[#131241] border border-white/10 rounded-[2rem] shadow-2xl z-50 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-6 px-2">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Alert System</h4>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllAsRead} className="text-[8px] font-black text-[#10b981] uppercase tracking-widest hover:text-white transition-colors">Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <>
                        {unreadCount > 0 && <span className="text-[8px] text-white/20">|</span>}
                        <button onClick={handleClearAll} className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:text-white transition-colors">Clear</button>
                      </>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-white/20 hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
               </div>
               
               <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10">
                       <p className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">No active alerts</p>
                    </div>
                  ) : notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => handleMarkAsRead(n._id, n.link)}
                      className={`p-4 rounded-2xl border flex gap-4 items-start transition-all cursor-pointer group relative ${n.isRead ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-white/[0.05] border-[#10b981]/20 shadow-lg shadow-[#10b981]/5'}`}
                    >
                       {!n.isRead && <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />}
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                         n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                         n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                         n.type === 'error' ? 'bg-rose-500/10 text-rose-500' :
                         'bg-blue-500/10 text-blue-500'
                       }`}>
                          {n.type === 'warning' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                          {n.type === 'success' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                          {n.type === 'info' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
                          {n.type === 'error' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-white tracking-tight uppercase group-hover:text-[#10b981] transition-colors truncate">{n.title}</p>
                          <p className="text-[9px] font-bold text-white/30 leading-relaxed mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-2">{formatTimeAgo(n.createdAt)}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
        
        {/* Profile with Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center gap-4 p-1.5 pr-4 rounded-2xl border transition-all cursor-pointer group ${showProfile ? 'bg-[#10b981] border-[#10b981] shadow-lg shadow-[#10b981]/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
          >
             <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all ${showProfile ? 'bg-white text-[#10b981]' : 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20'}`}>
                {user.name.slice(0, 1)}
             </div>
             <div className="hidden sm:block">
                <p className={`text-[10px] font-black tracking-tight uppercase transition-colors ${showProfile ? 'text-white' : 'text-white group-hover:text-[#10b981]'}`}>{user.name}</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 ${showProfile ? 'text-white/60' : 'text-white/20'}`}>{user.role}</p>
             </div>
          </div>

          {showProfile && (
            <div className="absolute top-full mt-4 right-0 w-64 bg-[#131241] border border-white/10 rounded-[2rem] shadow-2xl z-50 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[#10b981] to-[#059669] mx-auto flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-[#10b981]/20 mb-3">
                    {user.name.slice(0, 1)}
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{user.name}</h4>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{user.role} Session Active</p>
               </div>
               
               <div className="space-y-1">
                  <Link 
                    href={`/${user.role}/profile`} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-[#10b981] transition-all group"
                    onClick={() => setShowProfile(false)}
                  >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     <span className="text-[10px] font-black uppercase tracking-widest">My Profile</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin/audit-trail" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-[#10b981] transition-all group"
                      onClick={() => setShowProfile(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Security Logs</span>
                    </Link>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 text-rose-500/60 hover:text-rose-500 transition-all group"
                  >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                     <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                  </button>
               </div>
            </div>
          )}
        </div>
        
        {/* Static Logout - Small version for quick access */}
        <button 
          onClick={() => logout()}
          className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5 group hidden sm:flex"
          title="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </header>
  );
}
