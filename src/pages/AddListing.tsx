import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useListingStore } from '../store/listingStore';
import { createBusinessWithPlan, uploadFile } from '../services/firestore';
import Navbar from '../components/Navbar';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Check, 
  AlertCircle, 
  Globe, 
  IndianRupee, 
  FileText, 
  Crown,
  ShieldCheck,
  Star,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BusinessCategory, MembershipPlan } from '../types';

const steps = [
  { id: 1, title: 'Basics', description: 'Entity & Location' },
  { id: 2, title: 'Details', description: 'Financial Snapshot' },
  { id: 3, title: 'Verification', description: 'Proof & Assets' },
  { id: 4, title: 'Visibility', description: 'Membership Plan' }
];

const plans: { id: MembershipPlan, name: string, price: string, features: string[], color: string, icon: any }[] = [
  { 
    id: 'Basic', 
    name: 'Basic', 
    price: 'Standard Access', 
    features: ['Standard listing', 'Acquirer enquiries', 'Email support', 'Merchant dashboard'],
    color: 'bg-slate-50 border-slate-200 text-slate-400',
    icon: ShieldCheck
  },
  { 
    id: 'Intermediate', 
    name: 'Intermediate', 
    price: 'Growth Focus', 
    features: ['Enhanced visibility', 'Featured badge', 'Priority support', 'Historical data insights'],
    color: 'bg-blue-50 border-blue-200 text-royal-blue',
    icon: Zap
  },
  { 
    id: 'Platinum', 
    name: 'Platinum', 
    price: 'Institutional Tier', 
    features: ['TOP of search results', 'Platinum badge', 'Dedicated manager', 'Institutional reach', 'Unlimited listings'],
    color: 'bg-amber-400 border-amber-500 text-royal-blue',
    icon: Crown
  }
];

const AddListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { form, currentStep, nextStep, prevStep, updateForm, resetForm } = useListingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateStep = () => {
    switch(currentStep) {
      case 1:
        if (!form.title || !form.location.city) return "Title and City are required.";
        break;
      case 2:
        if (!form.description || form.price <= 0) return "Valid description and asking price are required.";
        break;
      case 3:
        if (form.documents.length === 0) return "Please upload at least one verification document.";
        break;
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    nextStep();
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createBusinessWithPlan(
        {
          title: form.title,
          category: form.category,
          price: Number(form.price),
          location: form.location,
          description: form.description,
          revenue: Number(form.revenue || 0),
          profit: Number(form.profit || 0),
          yearsOfOperation: Number(form.yearsOfOperation || 1),
          images: form.images,
          documents: form.documents,
          ownerId: user.uid,
          planType: form.planType
        },
        form.planType
      );
      alert("Business and Plan request submitted! Admin will review shortly.");
      resetForm();
      navigate('/merchant/listings');
    } catch (err: any) {
      setError(err.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'documents') => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map(file => uploadFile(file, `v2/${type}/${Date.now()}_${file.name}`))
      );
      updateForm({ [type]: [...(form[type as keyof typeof form] as string[]), ...urls] });
    } catch (err) {
      setError("File upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-corporate-gray/30 min-h-full rounded-[48px] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Modern Stepper */}
        <div className="grid grid-cols-4 gap-4 mb-16">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <div 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  currentStep >= step.id ? "bg-royal-blue shadow-[0_0_10px_rgba(0,35,102,0.3)]" : "bg-slate-200"
                )}
              />
              <div className="mt-4 hidden md:block">
                <p className={cn("text-[10px] font-black uppercase tracking-widest", currentStep >= step.id ? "text-royal-blue" : "text-slate-400")}>
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[48px] shadow-2xl shadow-royal-blue/5 p-8 md:p-16 border border-slate-100">
          {error && (
            <div className="mb-10 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 font-bold text-sm">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <header>
                <h1 className="text-4xl font-black text-royal-blue mb-2 tracking-tight">Basic Information</h1>
                <p className="text-slate-500 font-medium">Tell us what you're listing and where it's located.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entity Name / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Modern Tech Startup with Patent"
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-royal-blue/5 focus:border-royal-blue transition-all font-bold text-royal-blue"
                    value={form.title}
                    onChange={(e) => updateForm({ title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Classification</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-royal-blue transition-all font-bold text-royal-blue appearance-none"
                    value={form.category}
                    onChange={(e) => updateForm({ category: e.target.value as BusinessCategory })}
                  >
                    <option>Micro Business</option>
                    <option>Full Business Sale</option>
                    <option>Partnership Sale</option>
                    <option>Investment Opportunity</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl outline-none focus:bg-white focus:border-royal-blue transition-all font-bold text-royal-blue appearance-none"
                      value={form.location.country}
                      onChange={(e) => updateForm({ location: { ...form.location, country: e.target.value as any } })}
                    >
                      <option>UAE</option>
                      <option>Qatar</option>
                      <option>Singapore</option>
                      <option>Malaysia</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dubai, Doha, etc."
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-royal-blue transition-all font-bold text-royal-blue"
                    value={form.location.city}
                    onChange={(e) => updateForm({ location: { ...form.location, city: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <header>
                <h1 className="text-4xl font-black text-royal-blue mb-2 tracking-tight">Financial Profile</h1>
                <p className="text-slate-500 font-medium">Highlight the performance metrics of your business.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asking Price (AED/USD Equivalent)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-royal-blue"
                    value={form.price}
                    onChange={(e) => updateForm({ price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Years Established</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-royal-blue"
                    value={form.yearsOfOperation}
                    onChange={(e) => updateForm({ yearsOfOperation: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Annual Revenue (Optional)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-slate-600"
                    value={form.revenue}
                    onChange={(e) => updateForm({ revenue: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Annual Net Profit (Optional)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-slate-600"
                    value={form.profit}
                    onChange={(e) => updateForm({ profit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Business Description</label>
                <textarea 
                  rows={8}
                  placeholder="Deep dive into the operations, assets, and growth potential..."
                  className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl outline-none focus:bg-white focus:border-royal-blue transition-all font-medium text-slate-600 leading-relaxed"
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <header>
                <h1 className="text-4xl font-black text-royal-blue mb-2 tracking-tight">Verification Assets</h1>
                <p className="text-slate-500 font-medium">Upload proof to build trust with high-net-worth buyers.</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="p-10 rounded-[40px] bg-slate-50 border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-royal-blue shadow-sm mb-6">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-black text-royal-blue mb-2">Institutional Proof</h3>
                  <p className="text-xs text-slate-400 mb-8 font-medium leading-relaxed">
                    Upload your Trade License, GST, or Incorporating Certificate. (Visible only to Admins)
                  </p>
                  <label className="inline-flex items-center gap-3 bg-royal-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 cursor-pointer shadow-lg transition-all active:scale-95">
                    <Upload size={20} />
                    Upload Documents
                    <input type="file" multiple className="hidden" onChange={(e) => onFileUpload(e, 'documents')} />
                  </label>
                  {form.documents.length > 0 && (
                    <div className="mt-4 text-xs font-black text-green-500 uppercase flex items-center gap-1">
                      <Check size={14} /> {form.documents.length} File(s) attached
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-royal-blue">Marketing Gallery</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-inner border border-slate-100 group relative">
                        <img src={img} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                    ))}
                    {form.images.length < 6 && (
                      <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-royal-blue hover:bg-royal-blue/5 transition-all group">
                        <Upload size={24} className="text-slate-300 group-hover:text-royal-blue" />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, 'images')} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <header className="text-center max-w-2xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-royal-blue/5 text-royal-blue rounded-full text-[9px] font-black uppercase tracking-widest mb-6 border border-royal-blue/10"
                >
                  <Star size={10} className="fill-current" />
                  Strategic Presence Selection
                </motion.div>
                <h1 className="text-4xl font-black text-royal-blue mb-4 tracking-tight">Institutional Tiers</h1>
                <p className="text-slate-500 font-medium">Select a membership level to determine your listing's priority and global reach within our acquisition network.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => updateForm({ planType: plan.id })}
                    className={cn(
                      "p-10 rounded-[48px] border-2 transition-all flex flex-col items-center text-center relative overflow-hidden group",
                      form.planType === plan.id 
                        ? plan.id === 'Platinum' 
                          ? "bg-white border-amber-400 shadow-[0_40px_80px_rgba(251,191,36,0.1)] scale-105"
                          : "bg-white border-royal-blue shadow-2xl shadow-royal-blue/10 scale-105" 
                        : "bg-slate-50 border-transparent hover:border-slate-200 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    )}
                  >
                    {plan.id === 'Platinum' && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-amber-400" />
                    )}
                    
                    {form.planType === plan.id && (
                      <div className={cn(
                        "absolute top-6 right-6",
                        plan.id === 'Platinum' ? "text-amber-500" : "text-royal-blue"
                      )}>
                        <Check size={24} className="animate-in zoom-in duration-300" />
                      </div>
                    )}
                    
                    <div className={cn("w-20 h-20 rounded-[28px] flex items-center justify-center mb-8 shadow-xl transition-transform group-hover:scale-110", plan.color)}>
                      <plan.icon size={36} />
                    </div>

                    <h3 className="text-2xl font-black text-royal-blue mb-1">{plan.name}</h3>
                    <div className={cn(
                      "font-black text-[10px] uppercase tracking-[0.2em] mb-8",
                      plan.id === 'Platinum' ? "text-amber-600" : "text-royal-blue/60"
                    )}>
                      {plan.price}
                    </div>

                    <ul className="space-y-4 w-full text-left mb-2 border-t border-slate-100 pt-8">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-500">
                          <Check size={14} className={cn("shrink-0", plan.id === 'Platinum' ? "text-amber-500" : "text-green-500")} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 flex justify-between gap-6">
            {currentStep > 1 && (
              <button 
                onClick={prevStep}
                className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-royal-blue border border-royal-blue/10 hover:bg-slate-50 transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
                Back
              </button>
            )}
            {currentStep < 4 ? (
              <button 
                onClick={handleNext}
                className="flex flex-1 items-center justify-center gap-3 py-6 rounded-2xl bg-royal-blue text-white font-black shadow-2xl shadow-royal-blue/30 hover:bg-blue-800 transition-all ml-auto hover:translate-x-2 active:scale-[0.98]"
              >
                Save & Continue
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-3 py-6 rounded-2xl bg-royal-blue text-white font-black shadow-2xl shadow-royal-blue/30 hover:bg-blue-800 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Finish & Request Launch"}
                {!loading && <Crown size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
