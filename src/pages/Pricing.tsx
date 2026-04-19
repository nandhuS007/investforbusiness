import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Star, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError } from '../services/firestore';

const plans = [
  {
    id: 'silver',
    name: 'Silver',
    price: 999,
    limit: 5,
    features: ['5 Business Listings', 'Dashboard Access', 'Standard Support', 'Verified Badge'],
    icon: <Shield size={24} className="text-slate-400" />,
    color: 'border-slate-200'
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 2499,
    limit: 15,
    features: ['15 Business Listings', 'Priority Dashboard', 'Email Support', 'Verified Badge', 'Document Support'],
    icon: <Zap size={24} className="text-amber-500" />,
    color: 'border-amber-200',
    popular: true
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 4999,
    limit: 'Unlimited',
    features: ['Unlimited Listings', 'Featured Homepage Ads', 'Direct Admin Sync', 'Premium Verified Badge', 'Institutional Access'],
    icon: <Star size={24} className="text-royal-blue" />,
    color: 'border-royal-blue'
  }
];

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }

    if (!razorpayKey) {
      alert("Razorpay Key ID is not configured. Please add VITE_RAZORPAY_KEY_ID in Secrets.");
      return;
    }

    setLoading(plan.id);

    try {
      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(null);
        return;
      }

      // 2. Create Order in Backend
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price })
      });
      const orderData = await orderRes.json();

      if (!orderData.id) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Invest 4 Business",
        description: `Subscription: ${plan.name} Plan`,
        image: "/input_file_0.png",
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // 4. Verify Payment in Backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              // 5. Update User Profile in Firestore
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, {
                role: 'seller',
                subscription: {
                  planId: plan.id,
                  active: true,
                  paymentId: response.razorpay_payment_id,
                  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
              });
              alert(`Successfully subscribed to ${plan.name} plan! Welcome, Seller.`);
              navigate('/seller');
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            handleFirestoreError(err, 'update', `users/${user.uid}`);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#1a237e"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      console.error("Subscription process failed:", error);
      alert(error.message || "Something went wrong during subscription.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-500 mb-4">Pricing Plans</h2>
          <h1 className="text-4xl md:text-6xl font-black text-royal-blue mb-6 tracking-tight">
            Choose Your <span className="italic font-serif">Growth</span> Strategy
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Connect your business with the right investors through our premium listing packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={cn(
                "relative bg-white p-10 rounded-[40px] border-2 transition-all duration-500 hover:shadow-2xl flex flex-col group",
                plan.color,
                plan.popular ? "shadow-xl shadow-amber-500/10 scale-105 z-10" : "shadow-sm"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <div className="bg-slate-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-black text-royal-blue">{plan.name}</h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-royal-blue tracking-tighter">₹{plan.price}</span>
                  <span className="text-slate-400 font-bold">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                    <div className="bg-blue-50 p-1 rounded-full shrink-0">
                      <Check size={12} className="text-blue-500" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={loading !== null}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-xl",
                  plan.popular ? "bg-royal-blue text-white shadow-royal-blue/30" : "bg-slate-100 text-royal-blue hover:bg-slate-200 shadow-slate-200/50"
                )}
              >
                {loading === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  user?.subscription?.planId === plan.id ? "Current Plan" : "Get Started"
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-24 bg-royal-blue rounded-[40px] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-3xl font-black text-white mb-4">Need a custom enterprise solution?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto font-medium">
            For major acquisitions and institutional portfolios, we offer white-glove service and dedicated advisory teams.
          </p>
          <button className="bg-white text-royal-blue px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-2xl">
            Contact Advisory Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
