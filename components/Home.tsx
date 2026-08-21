import React, { useState, useEffect } from 'react';
import { View } from '../types';
import {
  TrendingUp, Users, FileText, Mic,
  ArrowRight, DollarSign, MessageSquare,
  ShoppingBag, Activity, Search, Newspaper,
  Edit2, X, Lock
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { isSameDay, parseISO, format, getDay } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import SmartAd from './SmartAd';

interface HomeProps {
  setView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  const { dues, transactions, userProfile } = useData();
  const { theme } = useTheme();
  const [showAd, setShowAd] = useState(true);

  const isPro = userProfile?.plan === 'pro' || userProfile?.role === 'admin';

  // Manual Profit State
  const [manualProfit, setManualProfit] = useState<number | null>(() => {
    const saved = localStorage.getItem('manualProfitData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.date === todayStr) {
          return data.amount;
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
    // Fallback for old manualProfit format
    const oldSaved = localStorage.getItem('manualProfit');
    if (oldSaved) {
      localStorage.removeItem('manualProfit'); // Clear old format
    }
    return null;
  });

  // Listen for profit updates from other components
  useEffect(() => {
    const handleProfitUpdate = () => {
      const saved = localStorage.getItem('manualProfitData');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const todayStr = new Date().toISOString().split('T')[0];
          if (data.date === todayStr) {
            setManualProfit(data.amount);
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    };

    window.addEventListener('profitUpdated', handleProfitUpdate);
    return () => window.removeEventListener('profitUpdated', handleProfitUpdate);
  }, []);

  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [tempProfit, setTempProfit] = useState('');
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targets, setTargets] = useState({ dailyTarget: 10000, weeklyTarget: 70000, monthlyTarget: 300000 });
  const [targetForm, setTargetForm] = useState({ dailyTarget: '10000', weeklyTarget: '70000', monthlyTarget: '300000' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasSeenSuccess, setHasSeenSuccess] = useState(false);
  const [confettiKeys, setConfettiKeys] = useState<number[]>([]);

  const totalDue = dues.reduce((acc, curr) => acc + curr.amount, 0);

  const todayTransactions = transactions.filter(t => isSameDay(parseISO(t.date), new Date()));

  const todaySales = todayTransactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpense = todayTransactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const targetPercent = targets.dailyTarget ? Math.min(100, Math.round((todaySales / targets.dailyTarget) * 100)) : 0;
  const targetStatus = targetPercent >= 100 ? 'সফল' : targetPercent >= 71 ? 'ভালো' : targetPercent >= 41 ? 'সতর্ক' : 'বিপদ';
  const targetStatusColor = targetPercent >= 100 ? 'text-emerald-400' : targetPercent >= 71 ? 'text-blue-400' : targetPercent >= 41 ? 'text-amber-300' : 'text-red-400';
  const targetRingColor = targetPercent >= 100 ? '#22c55e' : targetPercent >= 71 ? '#3b82f6' : targetPercent >= 41 ? '#facc15' : '#ef4444';

  // Profit is now decoupled from sales. It defaults to 0 unless manually set.
  const displayProfit = manualProfit !== null ? manualProfit : 0;

  const handleSaveProfit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempProfit !== '') {
      const val = parseFloat(tempProfit);
      const currentProfit = manualProfit !== null ? manualProfit : 0;
      const newProfit = currentProfit + val;
      setManualProfit(newProfit);
      localStorage.setItem('manualProfitData', JSON.stringify({
        amount: newProfit,
        date: new Date().toISOString().split('T')[0]
      }));
    }
    setIsProfitModalOpen(false);
  };

  const handleResetProfit = () => {
    setManualProfit(0);
    localStorage.setItem('manualProfitData', JSON.stringify({
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    }));
    setIsProfitModalOpen(false);
  };

  const openProfitModal = () => {
    setTempProfit('');
    setIsProfitModalOpen(true);
  };

  const loadTargets = () => {
    const raw = window.localStorage.getItem('dailyTargetData');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          dailyTarget: Number(parsed.dailyTarget) || 10000,
          weeklyTarget: Number(parsed.weeklyTarget) || 70000,
          monthlyTarget: Number(parsed.monthlyTarget) || 300000,
        };
      } catch {
        return { dailyTarget: 10000, weeklyTarget: 70000, monthlyTarget: 300000 };
      }
    }
    return { dailyTarget: 10000, weeklyTarget: 70000, monthlyTarget: 300000 };
  };

  const saveTargets = (values: { dailyTarget: number; weeklyTarget: number; monthlyTarget: number }) => {
    window.localStorage.setItem('dailyTargetData', JSON.stringify(values));
    window.dispatchEvent(new Event('targetUpdated'));
  };

  const updateTargetHistory = (dailyTarget: number) => {
    const today = new Date().toISOString().split('T')[0];
    const raw = window.localStorage.getItem('dailyTargetHistory');
    const history = raw ? JSON.parse(raw) : [];
    const updated = history.filter((day: any) => day.date !== today);
    updated.push({ date: today, target: dailyTarget, achieved: todaySales, updatedAt: new Date().toISOString() });
    window.localStorage.setItem('dailyTargetHistory', JSON.stringify(updated));
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      dailyTarget: Number(targetForm.dailyTarget) || 0,
      weeklyTarget: Number(targetForm.weeklyTarget) || 0,
      monthlyTarget: Number(targetForm.monthlyTarget) || 0,
    };
    setTargets(values);
    saveTargets(values);
    updateTargetHistory(values.dailyTarget);
    setIsTargetModalOpen(false);
  };

  useEffect(() => {
    setTargets(loadTargets());
    const calendar = () => {
      setTargets(loadTargets());
    };
    window.addEventListener('targetUpdated', calendar);
    return () => window.removeEventListener('targetUpdated', calendar);
  }, []);

  useEffect(() => {
    if (targets.dailyTarget > 0 && todaySales >= targets.dailyTarget && !hasSeenSuccess) {
      setShowSuccessModal(true);
      setHasSeenSuccess(true);
      setConfettiKeys(Array.from({ length: 24 }, (_, i) => i));
    }
    if (todaySales < targets.dailyTarget) {
      setHasSeenSuccess(false);
    }
  }, [todaySales, targets, hasSeenSuccess]);

  const handleTargetModalOpen = () => {
    const saved = loadTargets();
    setTargetForm({
      dailyTarget: saved.dailyTarget.toString(),
      weeklyTarget: saved.weeklyTarget.toString(),
      monthlyTarget: saved.monthlyTarget.toString(),
    });
    setIsTargetModalOpen(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setConfettiKeys([]);
  };

  const handleViewChange = (view: View, locked: boolean) => {
    if (locked) {
      setView(View.PLANS);
    } else {
      setView(view);
    }
  };

  // Mock data for dashboard
  const stats = [
    {
      label: 'আজকের বিক্রি',
      value: `৳ ${todaySales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgGradient: 'from-green-500/20 to-green-500/5',
      borderColor: 'border-green-500/30',
      action: () => handleViewChange(View.REPORTS, !isPro),
      actionIcon: isPro ? ArrowRight : Lock
    },
    {
      label: 'মোট বকেয়া',
      value: `৳ ${totalDue.toLocaleString()}`,
      icon: Users,
      color: 'text-red-500',
      bgGradient: 'from-red-500/20 to-red-500/5',
      borderColor: 'border-red-500/30'
    },
    {
      label: 'আজকের লাভ',
      value: `৳ ${displayProfit.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-500',
      bgGradient: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      action: openProfitModal,
      actionIcon: Edit2
    },
  ];

  const quickActions = [
    { label: 'বকেয়া খাতা', view: View.DUE_LIST, icon: Users, color: 'bg-gradient-to-br from-purple-600 to-purple-700', shadow: 'shadow-lg shadow-purple-500/30', locked: false },
    { label: 'ইনভয়েস তৈরি', view: View.INVOICE, icon: FileText, color: 'bg-gradient-to-br from-emerald-600 to-emerald-700', shadow: 'shadow-lg shadow-emerald-500/30', locked: false },
    { label: 'AI পরামর্শ', view: View.CHAT, icon: MessageSquare, color: 'bg-gradient-to-br from-orange-600 to-orange-700', shadow: 'shadow-lg shadow-orange-500/30', locked: false },
  ];

  const getBengaliDay = (date: Date) => {
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    return days[getDay(date)];
  };

  const getBestSalesDay = () => {
    if (transactions.length === 0) return null;

    // Initialize sales for each day (0=Sunday, 6=Saturday)
    const salesByDay = [0, 0, 0, 0, 0, 0, 0];

    transactions.forEach(t => {
      if (t.type === 'Income') {
        const day = getDay(parseISO(t.date));
        salesByDay[day] += t.amount;
      }
    });

    const maxSales = Math.max(...salesByDay);
    if (maxSales === 0) return null;

    const bestDayIndex = salesByDay.indexOf(maxSales);
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    return days[bestDayIndex];
  };

  const generateTip = () => {
    const today = getBengaliDay(new Date());
    const bestDay = getBestSalesDay();

    if (!bestDay) {
      return `আজ ${today}, ব্যবসার জন্য একটি নতুন দিন। আপনার স্টকে যথেষ্ট পণ্য আছে তো? নিয়মিত হিসাব রাখলে ব্যবসার উন্নতি নিশ্চিত।`;
    }

    if (today === bestDay) {
      return `আজ ${today}, আপনার ব্যবসার জন্য সেরা দিন! গত সপ্তাহের রিপোর্ট অনুযায়ী এই দিনে বিক্রি সবচেয়ে বেশি হয়। ক্রেতাদের জন্য বিশেষ অফার রাখতে পারেন।`;
    }

    return `আজ ${today}। গত সপ্তাহের রিপোর্ট অনুযায়ী ${bestDay} আপনার বিক্রির জন্য সবচেয়ে ভালো দিন ছিল। আজকের দিনের বিক্রি বাড়াতে নতুন কোনো অফার দিতে পারেন।`;
  };

  return (
    <div className={`p-4 space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>নমস্কার! 👋</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>আজকের ব্যবসার পরিস্থিতি একনজরে দেখে নিন।</p>
        </div>
        <div className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
          <Activity size={16} className="text-green-500 animate-pulse" />
          <span>সিস্টেম লাইভ আছে</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <div className={`p-6 rounded-[2rem] border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800' : 'bg-gradient-to-br from-white to-white/50 border-slate-200'} shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-slate-950/0 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative w-56 h-56 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="88" stroke="#1f2937" strokeWidth="16" fill="none" />
                <circle
                  cx="50%"
                  cy="50%"
                  r="88"
                  stroke={targetRingColor}
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={552}
                  strokeDashoffset={552 - (552 * targetPercent) / 100}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="text-slate-400 text-sm">আজকের বিক্রয়</span>
                <span className="text-3xl font-bold">৳ {todaySales.toLocaleString()}</span>
                <span className="text-slate-400 text-sm">/</span>
                <span className="text-slate-500 text-base">৳ {targets.dailyTarget.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <p className={`text-xl font-bold ${targetStatusColor}`}>{targetPercent}% সম্পন্ন</p>
              <p className="text-slate-400">{targetStatus === 'সফল' ? 'আজকের লক্ষ্য পূরণ হয়েছে!' : targetStatus === 'ভালো' ? 'লক্ষ্যে খুব কাছে' : targetStatus === 'সতর্ক' ? 'আপনি সঠিক পথে আছেন' : 'দ্রুত বিক্রি বাড়ান'}</p>
            </div>
            <button
              onClick={handleTargetModalOpen}
              className="mt-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              লক্ষ্য নির্ধারণ
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} border p-6 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm`}>
                <div>
                  <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm mb-2 font-medium`}>{stat.label}</p>
                  <h3 className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor}`}>
                  <stat.icon className={stat.color} size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),transparent_26%)] pointer-events-none" />
            {confettiKeys.map((key) => (
              <span
                key={key}
                className="confetti-piece"
                style={{
                  left: `${(key + 1) * 3.5}%`,
                  backgroundColor: ['#22c55e', '#3b82f6', '#facc15', '#ef4444'][key % 4],
                  animationDelay: `${key * 0.08}s`,
                }}
              />
            ))}
            <div className="relative z-10 space-y-4">
              <p className="text-5xl">🎉</p>
              <h2 className="text-3xl font-bold text-white">অভিনন্দন!</h2>
              <p className="text-slate-400 text-sm">আজকের লক্ষ্যমাত্রা পূরণ হয়েছে!</p>
              <p className="text-slate-200">চমৎকার কাজ! আপনি আজ <span className="font-bold">৳{todaySales.toLocaleString()}</span> টাকা বিক্রয় করেছেন</p>
              <p className="text-slate-400">এখনই আরও লক্ষ্য নির্ধারণ করুন এবং বিক্রয় বৃদ্ধির পরিকল্পনা করুন।</p>
              <button
                onClick={handleCloseSuccess}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Banner */}
      {showAd && (
        <SmartAd
          adSenseSlot="2182641593"
          adMobUnitId="ca-app-pub-6195759507222480/6000836790"
        />
      )}

      {/* Target Settings Modal */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-md p-6 shadow-2xl relative`}>
            <button
              onClick={() => setIsTargetModalOpen(false)}
              className={`absolute top-4 right-4 ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
            >
              <X size={24} />
            </button>
            <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>লক্ষ্যমাত্রা নির্ধারণ</h3>
            <form onSubmit={handleSaveTargets} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">দৈনিক লক্ষ্যমাত্রা (টাকা)</label>
                <input
                  type="number"
                  value={targetForm.dailyTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyTarget: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">সাপ্তাহিক লক্ষ্যমাত্রা (টাকা)</label>
                <input
                  type="number"
                  value={targetForm.weeklyTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, weeklyTarget: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">মাসিক লক্ষ্যমাত্রা (টাকা)</label>
                <input
                  type="number"
                  value={targetForm.monthlyTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, monthlyTarget: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-2xl hover:bg-slate-700 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700 transition"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profit Modal */}
      {isProfitModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative`}>
            <button
              onClick={() => setIsProfitModalOpen(false)}
              className={`absolute top-4 right-4 ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
            >
              <X size={24} />
            </button>

            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              <DollarSign className="text-blue-500" />
              লাভ যোগ করুন
            </h3>

            <form onSubmit={handleSaveProfit} className="space-y-4">
              <div>
                <label className={`block mb-1.5 text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>কত টাকা যোগ করবেন?</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                  <input
                    type="number"
                    value={tempProfit}
                    onChange={(e) => setTempProfit(e.target.value)}
                    placeholder="0.00"
                    className={`w-full ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl py-3 pl-10 pr-4 focus:border-blue-500 outline-none transition-all font-mono`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  বর্তমান লাভ: ৳ {displayProfit.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleResetProfit}
                  className={`flex-1 ${theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} font-bold py-3.5 rounded-xl transition-all active:scale-95`}
                >
                  রিসেট
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <ShoppingBag size={20} className="text-blue-400" />
          দ্রুত অ্যাকশন
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleViewChange(action.view, !!action.locked)}
              className={`${action.color} ${action.shadow} hover:opacity-95 hover:scale-105 active:scale-95 transition-all duration-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-white relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="bg-white/25 p-4 rounded-full group-hover:bg-white/35 transition-all duration-200">
                <action.icon size={28} />
              </div>
              <span className="font-semibold text-sm md:text-base relative z-10">{action.label}</span>
              {action.locked && (
                <div className="absolute top-3 right-3 bg-black/30 p-1.5 rounded-full backdrop-blur-sm">
                  <Lock size={12} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & AI Insight */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className={`${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>সাম্প্রতিক লেনদেন</h3>
            <button onClick={() => setView(View.REPORTS)} className="text-blue-400 text-sm flex items-center gap-1 hover:underline font-medium">
              সব দেখুন <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              [...transactions]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)
                .map((item, i) => (
                  <div key={i} className={`flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 p-2 rounded-lg transition ${theme === 'dark' ? 'border-slate-800/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.type === 'Income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.category || 'অজানা লেনদেন'}</p>
                        <p className="text-xs text-slate-500">{format(parseISO(item.date), 'dd MMM, hh:mm a')}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${item.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                      {item.type === 'Income' ? '+' : '-'} ৳ {item.amount}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                কোনো সাম্প্রতিক লেনদেন নেই
              </div>
            )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/40 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:border-blue-500/60">
          <div className="absolute top-0 right-0 p-16 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div>
            <h3 className={`font-bold mb-3 flex items-center gap-2 text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI</span>
              আজকের টিপস
            </h3>
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} leading-relaxed mb-6`}>
              "{generateTip()}"
            </p>
          </div>
          <button
            onClick={() => setView(View.CHAT)}
            className={`w-full ${theme === 'dark' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'} border-0 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
          >
            <MessageSquare size={16} />
            বিস্তারিত আলোচনা করুন
          </button>
        </div>
      </div>

      {/* Bottom Ad Banner */}
      <SmartAd
        adSenseSlot="2182641593"
        adMobUnitId="ca-app-pub-6195759507222480/6000836790"
      />
    </div>
  );
};

export default Home;
