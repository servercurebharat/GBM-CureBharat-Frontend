'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { exportToCSV, exportToPDF } from '@/lib/utils/export';

interface ExportDropdownProps {
  title: string;
  headers: string[];
  rows: any[][];
  fileName: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'outline-dark';
}

export default function ExportDropdown({ title, headers, rows, fileName, variant = 'primary' }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Reposition dropdown whenever it opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExportCSV = () => { exportToCSV(headers, rows, fileName); setIsOpen(false); };
  const handleExportPDF = () => { exportToPDF(title, headers, rows, fileName); setIsOpen(false); };

  const variants = {
    primary: 'bg-[#131241] text-white hover:brightness-110 shadow-lg shadow-[#131241]/20',
    outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
    'outline-dark': 'bg-transparent border border-white/20 text-white hover:bg-white/10',
    ghost:   'bg-white/5 text-white hover:bg-white/10'
  };

  const dropdown = isOpen && mounted ? createPortal(
    <div
      ref={dropdownRef}
      style={{ position: 'absolute', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
      className="w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="p-2 space-y-1">
        <button
          onClick={handleExportPDF}
          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          Download PDF
        </button>
        <button
          onClick={handleExportCSV}
          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h.01"/><path d="M8 17h.01"/><path d="M12 13h.01"/><path d="M12 17h.01"/><path d="M16 13h.01"/><path d="M16 17h.01"/></svg>
          </div>
          Download CSV
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className={`${variants[variant]} px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export Data
        <svg className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {dropdown}
    </>
  );
}
