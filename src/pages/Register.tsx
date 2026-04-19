import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Briefcase, CheckCircle2, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';
import type { UserRole } from '../types';

const Register: React.FC = () => {
  const [role, setRole] = useState<UserRole>('buyer');
  const navigate = useNavigate();

  const handleRegister = async () => {
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
          role: role,
          createdAt: serverTimestamp(),
        });
      }

      navigate(role === 'seller' ? '/pricing' : '/');
    } catch (error: any) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 bg-royal-blue p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-blue-500/10 skew-x-[-20deg] translate-x-1/2" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center mb-20 group">
            <Logo isWhite />
          </Link>

          <h2 className="text-5xl font-extrabold text-white leading-tight mb-8">
            The future of <span className="text-blue-300">business acquisition</span> starts here.
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="bg-blue-300/20 p-2 rounded-lg">
                <CheckCircle2 className="text-blue-300" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Verified Network</h4>
                <p className="text-blue-100/70 text-sm font-medium">Access over 10,000+ institutional buyers and verified high-net-worth individuals.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-300/20 p-2 rounded-lg">
                <TrendingUp className="text-blue-300" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Maximum Exposure</h4>
                <p className="text-blue-100/70 text-sm font-medium">Our Platinum listings reach institutional investors via premium database placement.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-200/50 text-xs font-bold uppercase tracking-[0.2em]">
          © 2026 Invest 4 Business. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 bg-corporate-gray/30">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-royal-blue mb-2">Create your account</h1>
            <p className="text-slate-500 font-medium">Choose how you want to use the platform</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-10">
            <button 
              onClick={() => setRole('buyer')}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4",
                role === 'buyer' ? "bg-white border-royal-blue shadow-xl shadow-royal-blue/10" : "bg-transparent border-slate-200 hover:border-slate-300"
              )}
            >
              <div className={cn("p-3 rounded-2xl transition-colors", role === 'buyer' ? "bg-royal-blue text-white" : "bg-slate-100 text-slate-400")}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className={cn("font-bold text-lg mb-0.5", role === 'buyer' ? "text-royal-blue" : "text-slate-600")}>I am a Buyer</h3>
                <p className="text-slate-400 text-sm font-medium">Browse listings, save favorites, and contact sellers directly.</p>
              </div>
            </button>

            <button 
              onClick={() => setRole('seller')}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4",
                role === 'seller' ? "bg-white border-royal-blue shadow-xl shadow-royal-blue/10" : "bg-transparent border-slate-200 hover:border-slate-300"
              )}
            >
              <div className={cn("p-3 rounded-2xl transition-colors", role === 'seller' ? "bg-royal-blue text-white" : "bg-slate-100 text-slate-400")}>
                <Users size={24} />
              </div>
              <div>
                <h3 className={cn("font-bold text-lg mb-0.5", role === 'seller' ? "text-royal-blue" : "text-slate-600")}>I am a Seller</h3>
                <p className="text-slate-400 text-sm font-medium">List your business, reach investors, and manage enquiries.</p>
              </div>
            </button>
          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-royal-blue text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-800 shadow-2xl shadow-royal-blue/30 transition-all active:scale-[0.98]"
          >
            Create My Account
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account? <Link to="/login" className="text-royal-blue font-bold hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
