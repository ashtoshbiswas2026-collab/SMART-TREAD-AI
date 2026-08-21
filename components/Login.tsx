import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useData } from '../context/DataContext';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  sendEmailVerification,
  signOut
} from 'firebase/auth';

// Login Component
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  // Expose a global function for Android WebView to call
  useEffect(() => {
    (window as any).loginFromNative = async (idToken: string) => {
      try {
        setIsLoading(true);
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        navigate('/dashboard');
      } catch (err: any) {
        console.error("Native login error:", err);
        setError("নেটিভ লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        setIsLoading(false);
      }
    };

    return () => {
      delete (window as any).loginFromNative;
    };
  }, [navigate]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setUnauthorizedDomain(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setShowVerification(true);
      }
    } catch (err: any) {
      console.error("Auth error:", err);

      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password login is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.");
      } else if (isLogin) {
        // auth/invalid-credential, auth/user-not-found, auth/wrong-password
        setError("Email or password is incorrect.");
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setError("User already exists. Please sign in.");
        } else if (err.code === 'auth/weak-password') {
          setError("Password should be at least 6 characters.");
        } else {
          setError(err.message || "An error occurred. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    setUnauthorizedDomain(null);

    // Check if running inside Android WebView with our JS Interface
    if ((window as any).AndroidAuth) {
      try {
        (window as any).AndroidAuth.startGoogleSignIn();
        // The native code will call window.loginFromNative(idToken) when done
        return;
      } catch (err) {
        console.error("Failed to trigger native login:", err);
        setIsLoading(false);
      }
    }

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        console.warn("Google auth cancelled by user");
        setError("লগইন বাতিল করা হয়েছে। আবার চেষ্টা করুন।");
      } else if (err.code === 'auth/unauthorized-domain') {
        console.error("Google auth error:", err);
        const domain = window.location.hostname;
        setUnauthorizedDomain(domain);
        setError(`Domain (${domain}) is not authorized.`);
      } else {
        console.error("Google auth error:", err);
        setError("গুগল সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    // We will render the verification UI above the login card instead of a separate screen
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Verification Code Box */}
      {showVerification && (
        <div className="w-full max-w-md mb-6 relative z-20 animate-fade-in-down">
          <div className="bg-slate-900/90 border-2 border-blue-500 rounded-xl p-6 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-xl text-center">
            <div className="inline-flex p-2 bg-blue-500/20 rounded-full mb-3 text-blue-400">
              <Shield size={24} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">ভেরিফিকেশন কোড</h3>
            <p className="text-slate-400 text-sm mb-4">
              আপনার মেইলে (<span className="text-white">{email}</span>) পাঠানো ৬ সংখ্যার কোডটি দিন
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white text-center text-2xl tracking-[0.5em] focus:border-blue-500 outline-none font-mono mb-4"
              placeholder="000000"
              maxLength={6}
            />
            <button
              onClick={() => {
                // Simulate verification success
                if (verificationCode.length >= 4) {
                  setShowVerification(false);
                  setIsLogin(true);
                  setPassword('');
                  setError('Verification successful! Please login.'); // Using error state for message
                } else {
                  setError('Please enter a valid code');
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors"
            >
              যাচাই করুন
            </button>
          </div>
        </div>
      )}

      <div className={`bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 transition-all duration-500 ${showVerification ? 'opacity-50 scale-95 pointer-events-none blur-[2px]' : ''}`}>
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/20 rounded-xl mb-4 text-blue-500">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'স্বাগতম' : 'অ্যাকাউন্ট তৈরি করুন'}
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'আপনার BIZNURO AI ড্যাশবোর্ডে প্রবেশ করতে সাইন ইন করুন' : 'BIZNURO AI দিয়ে শুরু করতে সাইন আপ করুন'}
          </p>
        </div>

        {unauthorizedDomain ? (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg text-sm">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span className="font-bold">কনফিগারেশন প্রয়োজন</span>
            </div>
            <p className="mb-3 text-slate-300">
              এই ডোমেইনটি ফায়ারবেসে অনুমোদিত নয়। অনুগ্রহ করে এটি যোগ করুন:
              <br />
              <span className="text-xs opacity-70">Authentication {'>'} Settings {'>'} Authorized domains</span>
            </p>
            <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded border border-slate-800">
              <code className="flex-1 font-mono text-xs text-slate-300 truncate select-all">
                {unauthorizedDomain}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(unauthorizedDomain)}
                className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-2 py-1 rounded transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        ) : error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">ইমেইল অ্যাড্রেস</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-offset-slate-900" />
                <span className="text-slate-400">আমাকে মনে রাখুন</span>
              </label>
              <button type="button" className="text-blue-400 hover:text-blue-300">পাসওয়ার্ড ভুলে গেছেন?</button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'সাইন ইন' : 'সাইন আপ'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">অথবা এর মাধ্যমে চালিয়ে যান</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            গুগল দিয়ে চালিয়ে যান
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "কোনো অ্যাকাউন্ট নেই? " : "ইতিমধ্যে একটি অ্যাকাউন্ট আছে? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            {isLogin ? 'অ্যাকাউন্ট তৈরি করুন' : 'সাইন ইন'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
