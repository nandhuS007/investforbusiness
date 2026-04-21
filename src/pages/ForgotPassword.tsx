import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ArrowRight, ShieldCheck, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!email.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Something went wrong. Check your internet connection.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
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
            Security Core.
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Institutional Asset Recovery & Restoration
          </p>
        </div>

        {/* Elevated Form Container */}
        <div className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl shadow-royal-blue/10 border border-slate-50">
          {success ? (
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={48} />
               </div>
               <div className="space-y-4">
                 <h2 className="text-2xl font-black text-royal-blue">Reset Dispatched.</h2>
                 <p className="text-slate-500 font-bold leading-relaxed">
                   Password reset link sent to your email. Please check your inbox and secondary folders to continue.
                 </p>
               </div>
               <button
                 onClick={() => navigate('/login')}
                 className="w-full bg-royal-blue text-white py-6 rounded-[24px] font-black text-lg hover:bg-blue-800 shadow-2xl shadow-royal-blue/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
               >
                 Return to Authentication
               </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-8">
              <div className="space-y-4">
                <p className="text-slate-500 font-bold text-center leading-relaxed px-4">
                  Enter your registered institutional email to initiate the secure restoration protocol.
                </p>
                
                {error && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm animate-shake">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Registry Email</label>
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-royal-blue text-white py-6 rounded-[24px] font-black text-lg hover:bg-blue-800 shadow-2xl shadow-royal-blue/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                 <Link to="/login" className="text-royal-blue font-black text-sm uppercase tracking-widest hover:underline px-4">
                   Authenticated Entry Portal
                 </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security Assurance */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300">
            <ShieldCheck size={14} className="text-green-500" />
            End-to-End Encryption
          </div>
          <div className="w-1 h-1 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300">
            <Globe size={14} className="text-blue-500" />
            Global Key Infrastructure
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
