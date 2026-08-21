import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { View } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { translations } from '../utils/translations';
import {
  MessageSquare, Calculator, Mic, FileText,
  TrendingUp, AlertTriangle, Lightbulb,
  CreditCard, LayoutDashboard, NotebookPen,
  BarChart3, Users, X, Home, Circle, Calendar as CalendarIcon,
  ArrowLeft, ShoppingBag, PieChart, Lock, Shield, Camera
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, language } = useTheme();
  const { userProfile } = useData();
  const t = translations[language];

  const { transactions } = useData();
  const isPro = userProfile?.plan === 'pro' || userProfile?.role === 'admin';
  const [todayTarget, setTodayTarget] = useState(0);
  const [todaySales, setTodaySales] = useState(0);

  useEffect(() => {
    const refreshTarget = () => {
      const item = window.localStorage.getItem('dailyTargetData');
      const data = item ? JSON.parse(item) : null;
      setTodayTarget(data?.dailyTarget || 0);
      const today = new Date().toISOString().split('T')[0];
      const total = (transactions || []).filter((t: any) => t.type === 'Income' && t.date?.startsWith(today)).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      setTodaySales(total);
    };

    window.addEventListener('targetUpdated', refreshTarget);
    window.addEventListener('transactionUpdated', refreshTarget);
    refreshTarget();
    return () => {
      window.removeEventListener('targetUpdated', refreshTarget);
      window.removeEventListener('transactionUpdated', refreshTarget);
    };
  }, [transactions]);

  const targetPercent = todayTarget ? Math.min(100, Math.round((todaySales / todayTarget) * 100)) : 0;
  const progressLabel = targetPercent >= 100 ? 'সফল' : targetPercent >= 71 ? 'ভালো' : targetPercent >= 41 ? 'সতর্ক' : 'বিপদ';
  const progressColor = targetPercent >= 100 ? 'bg-emerald-500' : targetPercent >= 71 ? 'bg-blue-500' : targetPercent >= 41 ? 'bg-amber-400' : 'bg-red-500';

  const menuItems = [
    { view: View.HOME, label: t.home, icon: Home, locked: false },
    { view: View.SALES_LIST, label: t.salesList, icon: ShoppingBag, locked: false },
    { view: View.QR_SCANNER, label: t.qrScanner, icon: Camera, locked: false },
    { view: View.TARGET_HISTORY, label: t.targetHistory, icon: BarChart3, locked: false },
    { view: View.PRINTER_SETTINGS, label: t.printerSettings, icon: FileText, locked: false },
    { view: View.CHAT, label: t.smartTradeAiChat, icon: MessageSquare, locked: false },
    { view: View.CALENDAR, label: t.calendar, icon: CalendarIcon, locked: false },
    { view: View.CALCULATOR, label: t.calculator, icon: Calculator, locked: false },
    { view: View.DUE_LIST, label: t.dueList, icon: Users, locked: false },
    { view: View.DUE_ANALYSIS, label: t.dueAnalysis, icon: BarChart3, locked: false },
    { view: View.NOTEPAD, label: t.notepad, icon: NotebookPen, locked: false },
    { view: View.INVOICE, label: t.digitalInvoice, icon: FileText, locked: false },
    { view: View.REPORTS, label: t.reportsDailyWeekly, icon: LayoutDashboard, locked: !isPro },
    { view: View.DAILY_PROFIT, label: t.dailyProfit, icon: BarChart3, locked: !isPro },
    { view: View.PRICING_TOOL, label: t.pricingTool, icon: CreditCard, locked: !isPro },
    { view: View.GUIDELINES, label: t.guidelines, icon: Lightbulb, locked: !isPro },
    { view: View.SALES_TIPS, label: t.salesTips, icon: TrendingUp, locked: !isPro },
    { view: View.LOSS_PREVENTION, label: (t as any).lossPrevention || 'ক্ষতি প্রতিরোধ', icon: AlertTriangle, locked: !isPro },
    { view: View.PLANS, label: t.plans, icon: CreditCard, locked: false }, // Reusing icon
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-72 
        ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} 
        border-r 
        transform transition-transform duration-300 z-50 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
        glass
      `}>
        <div className={`p-6 flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} shrink-0`}>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className={`lg:hidden ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              BIZNURO AI
            </h1>
          </div>
          <button onClick={onClose} className={`lg:hidden ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                if (item.locked) {
                  setView(View.PLANS);
                } else {
                  setView(item.view);
                }
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${currentView === item.view
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : `${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`
                } ${item.locked ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.locked && <Lock size={16} className="text-slate-500" />}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} shrink-0`}>
          <div className="mb-3 text-slate-400 text-sm">আজকের লক্ষ্য পূরণ</div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
            <div className={`${progressColor} h-3 rounded-full transition-all duration-500`} style={{ width: `${targetPercent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{targetPercent}%</span>
            <span>{progressLabel}</span>
          </div>
          <div className="mt-3 text-slate-500 text-xs">{`৳${todaySales.toLocaleString()} / ৳${todayTarget.toLocaleString()}`}</div>
        </div>
        {(userProfile?.role === 'admin' || userProfile?.email === 'ashtosh.biswas.2026@gmail.com') && (
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} shrink-0`}>
            <button
              onClick={() => navigate('/admin-9XqA72-hidden')}
              className={`w-full flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400' : 'bg-slate-100 hover:bg-slate-200 text-cyan-600'} transition-colors p-3 rounded-xl font-bold`}
            >
              <Shield size={18} />
              <span>Admin Panel</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;