import React, { useState, useEffect } from 'react';
import {
  Activity, Users, Shield, Zap, Settings,
  Lock, Power, RefreshCw, Search, AlertTriangle,
  TrendingUp, Wifi, Database, ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, updateDoc, onSnapshot, Unsubscribe, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { User } from '../../types';
import { useData } from '../../context/DataContext';

// --- Types ---
interface Signal {
  asset: string;
  entry: string;
  tp: string;
  sl: string;
}

// --- Render Helpers ---
const GlowCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-[24px] shadow-[0_0_15px_rgba(6,182,212,0.15)] p-6 ${className}`}>
    {children}
  </div>
);

const NeonButton = ({ onClick, children, variant = 'primary', className = '' }: any) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-cyan-500/10 text-cyan-400 border border-cyan-500 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    danger: "bg-red-500/10 text-red-500 border border-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    success: "bg-green-500/10 text-green-500 border border-green-500 hover:bg-green-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const NeonInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <label className="text-cyan-300/70 text-sm font-mono tracking-widest uppercase">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-black/50 border border-cyan-900/50 rounded-xl p-4 text-cyan-50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] outline-none transition-all placeholder:text-cyan-900/50 font-mono ${isPassword ? 'pr-12' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500/50 hover:text-cyan-400 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

const CyberpunkAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading: dataLoading } = useData();

  // --- State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'signals' | 'users' | 'settings'>('users'); // Default to users as requested
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // System State
  const [isAiSystemOn, setIsAiSystemOn] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [newSignal, setNewSignal] = useState<Signal>({ asset: '', entry: '', tp: '', sl: '' });

  useEffect(() => {
    if (dataLoading) return;

    let unsubscribe: Unsubscribe | null = null;

    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        // Check hardcoded email OR admin role from profile
        if (user.email === 'ashtosh.biswas.2026@gmail.com' || userProfile?.role === 'admin') {
          setIsAuthenticated(true);

          // Real-time listener for users
          try {
            unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
              const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
              setUsers(usersList);
              setError(null);
            }, (err) => {
              console.error("Error fetching users:", err);
              if (err.code === 'permission-denied') {
                setError("Access Denied: Insufficient permissions to view users.");
              } else {
                setError("Error loading users: " + err.message);
              }
            });

            // Fetch API Key
            getDoc(doc(db, 'settings', 'system')).then(docSnap => {
              if (docSnap.exists()) {
                setApiKey(docSnap.data().geminiApiKey || '');
              }
            }).catch(err => console.error("Error fetching settings:", err));

          } catch (err: any) {
            console.error("Error setting up listener:", err);
            setError(err.message);
          }

        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userProfile, dataLoading]);

  const toggleUserStatus = async (userId: string, currentStatus: 'active' | 'banned') => {
    try {
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("Failed to update status");
      setTimeout(() => setError(null), 3000);
    }
  };

  const upgradeUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { plan: 'pro' });
      setUsers(users.map(u => u.id === userId ? { ...u, plan: 'pro' } : u));
    } catch (error) {
      console.error("Error upgrading user:", error);
      setError("Failed to upgrade user");
      setTimeout(() => setError(null), 3000);
    }
  };

  const downgradeUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { plan: 'basic' });
      setUsers(users.map(u => u.id === userId ? { ...u, plan: 'basic' } : u));
    } catch (error) {
      console.error("Error downgrading user:", error);
      setError("Failed to downgrade user");
      setTimeout(() => setError(null), 3000);
    }
  };

  const postSignal = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`SIGNAL BROADCASTED: ${newSignal.asset} | ENTRY: ${newSignal.entry}`);
    setTimeout(() => setSuccessMsg(null), 3000);
    setNewSignal({ asset: '', entry: '', tp: '', sl: '' });
  };

  const saveApiKey = async () => {
    setIsSavingKey(true);
    try {
      await setDoc(doc(db, 'settings', 'system'), { geminiApiKey: apiKey }, { merge: true });
      setSuccessMsg("API Key saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error saving API key:", error);
      setError("Failed to save API key");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSavingKey(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500">Loading...</div>;
  }

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 rounded-full hover:bg-cyan-500 hover:text-black transition-all z-50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="relative z-10 w-full max-w-md">
          <GlowCard className="border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-full bg-cyan-500/10 border border-cyan-500/50 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Shield size={40} className="text-cyan-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-[0.2em] mb-2">BIZNURO AI</h1>
              <p className="text-cyan-500/60 font-mono text-sm mb-4">ADMINISTRATIVE ACCESS ONLY</p>
              <p className="text-red-500 font-bold text-center uppercase text-xs tracking-wide">
                ACCESS DENIED. YOU ARE NOT AN ADMIN.
              </p>
            </div>
          </GlowCard>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-cyan-50 font-sans selection:bg-cyan-500/30 pb-10">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-900/50 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500 hover:text-black transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <Activity className="text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-widest text-lg">ADMIN<span className="text-cyan-500">_PANEL</span></span>
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {['dashboard', 'signals', 'users', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-wider transition-all ${activeTab === tab
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-900/20'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 space-y-6 mt-6">

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
            <AlertTriangle size={24} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
            <Shield size={24} />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlowCard>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-cyan-500/60 font-mono text-sm mb-1">TOTAL USERS</p>
                    <h3 className="text-4xl font-bold text-white">{users.length}</h3>
                  </div>
                  <Users className="text-cyan-400" size={32} />
                </div>
                <div className="mt-4 h-1 w-full bg-cyan-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 w-[75%] shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                </div>
              </GlowCard>

              <GlowCard>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-cyan-500/60 font-mono text-sm mb-1">PRO MEMBERS</p>
                    <h3 className="text-4xl font-bold text-white">{users.filter(u => u.plan === 'pro').length}</h3>
                  </div>
                  <Shield className="text-purple-400" size={32} />
                </div>
                <div className="mt-4 h-1 w-full bg-purple-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 w-[45%] shadow-[0_0_10px_rgba(192,132,252,0.8)]"></div>
                </div>
              </GlowCard>

              <GlowCard>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-cyan-500/60 font-mono text-sm mb-1">BANNED USERS</p>
                    <h3 className="text-4xl font-bold text-white">{users.filter(u => u.status === 'banned').length}</h3>
                  </div>
                  <AlertTriangle className="text-red-400" size={32} />
                </div>
                <div className="mt-4 h-1 w-full bg-red-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 w-[10%] shadow-[0_0_10px_rgba(248,113,113,0.8)]"></div>
                </div>
              </GlowCard>
            </div>
          </div>
        )}

        {/* SIGNALS TAB */}
        {activeTab === 'signals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <GlowCard>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-cyan-400" /> POST NEW SIGNAL
              </h2>
              <form onSubmit={postSignal} className="space-y-4">
                <NeonInput
                  label="Asset Name"
                  placeholder="e.g. BTC/USDT"
                  value={newSignal.asset}
                  onChange={(e: any) => setNewSignal({ ...newSignal, asset: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-4">
                  <NeonInput
                    label="Entry Price"
                    placeholder="0.00"
                    value={newSignal.entry}
                    onChange={(e: any) => setNewSignal({ ...newSignal, entry: e.target.value })}
                  />
                  <NeonInput
                    label="Take Profit"
                    placeholder="0.00"
                    value={newSignal.tp}
                    onChange={(e: any) => setNewSignal({ ...newSignal, tp: e.target.value })}
                  />
                  <NeonInput
                    label="Stop Loss"
                    placeholder="0.00"
                    value={newSignal.sl}
                    onChange={(e: any) => setNewSignal({ ...newSignal, sl: e.target.value })}
                  />
                </div>
                <NeonButton className="w-full mt-4">
                  <Wifi size={18} /> BROADCAST SIGNAL
                </NeonButton>
              </form>
            </GlowCard>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <GlowCard className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-cyan-400" /> USER CONTROL
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50" size={16} />
                <input
                  type="text"
                  placeholder="SEARCH USER..."
                  className="bg-black/50 border border-cyan-900/50 rounded-lg pl-10 pr-4 py-2 text-sm text-cyan-50 focus:border-cyan-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyan-900/50 text-cyan-500/60 text-xs font-mono uppercase tracking-wider">
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-900/30">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-cyan-500/5 transition">
                      <td className="p-4 font-mono text-sm text-cyan-500">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${user.plan === 'pro' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {user.plan !== 'pro' ? (
                          <button
                            onClick={() => upgradeUser(user.id)}
                            className="px-3 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/50 hover:bg-purple-500 hover:text-white text-xs font-bold transition"
                          >
                            MAKE PRO
                          </button>
                        ) : (
                          <button
                            onClick={() => downgradeUser(user.id)}
                            className="px-3 py-1 rounded bg-slate-500/10 text-slate-400 border border-slate-500/50 hover:bg-slate-500 hover:text-white text-xs font-bold transition"
                          >
                            MAKE BASIC
                          </button>
                        )}
                        <button
                          onClick={() => toggleUserStatus(user.id, user.status)}
                          className={`px-3 py-1 rounded border text-xs font-bold transition ${user.status === 'active'
                            ? 'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500 hover:text-white'
                            : 'bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500 hover:text-white'
                            }`}
                        >
                          {user.status === 'active' ? 'BAN' : 'UNBAN'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlowCard>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <GlowCard>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="text-cyan-400" /> SYSTEM SETTINGS
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <NeonInput
                    label="Groq API Key"
                    value={apiKey}
                    onChange={(e: any) => setApiKey(e.target.value)}
                    type="password"
                    placeholder="Enter Groq API Key"
                  />
                  <NeonButton onClick={saveApiKey} className="w-full py-2 text-sm" disabled={isSavingKey}>
                    {isSavingKey ? 'SAVING...' : 'SAVE API KEY'}
                  </NeonButton>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-cyan-900/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">MAINTENANCE MODE</h3>
                      <p className="text-sm text-cyan-500/60">Suspend all user activities temporarily.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                    className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${isMaintenanceMode ? 'bg-yellow-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isMaintenanceMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-cyan-900/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-500">
                      <Database size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">CACHE CLEAR</h3>
                      <p className="text-sm text-cyan-500/60">Clear system cache and temporary files.</p>
                    </div>
                  </div>
                  <NeonButton variant="primary" className="py-2 px-4 text-sm">
                    <RefreshCw size={16} /> CLEAR NOW
                  </NeonButton>
                </div>
              </div>
            </GlowCard>
          </div>
        )}

      </main>
    </div>
  );
};

export default CyberpunkAdmin;
