import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { View } from './types';
import Sidebar from './components/Sidebar';
import { Menu, LogOut, AlertTriangle, Copy } from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { isNative, setupNativeEnvironment } from './utils/native';

const Chat = lazy(() => import('./components/Chat'));
const Calculator = lazy(() => import('./components/Calculator'));
const DueManager = lazy(() => import('./components/DueManager'));
const Reports = lazy(() => import('./components/Reports'));
const BusinessTools = lazy(() => import('./components/BusinessTools'));
const Invoice = lazy(() => import('./components/Invoice'));
const Notepad = lazy(() => import('./components/Notepad'));
const PricingPlans = lazy(() => import('./components/PricingPlans'));
const Home = lazy(() => import('./components/Home'));
const Login = lazy(() => import('./components/Login'));
const Calendar = lazy(() => import('./components/Calendar'));
const SalesList = lazy(() => import('./components/SalesList'));
const DailyProfit = lazy(() => import('./components/DailyProfit'));
const SetupWizard = lazy(() => import('./components/SetupWizard'));
const TargetHistory = lazy(() => import('./components/TargetHistory'));
const PrinterSettings = lazy(() => import('./components/PrinterSettings'));
const QRScanner = lazy(() => import('./components/QRScanner'));
const CyberpunkAdmin = lazy(() => import('./components/Admin/CyberpunkAdmin'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[400px] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const navigate = useNavigate();
  const { error, user, loading } = useData();
  const { theme } = useTheme();

  // Check if this is first login
  useEffect(() => {
    if (user && !loading) {
      const setupCompleted = localStorage.getItem('setupWizardCompleted');
      const userSetupCompleted = localStorage.getItem(`setupWizard_${user.uid}`);

      if (!setupCompleted && !userSetupCompleted) {
        setShowSetupWizard(true);
      }
    }
  }, [user, loading]);

  const handleSetupComplete = (data: any) => {
    if (user) {
      localStorage.setItem(`setupWizard_${user.uid}`, 'true');
    }
    setShowSetupWizard(false);
  };

  if (showSetupWizard && user) {
    const shopName = localStorage.getItem('shopName') || '';
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SetupWizard
          onComplete={handleSetupComplete}
          initialShopName={shopName}
        />
      </Suspense>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return <Home setView={setCurrentView} />;
      case View.SALES_LIST:
        return <SalesList />;
      case View.DAILY_PROFIT:
        return <DailyProfit />;
      case View.CHAT:
        return <Chat />;
      case View.CALENDAR:
        return <Calendar />;
      case View.CALCULATOR:
        return <Calculator />;
      case View.DUE_LIST:
      case View.DUE_ANALYSIS:
        return <DueManager view={currentView} />;
      case View.REPORTS:
        return <Reports setView={setCurrentView} />;
      case View.INVOICE:
        return <Invoice />;
      case View.NOTEPAD:
        return <Notepad />;
      case View.TARGET_HISTORY:
        return <TargetHistory />;
      case View.PRINTER_SETTINGS:
        return <PrinterSettings />;
      case View.QR_SCANNER:
        return <QRScanner />;
      case View.PRICING_TOOL:
      case View.LOSS_PREVENTION:
      case View.GUIDELINES:
      case View.SALES_TIPS:
        return <BusinessTools view={currentView} />;
      case View.PLANS:
        return <PricingPlans />;
      default:
        return <Home setView={setCurrentView} />;
    }
  };

  if (error) {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}`;

    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center p-4`}>
        <div className={`${theme === 'dark' ? 'bg-slate-900 border-red-500/30' : 'bg-white border-red-200'} border rounded-2xl p-8 max-w-2xl w-full shadow-2xl`}>
          <div className="flex items-center gap-4 mb-6 text-red-500">
            <AlertTriangle size={48} />
            <h1 className="text-2xl font-bold">Database Configuration Required</h1>
          </div>

          <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-6 text-lg`}>
            Your Firestore database security rules are blocking access. This is normal for a new project.
            Please update your rules to allow authenticated users to access their own data.
          </p>

          <div className={`${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'} border rounded-xl p-4 mb-6 relative group`}>
            <pre className="text-green-400 font-mono text-sm overflow-x-auto p-2">
              {rules}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(rules)}
              className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50 border border-slate-200'} text-slate-500 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold absolute top-4 right-4`}
            >
              <Copy size={14} /> Copy Rules
            </button>
          </div>

          <div className="space-y-4">
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold`}>How to fix:</h3>
            <ol className={`list-decimal list-inside ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} space-y-2`}>
              <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Firebase Console</a></li>
              <li>Select your project: <strong>smart-tread-ai</strong></li>
              <li>Navigate to <strong>Firestore Database</strong> {'>'} <strong>Rules</strong></li>
              <li>Paste the rules above and click <strong>Publish</strong></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-blue-500/30 transition-colors duration-300`}>
      <Sidebar
        currentView={currentView}
        setView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full min-h-0 relative overflow-hidden">
        {/* Mobile Header */}
        <div className={`lg:hidden flex items-center justify-between px-3 py-3 border-b ${theme === 'dark' ? 'border-slate-800 bg-gradient-to-r from-blue-400 to-purple-500' : 'border-slate-200 bg-gradient-to-r from-blue-400 to-purple-500'}`}>
          <button onClick={() => setIsSidebarOpen(true)} className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            <Menu size={24} />
          </button>
          <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>BIZNURO AI</h1>
          <button
            onClick={handleLogout}
            className={`text-sm font-medium border ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100 text-slate-700'} px-3 py-1 rounded-lg`}
          >
            প্রস্থান
          </button>
        </div>

        {/* Desktop Header / Top Bar */}
        <div className={`hidden lg:flex justify-end items-center px-3 py-3 glass bg-gradient-to-r from-blue-400 to-purple-500`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 btn-gradient px-4 py-2 rounded-lg text-sm font-medium transition`}
          >
            প্রস্থান করুন
            <LogOut size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar lg:p-4 lg:pt-0 pb-safe">
          <Suspense fallback={<LoadingFallback />}>
            {renderView()}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    setupNativeEnvironment();
  }, []);

  const Router = isNative ? HashRouter : BrowserRouter;

  return (
    <ThemeProvider>
      <DataProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin-9XqA72-hidden" element={<CyberpunkAdmin />} />
              {/* Catch all - redirect to home (login) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;