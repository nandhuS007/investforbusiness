import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBusiness, uploadFile } from '../services/firestore';
import Navbar from '../components/Navbar';
import { ChevronRight, ChevronLeft, Upload, Check, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { BusinessCategory } from '../types';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Headline and Category' },
  { id: 2, title: 'Details', description: 'Price and Operations' },
  { id: 3, title: 'Documents', description: 'Verification & Images' }
];

const AddListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Full Business' as BusinessCategory,
    price: 0,
    location: '',
    description: '',
    revenue: 0,
    profit: 0,
    yearsOfOperation: 1,
    images: [] as string[],
    documents: [] as string[]
  });

  const handleNext = () => {
    if (currentStep === 1 && (!formData.title || !formData.category)) {
      setError("Please fill in basic details.");
      return;
    }
    if (currentStep === 2 && (!formData.price || !formData.location)) {
      setError("Price and location are required.");
      return;
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createBusiness({
        ...formData,
        ownerId: user.uid,
      });
      alert("Business listing submitted successfully! It is now under review.");
      navigate('/seller');
    } catch (err: any) {
      setError(err.message || "Failed to submit listing.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'documents') => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadFile(file, `businesses/${Date.now()}_${file.name}`)
      );
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...urls]
      }));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-royal-blue transition-all duration-500 -z-10" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300",
                  currentStep >= step.id ? "bg-royal-blue text-white scale-110 shadow-lg" : "bg-white text-slate-400 border border-slate-200"
                )}
              >
                {currentStep > step.id ? <Check size={18} /> : step.id}
              </div>
              <p className={cn("mt-3 text-xs font-black uppercase tracking-widest", currentStep >= step.id ? "text-royal-blue" : "text-slate-400")}>
                {step.title}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-royal-blue">Basic Information</h2>
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Business Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Cafe for Sale in South Mumbai"
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-royal-blue transition-all font-bold text-royal-blue"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:bg-white focus:border-royal-blue transition-all font-bold text-royal-blue"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as BusinessCategory})}
                >
                  <option>Full Business</option>
                  <option>Partnership Sale</option>
                  <option>Micro Business</option>
                  <option>Investment</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-royal-blue">Financials & Logistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Asking Price (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-royal-blue"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="City, State"
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-royal-blue"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                <textarea 
                  rows={6}
                  placeholder="Provide a detailed overview of your business..."
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-medium text-slate-600"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-royal-blue">Media & Verification</h2>
              
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Upload Images (Max 5)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-royal-blue hover:bg-royal-blue/5 transition-all group">
                      <Upload size={24} className="text-slate-300 group-hover:text-royal-blue" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 group-hover:text-royal-blue">Add Photo</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'images')} />
                    </label>
                  )}
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                <h4 className="font-black text-royal-blue mb-2">Business Proof</h4>
                <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
                  Upload a Trade License, GST, or Incorporating Certificate. These documents are only visible to the Admin team for verification.
                </p>
                <label className="inline-flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-royal-blue hover:bg-slate-50 cursor-pointer shadow-sm">
                  <Upload size={18} />
                  Choose File
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'documents')} />
                </label>
                {formData.documents.length > 0 && <span className="ml-4 text-xs text-green-500 font-bold">✓ Document attached</span>}
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between gap-4">
            {currentStep > 1 && (
              <button 
                onClick={handlePrev}
                className="flex flex-1 items-center justify-center gap-2 py-5 rounded-2xl font-black text-royal-blue border border-royal-blue/20 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={20} />
                Previous Step
              </button>
            )}
            {currentStep < 3 ? (
              <button 
                onClick={handleNext}
                className="flex flex-1 items-center justify-center gap-2 py-5 rounded-2xl bg-royal-blue text-white font-black shadow-xl shadow-royal-blue/30 hover:bg-blue-800 transition-all ml-auto"
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 py-5 rounded-2xl bg-royal-blue text-white font-black shadow-xl shadow-royal-blue/30 hover:bg-blue-800 transition-all"
              >
                {loading ? "Submitting..." : "Submit Listing for Review"}
                {!loading && <Check size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddListing;
