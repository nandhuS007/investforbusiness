import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Star, Zap, Crown, ArrowRight, Loader2, Info, Gem } from 'lucide-react';
import { cn } from '../lib/utils';
import { createPlanRequest } from '../services/firestore';
import { motion } from 'motion/react';
import type { MembershipPlan } from '../types';

const plans: {
  id: MembershipPlan;
  name: string;
  priceText: string;
  description: string;
  features: string[];
  icon: any;
  highlight?: boolean;
}[] = [
  {
    id: 'Basic',
    name: 'Basic',
    priceText: 'Standard Access',
    description: 'Entry-level access for small sellers and individual assets.',
    features: [
      'Standard listing visibility',
      'Acquirer enquiries',
      'Email support',
      'Merchant dashboard access'
    ],
    icon: Shield,
  },
  {
    id: 'Intermediate',
    name: 'Intermediate',
    priceText: 'Growth Focus',
    description: 'Enhanced visibility for growing businesses seeking faster acquisition.',
    features: [
      'Enhanced search visibility',
      'Better market exposure',
      'Priority ticket support',
      'Historical performance data'
    ],
    icon: Zap,
    highlight: true,
  },
  {
    id: 'Platinum',
    name: 'Platinum',
    priceText: 'Institutional Tier',
    description: 'Maximum visibility and direct institutional reach for high-value assets.',
    features: [
      'Top homepage placement',
      'Featured platinum badge',
      'Unlimited business listings',
      'Dedicated concierge support',
      'Verification assistance'
    ],
    icon: Crown,
  },
  {
    id: 'Diamond',
    name: 'Diamond',
    priceText: 'Global Strategic',
    description: 'The pinnacle of asset visibility. Absolute dominance in search and direct institutional pitch distribution.',
    features: [
      'Guaranteed #1 search ranking',
      'Direct pitch to institutional funds',
      'White-glove asset verification',
      'Unlimited premium listings',
      '24/7 dedicated account executive'
    ],
    icon: Gem,
  }
];

const Pricing: React.FC = () => {
  const { user, isSeller, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !isSeller) {
      // If logged in but not a seller, they shouldn't see this
      navigate('/');
    }
  }, [user, isSeller, authLoading, navigate]);

  const handleRequestPlan = async (plan: typeof plans[0]) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }

    setSubmitting(plan.id);
    try {
      await createPlanRequest(plan.id);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert("Request failed: " + error.message);
    } finally {
      setSubmitting(null);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-royal-blue font-black tracking-widest uppercase text-xs">
      Initialising Pricing Grid...
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="relative pt-32 pb-40 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-royal-blue/[0.02] -skew-y-3 origin-top-left" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        
        <div className="relative max-w-7xl mx-auto z-10">
          <div className="text-center mb-24 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-royal-blue text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <Star size={12} className="fill-current" />
              Sellers Perspective
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black text-royal-blue leading-[0.9] tracking-tighter"
            >
              Institutional <br />
              <span className="text-blue-500">Tier Matrix.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
            >
              Select your membership level to determine visibility algorithms 
              and acquisition priority across our global network.
            </motion.p>
          </div>

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-16 max-w-3xl mx-auto bg-green-50 border border-green-200 p-10 rounded-[40px] text-center space-y-6 shadow-2xl shadow-green-500/10"
            >
              <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                 <Check size={40} />
              </div>
              <h3 className="text-3xl font-black text-green-900">Request Dispatched</h3>
              <p className="text-green-700 font-bold">
                Your plan request has been sent to admin for approval. 
                We will notify you once your institutional visibility has been updated.
              </p>
              <button 
                onClick={() => navigate('/merchant')}
                className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-green-700 transition-all"
              >
                Return to Hub
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={cn(
                  "relative group flex flex-col transition-all duration-700",
                  plan.id === 'Platinum' || plan.id === 'Diamond' ? "z-20 md:-translate-y-8" : "z-10"
                )}
              >
                {plan.id === 'Diamond' && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-royal-blue text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl z-30 whitespace-nowrap">
                    Pinnacle Tier
                  </div>
                )}

                <div className={cn(
                  "bg-white p-8 rounded-[60px] border transition-all duration-500 flex flex-col h-full",
                  plan.id === 'Diamond'
                    ? "border-royal-blue shadow-[0_40px_80px_rgba(30,58,138,0.15)] ring-4 ring-royal-blue/5 scale-105"
                    : (plan.id === 'Platinum' 
                        ? "border-amber-400 shadow-[0_40px_80px_rgba(251,191,36,0.15)] ring-4 ring-amber-400/5" 
                        : "border-slate-100 hover:border-royal-blue/20 shadow-sm hover:shadow-2xl hover:shadow-royal-blue/5")
                )}>
                  <div className="mb-10">
                    <div className={cn(
                      "w-14 h-14 rounded-[20px] flex items-center justify-center mb-6 shadow-inner",
                      plan.id === 'Diamond' ? "bg-royal-blue text-white" : (plan.id === 'Platinum' ? "bg-amber-400 text-royal-blue" : "bg-royal-blue/5 text-royal-blue")
                    )}>
                      <plan.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-royal-blue mb-2 tracking-tight">{plan.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">{plan.priceText}</p>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-12 flex-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Feature set</p>
                     <ul className="space-y-4">
                       {plan.features.map((feature, i) => (
                         <li key={i} className="flex gap-3 text-xs font-bold text-slate-600">
                            <div className={cn(
                              "w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                              plan.id === 'Diamond' ? "bg-royal-blue/10 text-royal-blue" : (plan.id === 'Platinum' ? "bg-amber-100 text-amber-600" : "bg-royal-blue/5 text-royal-blue/40")
                            )}>
                               <Check size={12} />
                            </div>
                            {feature}
                         </li>
                       ))}
                     </ul>
                  </div>

                  <button
                    onClick={() => handleRequestPlan(plan)}
                    disabled={submitting !== null || success}
                    className={cn(
                      "w-full py-5 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group/btn overflow-hidden relative",
                      plan.id === 'Diamond' || plan.id === 'Platinum'
                        ? "bg-royal-blue text-white shadow-2xl shadow-royal-blue/40 hover:scale-[1.02] active:scale-[0.98]" 
                        : "bg-slate-50 text-royal-blue border border-slate-100 hover:bg-royal-blue hover:text-white"
                    )}
                  >
                    <span className="relative z-10">
                      {submitting === plan.id ? "Transmitting..." : "Request Plan"}
                    </span>
                    {submitting === plan.id ? (
                      <Loader2 className="animate-spin relative z-10" size={16} />
                    ) : (
                      <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Institutional Note */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 p-12 bg-royal-blue relative rounded-[60px] overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-royal-blue to-blue-900 opacity-50" />
            
            <div className="relative z-10 max-w-lg">
               <div className="flex items-center gap-3 text-blue-300 font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                  <Info size={16} />
                  Institutional Notice
               </div>
               <h4 className="text-3xl font-black text-white mb-4 tracking-tight">Manual Verification Protocol</h4>
               <p className="text-blue-200/80 font-bold leading-relaxed">
                  Inves4Business maintains an audited registry. All plan requests are subject 
                  to manual document verification by our compliance team before activation.
               </p>
            </div>
            
            <div className="relative z-10 shrink-0">
               <button 
                 onClick={() => navigate('/merchant/listings')}
                 className="px-12 py-6 bg-white text-royal-blue rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
               >
                 Start Listing Asset
               </button>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="py-20 border-t border-slate-50 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
           Secured Strategic Acquisitions • Inves4Business Platform
         </p>
      </footer>
    </div>
  );
};

export default Pricing;
