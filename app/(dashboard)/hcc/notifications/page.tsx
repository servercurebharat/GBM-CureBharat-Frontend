'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { notificationAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="bg-[#131241] rounded-[2rem] p-8 text-white shadow-xl border border-white/[0.03] max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Recent Alerts</h2>
          {notifications.length > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-white/40 font-black uppercase tracking-widest text-xs">
            No recent alerts
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-6 bg-white/5 rounded-2xl border transition-all cursor-pointer group ${
                  n.isRead ? 'border-white/5 opacity-60' : 'border-[#60A5FA]/30 bg-white/10'
                }`}
                onClick={async () => {
                  if (!n.isRead) {
                    await notificationAPI.markAsRead(n._id);
                    fetchNotifications();
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#60A5FA]"></div>}
                    <h3 className="font-bold group-hover:text-[#60A5FA] transition-colors">{n.title}</h3>
                  </div>
                  <span className="text-[10px] text-white/30 font-bold whitespace-nowrap ml-4">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed ml-5">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
