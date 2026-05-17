'use client';

import { useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  totalMembersCount: number;
}

export default function AnnouncementModal({ isOpen, onClose, selectedUserIds, totalMembersCount }: AnnouncementModalProps) {
  const [loading, setLoading] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const res = await adminAPI.sendAnnouncement({
        ...formData,
        userIds: sendToAll ? [] : selectedUserIds,
        sendToAll
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Announcement broadcast successfully');
        onClose();
        setFormData({ title: '', message: '', type: 'info' });
        setSendToAll(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#060818]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#131241] rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-xl font-bold text-white tracking-tight">Broadcast Announcement</h3>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">
            {sendToAll ? `Target: All Active Members (${totalMembersCount})` : `Target: ${selectedUserIds.length} Selected Members`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {/* Send to All Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div>
               <p className="text-xs font-bold text-white">Broadcast to All</p>
               <p className="text-[10px] text-white/30 font-medium mt-0.5">Send to all active platform members</p>
            </div>
            <button 
              type="button"
              onClick={() => setSendToAll(!sendToAll)}
              className={`w-12 h-6 rounded-full transition-all relative ${sendToAll ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sendToAll ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Subject / Title</label>
              <input
                required
                type="text"
                placeholder="e.g. New Festive Offer!"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Message Content</label>
              <textarea
                required
                rows={4}
                placeholder="Type your announcement here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['info', 'success', 'warning'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    formData.type === t 
                      ? 'bg-white/10 border-white/20 text-white shadow-xl' 
                      : 'border-white/5 text-white/20 hover:border-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 py-4 px-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Transmit Broadcast'}
            </button>
          </div>
        </form>

        <div className="px-10 py-4 bg-white/[0.02] border-t border-white/5">
           <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center">
             This action will trigger system notifications and email updates for selected users.
           </p>
        </div>
      </div>
    </div>
  );
}
