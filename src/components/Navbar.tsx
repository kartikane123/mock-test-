import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { LogIn, LogOut, User, Loader2 } from 'lucide-react';

export default function Navbar() {
  const [user, loading] = useAuthState(auth);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    try {
      setIsLoggingIn(true);
      await loginWithGoogle();
    } catch (error: any) {
      // Ignore cancellation errors as they are often benign or user-initiated
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed:", error);
        alert("Login failed. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) return null;

  return (
    <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0D1117]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center font-bold text-slate-900">A.I</div>
        <span className="text-lg font-semibold tracking-tight text-white">PRECISION<span className="text-cyan-500 underline underline-offset-4 decoration-2">MOCK</span></span>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs text-white font-medium">{user.displayName}</p>
              <p className="text-[10px] text-slate-500 font-mono italic">AI_VERIFIED</p>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 bg-cyan-600 px-4 py-2 rounded text-slate-900 font-black uppercase tracking-tighter text-sm hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {isLoggingIn ? 'Logging in...' : 'Login with Google'}
          </button>
        )}
      </div>
    </nav>
  );
}
