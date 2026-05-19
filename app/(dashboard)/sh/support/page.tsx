'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { complaintsAPI } from '@/lib/api';

interface Attachment {
  name: string;
  size: number;
  url: string;
  type: string;
}

interface ActivityEntry {
  id: string;
  author: string;
  initials: string;
  time: string;
  message: string;
  attachments?: Attachment[];
}

interface Complaint {
  id: string;
  ticketId: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN PROGRESS' | 'RESOLVED' | 'CLOSED';
  time: string;
  description: string;
  replies: any[];
}

export default function SupportPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raise Ticket Modal State
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Finance / Payouts',
    priority: 'MEDIUM',
    description: ''
  });
  const [raising, setRaising] = useState(false);

  const fetchMyTickets = async () => {
    try {
      const res = await complaintsAPI.getMy();
      if (res.data.success && res.data.data) {
        const fetched = res.data.data.map((c: any) => ({
          id: c.ticketId,
          ticketId: c.ticketId,
          dbId: c._id,
          subject: c.subject,
          category: c.category,
          priority: c.priority,
          status: c.status.toUpperCase().replace('_', ' '),
          time: new Date(c.createdAt).toLocaleDateString('en-IN'),
          description: c.description,
          replies: c.replies || [],
        }));
        setComplaints(fetched);
        if (fetched.length > 0 && !selectedTicket) {
          setSelectedTicket(fetched[0].ticketId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const currentComplaint = complaints.find(c => c.ticketId === selectedTicket);

  // Format activity thread combining description + replies
  const activityThread: ActivityEntry[] = currentComplaint ? [
    {
      id: 'desc',
      author: currentComplaint.replies[0]?.author || 'You',
      initials: currentComplaint.replies[0]?.initials || 'ME',
      time: currentComplaint.time,
      message: currentComplaint.description
    },
    ...(currentComplaint.replies || []).map((r: any, idx: number) => ({
      id: String(idx),
      author: r.author,
      initials: r.initials || 'SP',
      time: r.time,
      message: r.message
    }))
  ] : [];

  /** Handle file selection for attachment */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 5 * 1024 * 1024;
    const validFiles = files.filter((f) => {
      if (f.size > maxSize) {
        toast.error(`${f.name} is too large (max 5 MB)`);
        return false;
      }
      return true;
    });

    setPendingFiles((prev) => [...prev, ...validFiles].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  /** Save reply + attachments to activity thread */
  const handleSaveAndSend = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    if (!currentComplaint) return;

    setSending(true);
    try {
      const res = await complaintsAPI.reply((currentComplaint as any).dbId, replyText);
      if (res.data.success) {
        toast.success('Reply saved and sent.');
        setReplyText('');
        await fetchMyTickets();
      }
    } catch {
      toast.error('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /** Handle Raising a New Ticket */
  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setRaising(true);
    try {
      const res = await complaintsAPI.create(newTicket);
      if (res.data.success) {
        toast.success('Support ticket raised successfully!');
        setNewTicket({
          subject: '',
          category: 'Finance / Payouts',
          priority: 'MEDIUM',
          description: ''
        });
        setShowRaiseModal(false);
        await fetchMyTickets();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to raise ticket.');
    } finally {
      setRaising(false);
    }
  };

  const categories = ['Finance / Payouts', 'Finance / Commission', 'Members / KYC', 'Technical / App', 'Other'];

  return (
    <DashboardLayout pageTitle="Support">
      <div className="space-y-6 pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">MEMBER SUPPORT PORTAL</p>
            <h2 className="text-3xl font-black text-white tracking-tight">Support Tickets</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowRaiseModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              Raise New Ticket
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'My Total Tickets', value: String(complaints.length), change: 'Sync\'d live' },
            { label: 'Open Status', value: String(complaints.filter(c => c.status === 'OPEN').length), change: 'Pending admin' },
            { label: 'In Progress', value: String(complaints.filter(c => c.status === 'IN PROGRESS').length), change: 'Being reviewed' },
            { label: 'Resolved', value: String(complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length), change: 'Completed' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
              <p className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest mb-10">{stat.label}</p>
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h4>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Tickets Table Area */}
          <div className="lg:col-span-8 bg-[#131241] rounded-[20px] shadow-2xl border border-white/5 flex flex-col overflow-hidden min-h-[600px]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">My Support Cases</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">showing {complaints.length} tickets</p>
            </div>

            <div className="flex-1 overflow-x-auto">
              {complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 space-y-4">
                  <p className="text-white/20 font-black text-sm uppercase tracking-widest">No support tickets found</p>
                  <button 
                    onClick={() => setShowRaiseModal(true)}
                    className="bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-xl px-5 py-2.5 text-xs font-bold transition-all"
                  >
                    Raise your first ticket now
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-[#B5B8BD] uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Ticket ID</th>
                      <th className="px-8 py-5">Subject &amp; Category</th>
                      <th className="px-8 py-5 text-center">Priority</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {complaints.map((ticket, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-white/[0.02] transition-all cursor-pointer group ${selectedTicket === ticket.ticketId ? 'bg-indigo-600/10 border-l-2 border-indigo-600' : ''}`}
                        onClick={() => setSelectedTicket(ticket.ticketId)}
                      >
                        <td className="px-8 py-6 text-xs font-bold text-white opacity-80">{ticket.ticketId}</td>
                        <td className="px-8 py-6">
                          <p className={`text-sm font-bold ${selectedTicket === ticket.ticketId ? 'text-[#60A5FA]' : 'text-white'} transition-colors`}>{ticket.subject}</p>
                          <p className="text-[10px] text-[#64748B] font-bold mt-1 uppercase tracking-tighter">{ticket.category}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-widest border ${
                            ticket.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-widest border ${
                            ticket.status === 'OPEN' ? 'bg-indigo-600/20 text-[#60A5FA] border-indigo-600/20' : 'bg-amber-400/20 text-amber-400 border-amber-400/20'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-500 uppercase">{ticket.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">

            {currentComplaint ? (
              <>
                {/* Ticket Details Inspector */}
                <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-base font-bold text-white tracking-tight">{currentComplaint.ticketId}: Details</h3>
                    <div className="flex gap-4 text-slate-500">
                      <button className="hover:text-white" onClick={() => setSelectedTicket('')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#B5B8BD] font-bold uppercase tracking-widest">Subject:</p>
                      <p className="text-sm font-bold text-white">{currentComplaint.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-white/5 text-[9px] font-black text-slate-400 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">{currentComplaint.category}</span>
                      <span className="bg-white/5 text-[9px] font-black text-slate-400 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest">{currentComplaint.priority}</span>
                    </div>
                  </div>
                </div>

                {/* Activity Thread */}
                <div className="bg-[#131241] rounded-[20px] shadow-2xl border border-white/5 overflow-hidden flex flex-col min-h-[400px]">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Activity Thread</h3>
                  </div>

                  {/* Thread messages */}
                  <div className="p-6 flex-1 space-y-6 max-h-[320px] overflow-y-auto">
                    {activityThread.map((entry) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-xs font-black text-indigo-400 shrink-0">{entry.initials}</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-[11px] font-bold text-white">{entry.author}</p>
                            <span className="text-[9px] font-bold text-slate-600 uppercase">{entry.time}</span>
                          </div>
                          {entry.message && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                              <p className="text-xs text-[#B5B8BD] font-medium leading-relaxed">{entry.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Editor */}
                  <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
                    <div className="relative">
                      <textarea
                        placeholder="Type your response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full bg-[#131241] border border-white/5 rounded-2xl p-5 pb-14 text-xs font-medium text-white placeholder:text-slate-700 outline-none h-28 resize-none focus:border-[#60A5FA]/30 transition-all"
                      />

                      {/* Attachment trigger */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-4 left-4 hover:text-[#60A5FA] text-slate-600 transition-colors"
                        title="Attach file"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                      </button>
                      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />

                      {/* Send button */}
                      <button
                        onClick={handleSaveAndSend}
                        disabled={sending}
                        className="absolute bottom-4 right-4 bg-[#60A5FA] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-2"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        )}
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </div>

                    {/* Pending attachments preview */}
                    {pendingFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pendingFiles.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                            <span className="max-w-[120px] truncate">{f.name}</span>
                            <button onClick={() => removePendingFile(idx)} className="text-slate-600 hover:text-rose-400 transition-colors ml-1">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#131241] rounded-[20px] p-8 shadow-2xl border border-white/5 flex items-center justify-center min-h-[300px]">
                <p className="text-white/20 font-black text-xs uppercase tracking-widest text-center">Select a ticket to inspect details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {showRaiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#131241] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-8 relative shadow-2xl">
            <button 
              onClick={() => setShowRaiseModal(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-2xl font-black text-white mb-2">Raise Support Ticket</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-6">Describe your issue and we'll resolve it as soon as possible</p>

            <form onSubmit={handleRaiseTicket} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Category</label>
                  <select 
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#60A5FA]"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-[#131241]">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Priority</label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#60A5FA]"
                  >
                    <option value="LOW" className="bg-[#131241]">LOW</option>
                    <option value="MEDIUM" className="bg-[#131241]">MEDIUM</option>
                    <option value="HIGH" className="bg-[#131241]">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Failed payout request"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#60A5FA]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#B5B8BD] uppercase tracking-widest">Detailed Description</label>
                <textarea 
                  required
                  placeholder="Please describe your issue in detail so our support staff can audit it correctly..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-[#60A5FA] h-32 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={raising}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {raising ? 'Raising Ticket...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
