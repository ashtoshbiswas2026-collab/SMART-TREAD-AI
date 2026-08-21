/// <reference types="vite/client" />
import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this should be a server-side check.
    // For this client-side demo, we use environment variables.
    const adminUser = import.meta.env.VITE_ADMIN_USER || 'admin@smarttrade.ai';
    const adminPass = import.meta.env.VITE_ADMIN_PASS || 'admin123';

    if (email === adminUser && password === adminPass) {
      sessionStorage.setItem('admin_token', 'secure_token_123');
      onLogin();
    } else {
      setError('Invalid credentials');
      // Log attempt (mock)
      console.warn(`Failed admin login attempt: ${email}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-800 rounded-full text-blue-500">
            <Lock size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h2>
        <p className="text-red-500 font-bold text-center mb-8 uppercase text-sm tracking-wide">
          DON'T LOGIN HERE BECAUSE CLICK HERE AND END YOUR ACCOUNT
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition mt-4"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
