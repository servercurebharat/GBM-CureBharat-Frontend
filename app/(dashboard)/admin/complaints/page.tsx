'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';

/* ─────────── Types ─────────── */
type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface Attachment { name: string; url: string; size: number; }
interface TimelineEntry { time: string; actor: string; note: string; type: 'status' | 'reply' | 'assign'; }
interface Complaint {
  id: string;
  ticketId: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: ComplaintStatus;
  submittedBy: string;
  memberId: string;
  createdAt: string;
  assignedTo?: string;
  description: string;
  replies: { author: string; initials: string; time: string; message: string; attachments?: Attachment[] }[];
  timeline: TimelineEntry[];
}

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: '1', ticketId: 'CB-9001',
    subject: 'Commission not credited for sale on 12 May',
    category: 'Finance / Commission',
    priority: 'HIGH', status: 'open',
    submittedBy: 'Rajesh Kumar', memberId: 'HCC-2041',
    createdAt: '2026-05-14T10:30:00Z',
    description: 'I closed a sale on May 12 for policy SP-400 but the ₹2,800 commission has not been credited to my wallet. Please check.',
    replies: [],
    timeline: [{ time: '2026-05-14 10:30', actor: 'Rajesh Kumar', note: 'Complaint submitted', type: 'status' }],
  },
  {
    id: '2', ticketId: 'CB-9002',
    subject: 'Referral link not working on mobile',
    category: 'Technical / App',
    priority: 'MEDIUM', status: 'in_progress',
    submittedBy: 'Priya Sharma', memberId: 'HCM-1820',
    createdAt: '2026-05-13T08:15:00Z',
    assignedTo: 'Support Team Alpha',
    description: 'When I share my referral link via WhatsApp the /buy page shows 404 on Android Chrome.',
    replies: [{ author: 'Admin', initials: 'AD', time: 'May 13, 09:20', message: 'We are investigating the 404 issue on Android. Will update shortly.', attachments: [] }],
    timeline: [
      { time: '2026-05-13 08:15', actor: 'Priya Sharma', note: 'Complaint submitted', type: 'status' },
      { time: '2026-05-13 09:20', actor: 'Admin', note: 'Assigned to Support Team Alpha', type: 'assign' },
    ],
  },
  {
    id: '3', ticketId: 'CB-9003',
    subject: 'KYC rejected but documents are correct',
    category: 'Members / KYC',
    priority: 'LOW', status: 'resolved',
    submittedBy: 'Amit Patel', memberId: 'HCC-3310',
    createdAt: '2026-05-11T14:00:00Z',
    description: 'My KYC was rejected twice but my Aadhaar and PAN are correctly uploaded.',
    replies: [],
    timeline: [
      { time: '2026-05-11 14:00', actor: 'Amit Patel', note: 'Complaint submitted', type: 'status' },
      { time: '2026-05-12 11:00', actor: 'Admin', note: 'KYC re-reviewed and approved', type: 'status' },
      { time: '2026-05-12 11:05', actor: 'Admin', note: 'Status changed to Resolved', type: 'status' },
    ],
  },
];

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  open: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  in_progress: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  closed: 'bg-white/5 text-slate-400 border-white/10',
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  MEDIUM: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  LOW: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [selected, setSelected] = useState<Complaint | null>(complaints[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  /* Derived: filtered list */
  const filtered = complaints.filter((c) => {
    const matchSearch = !search || c.subject.toLowerCase().includes(search.toLowerCase()) || c.ticketId.toLowerCase().includes(search.toLowerCase()) || c.memberId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status, timeline: [...c.timeline, { time: new Date().toLocaleString('en-IN'), actor: 'Admin', note: `Status changed to ${status.replace('_', ' ')}`, type: 'status' }] }
          : c
      )
    );
    setSelected((prev) => prev?.id === id ? { ...prev, status, timeline: [...(prev?.timeline || []), { time: new Date().toLocaleString('en-IN'), actor: 'Admin', note: `Status changed to ${status.replace('_', ' ')}`, type: 'status' }] } : prev);
    toast.success('Status updated');
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && pendingFiles.length === 0) { toast.error('Enter a message or attach a file'); return; }
    if (!selected) return;
    setSending(true);
    try {
      const attachments: Attachment[] = pendingFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f), size: f.size }));
      const newReply = { author: 'Admin', initials: 'AD', time: new Date().toLocaleString('en-IN'), message: replyText, attachments };
      const updatedTimeline: TimelineEntry[] = [...selected.timeline, { time: new Date().toLocaleString('en-IN'), actor: 'Admin', note: 'Replied to complaint', type: 'reply' as const }];
      const updatedComplaint = { ...selected, replies: [...selected.replies, newReply], timeline: updatedTimeline };
      setComplaints((prev) => prev.map((c) => c.id === selected.id ? updatedComplaint : c));
      setSelected(updatedComplaint);
      setReplyText('');
      setPendingFiles([]);
      toast.success('Reply sent');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5 MB`); return false; }
      return true;
    });
    setPendingFiles((prev) => [...prev, ...files].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'open').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <DashboardLayout pageTitle="Complaint Management">
      <div className="space-y-6 pb-20">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">ADMIN / COMPLAINT MANAGEMENT</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Customer Complaints</h1>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Open', value: stats.open, color: 'text-rose-400' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-amber-400' },
            { label: 'Resolved', value: stats.resolved, color: 'text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="bg-[#131241] rounded-2xl p-6 border border-white/5 shadow-xl">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search by subject, ticket ID, member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131241] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#131241] border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Complaints List */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.length === 0 && (
              <div className="bg-[#131241] rounded-2xl p-10 border border-white/5 text-center text-white/20 font-black text-xs uppercase tracking-widest">No complaints found</div>
            )}
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`bg-[#131241] rounded-2xl p-6 border cursor-pointer transition-all hover:-translate-y-0.5 ${selected?.id === c.id ? 'border-blue-500/40 shadow-lg shadow-blue-500/10' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{c.ticketId} • {c.memberId}</p>
                    <h4 className="text-sm font-black text-white leading-tight">{c.subject}</h4>
                  </div>
                  <span className={`shrink-0 text-[8px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${STATUS_COLORS[c.status]}`}>{c.status.replace('_', ' ')}</span>
                  <span className="text-[9px] font-bold text-white/20 uppercase">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected ? (
            <div className="lg:col-span-7 space-y-4">

              {/* Metadata */}
              <div className="bg-[#131241] rounded-2xl p-8 border border-white/5 shadow-xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{selected.ticketId} • {selected.submittedBy} ({selected.memberId})</p>
                    <h2 className="text-xl font-black text-white">{selected.subject}</h2>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">{selected.category} • Created {new Date(selected.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`shrink-0 text-[8px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority}</span>
                </div>
                <p className="text-xs text-white/50 font-medium leading-relaxed mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">{selected.description}</p>

                {/* Status controls */}
                <div className="flex flex-wrap gap-2">
                  {(['open', 'in_progress', 'resolved', 'closed'] as ComplaintStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selected.status === s ? STATUS_COLORS[s] + ' shadow-lg' : 'bg-white/5 border-white/10 text-white/30 hover:text-white hover:bg-white/10'}`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Thread */}
              <div className="bg-[#131241] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Activity Thread</h3>
                </div>
                <div className="p-6 space-y-5 max-h-[280px] overflow-y-auto">
                  {selected.replies.length === 0 && (
                    <p className="text-xs text-white/20 font-bold text-center py-4">No replies yet.</p>
                  )}
                  {selected.replies.map((r, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-[9px] font-black text-indigo-400 shrink-0">{r.initials}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[10px] font-black text-white">{r.author}</p>
                          <span className="text-[8px] text-white/20">{r.time}</span>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                          <p className="text-xs text-white/50 leading-relaxed">{r.message}</p>
                        </div>
                        {r.attachments && r.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {r.attachments.map((a, ai) => (
                              <a key={ai} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-slate-300 hover:text-blue-400 transition-all border border-white/5">
                                📎 {a.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply box */}
                <div className="p-6 border-t border-white/5 bg-white/[0.02] space-y-3">
                  <div className="relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full bg-[#131241] border border-white/5 rounded-xl p-4 pb-12 text-xs text-white font-medium placeholder:text-white/20 outline-none focus:border-blue-500/30 transition-all resize-none h-24"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 left-3 text-white/20 hover:text-blue-400 transition-colors"
                      title="Attach file"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                    <button
                      onClick={handleSendReply}
                      disabled={sending}
                      className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                    >
                      {sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      {sending ? 'Sending…' : 'Send Reply'}
                    </button>
                  </div>
                  {pendingFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {pendingFiles.map((f, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-slate-300">
                          📎 {f.name}
                          <button onClick={() => setPendingFiles((p) => p.filter((_, j) => j !== i))} className="text-white/20 hover:text-rose-400 ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#131241] rounded-2xl p-6 border border-white/5 shadow-xl">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-5">Complaint Timeline</h3>
                <div className="space-y-4 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-4 relative before:absolute before:-left-4 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:bg-blue-500/40">
                      <div>
                        <p className="text-[10px] font-bold text-white">{t.note}</p>
                        <p className="text-[9px] font-bold text-white/20 mt-0.5">{t.actor} • {t.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-7 bg-[#131241] rounded-2xl border border-white/5 flex items-center justify-center min-h-[400px]">
              <p className="text-white/10 font-black text-xs uppercase tracking-widest">Select a complaint to view details</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
