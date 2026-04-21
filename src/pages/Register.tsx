import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ShoppingBag, 
  Users, 
  Mail, 
  Phone, 
  User, 
  Lock, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Building2, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  MapPin,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';
import type { UserRole } from '../types';

const Register: React.FC = () => {
  const [role, setRole] = useState<UserRole>('acquirer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    country: 'UAE' as any,
    city: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("All fields are required.");
      return;
    }

    if (role === 'seller' && (!formData.businessName || !formData.city)) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: formData.name });

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userData: any = {
        uid: firebaseUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: role,
        status: 'active',
        createdAt: serverTimestamp(),
      };

      if (role === 'seller') {
        userData.businessName = formData.businessName;
        userData.location = {
          country: formData.country,
          city: formData.city
        };
      }

      await setDoc(userRef, userData);

      navigate(role === 'seller' ? '/pricing' : '/');
    } catch (err: any) {
      console.error("Partnership initiation failed:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("No account found with this email."); // Requirement: reuse same message or appropriate
        setError("This email is already associated with an existing partnership.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use a stronger access token.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Something went wrong. Check your internet connection.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`Authentication provider not enabled. Please enable "Email/Password" and "Google" in your Firebase console: https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/providers`);
      } else {
        setError(err.message || "Credential validation failed. Please review your input.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData: any = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: role,
          status: 'active',
          createdAt: serverTimestamp(),
        };
        
        // Google doesn't give us business/location, so we'll have to ask later or redirect to profile
        await setDoc(userRef, userData);
      }

      navigate(role === 'seller' ? '/pricing' : '/');
    } catch (err: any) {
      console.error("SSO Registration failed:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError(`Google login is not enabled in this project. Enable it at: https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/providers`);
      } else if (err.code === 'auth/network-request-failed') {
        setError("Something went wrong. Check your internet connection.");
      } else {
        setError(err.message || "SSO Registration failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row overflow-hidden">
      {/* Strategic Branding Lateral */}
      <div className="hidden md:flex flex-[0.8] bg-royal-blue p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-block mb-24 hover:scale-105 transition-transform">
            <Logo className="h-10" isWhite />
          </Link>

          <h2 className="text-6xl font-black text-white leading-[0.9] tracking-tighter mb-10 max-w-lg">
            Architect your <span className="text-blue-300">Financial Future</span> with Global Precision.
          </h2>
          
          <div className="space-y-10 mt-16">
            <div className="flex gap-6 items-start group">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 group-hover:bg-white/20 transition-all shadow-lg">
                <Building2 className="text-blue-200" size={28} />
              </div>
              <div className="max-w-md">
                <h4 className="text-white font-black text-xl mb-2">Institutional-Grade Coverage</h4>
                <p className="text-blue-100/60 font-bold leading-relaxed">Connect with accredited acquirers and institutional capital across Asia and the Middle East.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-10">
           <p className="text-blue-300 font-black uppercase tracking-[0.3em] text-[10px]">© 2026 Inves4Business System</p>
        </div>
      </div>

      {/* Onboarding Logic Center */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-16 overflow-y-auto">
        <div className="max-w-lg w-full mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-black text-royal-blue tracking-tighter mb-2 leading-none">Register Partnership</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Initiating Secure Marketplace Integration</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button 
              onClick={() => setRole('acquirer')}
              className={cn(
                "p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                role === 'acquirer' ? "bg-white border-royal-blue shadow-2xl shadow-royal-blue/10" : "bg-[#F9FAFB] border-slate-50 hover:border-slate-200"
              )}
            >
              <div className={cn("p-3 rounded-2xl transition-all shadow-lg", role === 'acquirer' ? "bg-royal-blue text-white scale-110" : "bg-white text-slate-300")}>
                <ShoppingBag size={20} />
              </div>
              <div className="text-center">
                 <span className={cn("font-black text-xs uppercase tracking-widest block", role === 'acquirer' ? "text-royal-blue" : "text-slate-400")}>Continue as Buyer</span>
              </div>
            </button>

            <button 
              onClick={() => setRole('seller')}
              className={cn(
                "p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                role === 'seller' ? "bg-white border-royal-blue shadow-2xl shadow-royal-blue/10" : "bg-[#F9FAFB] border-slate-50 hover:border-slate-200"
              )}
            >
              <div className={cn("p-3 rounded-2xl transition-all shadow-lg", role === 'seller' ? "bg-royal-blue text-white scale-110" : "bg-white text-slate-300")}>
                <Users size={20} />
              </div>
              <div className="text-center">
                 <span className={cn("font-black text-xs uppercase tracking-widest block", role === 'seller' ? "text-royal-blue" : "text-slate-400")}>Join as Seller</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm animate-shake">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-1.5">
                 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Full Name</label>
                 <div className="relative">
                   <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input required type="text" name="name" placeholder="John Doe"
                     className="w-full bg-[#F9FAFB] border border-slate-50 rounded-[20px] py-4 pl-14 pr-6 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-200"
                     value={formData.name} onChange={handleInputChange} />
                 </div>
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Phone Number</label>
                 <div className="relative">
                   <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input required type="tel" name="phone" placeholder="+1 234 567 890"
                     className="w-full bg-[#F9FAFB] border border-slate-50 rounded-[20px] py-4 pl-14 pr-6 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-200"
                     value={formData.phone} onChange={handleInputChange} />
                 </div>
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Email Address</label>
               <div className="relative">
                 <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input required type="email" name="email" placeholder="executive@firm.com"
                   className="w-full bg-[#F9FAFB] border border-slate-50 rounded-[20px] py-4 pl-14 pr-6 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-200"
                   value={formData.email} onChange={handleInputChange} />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Security Cipher (Password)</label>
               <div className="relative">
                 <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input required type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
                   className="w-full bg-[#F9FAFB] border border-slate-50 rounded-[20px] py-4 pl-14 pr-14 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-200"
                   value={formData.password} onChange={handleInputChange} />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
               </div>
            </div>

            {role === 'seller' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 pt-2 border-t border-slate-100"
              >
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input required type="text" name="businessName" placeholder="Global Assets Ltd"
                        className="w-full bg-[#F9FAFB] border border-slate-50 rounded-[20px] py-4 pl-14 pr-6 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-200"
                        value={formData.businessName} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select name="country" 
                          className="w-full bg-[#F9FAFB] border border-slate-50 rounded-[20px] py-4 pl-14 pr-6 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue appearance-none"
                          value={formData.country} onChange={handleInputChange}>
                          <option value="UAE">UAE</option>
                          <option value="Qatar">Qatar</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input required type="text" name="city" placeholder="Dubai"
                          className="w-full bg-[#F9FAFB] border border-slate-50 rounded-[20px] py-4 pl-14 pr-6 outline-none focus:border-royal-blue/30 focus:bg-white transition-all font-bold text-royal-blue placeholder:text-slate-200"
                          value={formData.city} onChange={handleInputChange} />
                      </div>
                    </div>
                  </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-royal-blue text-white py-5 rounded-[20px] font-black text-lg hover:bg-blue-800 shadow-2xl shadow-royal-blue/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  Confirm Partnership
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-white text-slate-200 font-black uppercase tracking-widest text-[8px]">Standard SSO Protocols</span>
            </div>
          </div>

          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex justify-center items-center gap-4 py-4 border border-slate-100 rounded-[20px] bg-white text-sm font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Establish Identity via Google
          </button>
          
          <footer className="mt-8 text-center pb-8">
            <p className="text-slate-400 font-bold text-sm">
              Already Whitelisted? <Link to="/login" className="text-royal-blue hover:underline">Authenticated Entry</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Register;
