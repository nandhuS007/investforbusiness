import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBusinessById } from '../services/firestore';
import type { BusinessListing } from '../types';
import Navbar from '../components/Navbar';
import { IndianRupee, MapPin, Briefcase, Calendar, TrendingUp, Users, MessageSquare, ShieldCheck, Share2, Heart } from 'lucide-react';
import { motion } from 'motion/react';

const BusinessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const data = await getBusinessById(id);
        setBusiness(data);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!business) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-royal-blue">Business not found</h2>
      <Link to="/" className="mt-4 text-blue-500 font-bold hover:underline">Return to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      {/* Header / Gallery Part */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-blue-50 text-royal-blue text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  {business.category}
                </span>
                {business.isFeatured && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Featured Opportunity
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-royal-blue mb-6 leading-tight">
                {business.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold text-sm border-b border-slate-100 pb-8 mb-8">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-royal-blue" />
                  {business.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-royal-blue" />
                  Est. {business.yearsOfOperation}+ years
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Asking Price</p>
                  <p className="text-xl font-black text-royal-blue flex items-center">
                    <IndianRupee size={18} /> {business.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Revenue</p>
                  <p className="text-xl font-black text-royal-blue flex items-center">
                    <IndianRupee size={18} /> {business.revenue?.toLocaleString('en-IN') || 'Verifying'}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">EBITDA/Profit</p>
                  <p className="text-xl font-black text-royal-blue flex items-center">
                    <IndianRupee size={18} /> {business.profit?.toLocaleString('en-IN') || 'Verifying'}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Category</p>
                  <p className="text-xl font-black text-royal-blue">{business.category.split(' ')[0]}</p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black text-royal-blue mb-8">Business Summary</h3>
              <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                {business.description}
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              {business.images?.slice(0, 4).map((img, idx) => (
                <div key={idx} className="h-64 rounded-[32px] overflow-hidden">
                  <img src={img} alt="Business" className="w-full h-full object-cover shadow-inner" referrerPolicy="no-referrer" />
                </div>
              )) || (
                <div className="col-span-full h-64 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">
                  No images uploaded
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Contact */}
          <div className="space-y-8">
            <div className="bg-royal-blue p-10 rounded-[40px] shadow-2xl shadow-royal-blue/30 text-white sticky top-28">
              <h3 className="text-2xl font-black mb-8">Express Interest</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <ShieldCheck size={24} className="text-blue-200" />
                  </div>
                  <div>
                    <h5 className="font-bold">Verified Listing</h5>
                    <p className="text-blue-200 text-xs mt-1">Our team has pre-verified the basic documents of this business.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <textarea 
                  placeholder="Tell the seller about your interest..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder:text-blue-300/50 outline-none focus:bg-white/20 transition-all min-h-[120px]"
                />
                <button className="w-full bg-white text-royal-blue py-5 rounded-2xl font-black text-lg hover:scale-[1.02] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <MessageSquare size={20} />
                  Send Enquiry
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 flex justify-center gap-8">
                <button className="flex flex-col items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Share</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <Heart size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Favorite</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100">
              <h4 className="font-black text-royal-blue mb-4 uppercase tracking-widest text-xs">Similar Opportunities</h4>
              <div className="space-y-6">
                <div className="flex gap-4 items-center group cursor-pointer">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-700 text-sm group-hover:text-royal-blue transition-colors">Digital Marketing Agency in Bangalore</h5>
                    <p className="text-royal-blue font-black text-xs mt-1">₹45,00,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
