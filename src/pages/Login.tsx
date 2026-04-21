import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Lock, ShieldCheck, ArrowRight, Globe, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      if (isAdmin) navigate('/admin');
      else if (user.role === 'seller') navigate('/merchant');
      else if (user.role === 'acquirer') navigate('/');
      else navigate(from);
    }
  }, [user, isAdmin, navigate, from]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Something went wrong. Check your internet connection.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`Authentication provider not enabled. Please enable "Email/Password" and "Google" in your Firebase console: https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/providers`);
      } else {
        setError(err.message || "Authentication attempt failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: 'acquirer',
          status: 'active',
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error("SSO attempt failed:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError(`Google login is not enabled in this project. Enable it at: https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/providers`);
      } else if (err.code === 'auth/network-request-failed') {
        setError("Something went wrong. Check your internet connection.");
      } else {
        setError(err.message || "SSO attempt failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg">
        {/* Superior Branding */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-10 hover:scale-105 transition-all">
            <Logo className="h-10 mx-auto" strokeWidth={2.5} />
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-royal-blue tracking-tighter leading-none mb-4">
            Welcome Back.
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Institutional Access & Global Market Coordination
          </p>
        </div>

        {/* Elevated Form Container */}
        <div className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl shadow-royal-blue/10 border border-slate-50">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm animate-shake">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Digital ID</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  required
                  type="email"
                  placeholder="name@organization.com"
                  className="w-full bg-[#F9FAFB] border border-slate-100 rounded-[24px] py-5 pl-16 pr-6 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-6 mr-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Access Token</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-royal-blue hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-[#F9FAFB] border border-slate-100 rounded-[24px] py-5 pl-16 pr-14 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-200"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-royal-blue text-white py-6 rounded-[24px] font-black text-lg hover:bg-blue-800 shadow-2xl shadow-royal-blue/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  Authenticate
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-slate-200 font-black uppercase tracking-widest text-[8px]">Standard SSO Protocols</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-4 py-5 border border-slate-100 rounded-[24px] bg-white text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in via Google Enterprise
          </button>

          <footer className="mt-12 text-center">
            <p className="text-slate-400 font-bold text-sm">
              New to the Network? <Link to="/register" className="text-royal-blue hover:underline">Register Partnership</Link>
            </p>
          </footer>
        </div>

        {/* Security Assurance */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300">
            <ShieldCheck size={14} className="text-green-500" />
            TLS 1.3 Encryption
          </div>
          <div className="w-1 h-1 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300">
            <Globe size={14} className="text-blue-500" />
            Regional Compliance
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
