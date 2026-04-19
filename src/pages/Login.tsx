import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Briefcase, Gavel, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleGoogleLogin = async () => {
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
          role: 'buyer',
          createdAt: serverTimestamp(),
        });
      }

      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.error("Firestore Permission Denied during login. Check rules.");
      }
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-corporate-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-10 group hover:scale-105 transition-transform">
          <Logo />
        </Link>
        <h2 className="text-3xl font-extrabold text-royal-blue tracking-tight">
          Welcome to Invest 4 Business
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          India's premier marketplace for business acquisitions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-slate-200 rounded-2xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400 font-medium">Secure verification by Firebase</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Your data is protected by enterprise-grade security. We never share your contact details without your explicit consent.
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <Gavel className="text-slate-600 shrink-0" size={20} />
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  By continuing, you agree to our Terms of Service and Privacy Policy. Standard verification steps apply for all institutional buyers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
