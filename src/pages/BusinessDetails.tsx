import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getBusinessById, 
  sendEnquiry,
  isFavorite,
  toggleFavorite 
} from '../services/firestore';
import type { BusinessListing } from '../types';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  MapPin, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Share2, 
  Heart, 
  Crown, 
  Zap,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const BusinessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const data = await getBusinessById(id);
        setBusiness(data);
        if (user) {
          const fav = await isFavorite(id);
          setFavorited(fav);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id) return;
    try {
      const isFav = await toggleFavorite(id);
      setFavorited(isFav);
    } catch (error) {
      console.error("Favorite toggle failed:", error);
    }
  };

  const handleEnquiry = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/business/${id}` } } });
      return;
    }
    if (!business || !enquiryMsg.trim()) return;

    setSubmitting(true);
    try {
      await sendEnquiry(business, enquiryMsg);
      alert("Executive enquiry transmitted successfully. Await response within the Merchant Hub.");
      setEnquiryMsg('');
      navigate('/acquirer');
    } catch (error: any) {
      alert("Transmission failed. Reference: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-royal-blue border-t-transparent rounded-full animate-spin shadow-2xl"></div>
    </div>
  );

  if (!business) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-black text-royal-blue">Asset not found</h2>
      <Link to="/" className="mt-8 px-8 py-3 bg-royal-blue text-white rounded-2xl font-black hover:scale-105 transition-all">Return to Marketplace</Link>
    </div>
  );

  const currency = business.location.country === 'UAE' ? 'AED' : 
                   business.location.country === 'Singapore' ? 'SGD' : 
                   business.location.country === 'Malaysia' ? 'MYR' : 'USD';

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      <Navbar />

      {/* Hero Header Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Body */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="bg-royal-blue/5 text-royal-blue text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-royal-blue/10">
                  {business.category}
                </span>
                {business.planApproved && (
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl shadow-sm flex items-center gap-2",
                    business.planType === 'Platinum' ? "bg-amber-400 text-royal-blue" : 
                    business.planType === 'Intermediate' ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    {business.planType === 'Platinum' ? <Crown size={14} /> : 
                     business.planType === 'Intermediate' ? <Zap size={14} /> : <ShieldCheck size={14} />}
                    {business.planType} Verified
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-royal-blue mb-8 leading-[1.1] tracking-tighter">
                {business.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 text-slate-400 font-bold text-sm border-b border-slate-50 pb-10 mb-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-royal-blue/5 text-royal-blue rounded-xl">
                    <MapPin size={22} />
                  </div>
                  <span>{business.location.city}, {business.location.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-royal-blue/5 text-royal-blue rounded-xl">
                    <Calendar size={22} />
                  </div>
                  <span>Operational: {business.yearsOfOperation}+ Years</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#F9FAFB] p-8 rounded-[32px] border border-slate-50">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-2">Valuation</p>
                  <p className="text-2xl font-black text-royal-blue tracking-tighter">
                    {currency} {business.price.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#F9FAFB] p-8 rounded-[32px] border border-slate-50">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-2">Gross Revenue</p>
                  <p className="text-2xl font-black text-royal-blue tracking-tighter">
                    {currency} {business.revenue?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="bg-[#F9FAFB] p-8 rounded-[32px] border border-slate-50">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-2">Net Profit</p>
                  <p className="text-2xl font-black text-royal-blue tracking-tighter">
                    {currency} {business.profit?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* In-depth Asset Review */}
            <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black text-royal-blue mb-10 border-b border-slate-50 pb-6 uppercase tracking-widest text-[11px]">Comprehensive Assessment</h3>
              <div className="prose prose-slate max-w-none text-slate-600 font-bold leading-relaxed whitespace-pre-wrap text-lg">
                {business.description}
              </div>
            </div>

            {/* High-Resolution Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {business.images?.slice(0, 4).map((img, idx) => (
                <div key={idx} className="h-80 rounded-[48px] overflow-hidden border border-slate-100 shadow-xl group">
                  <img src={img} alt="Business Visualization" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
              )) || (
                <div className="col-span-full h-80 bg-slate-100 rounded-[48px] flex flex-col items-center justify-center text-slate-300 gap-4">
                  <ShieldCheck size={48} />
                  <p className="font-black uppercase tracking-[0.3em] text-[10px]">Media Vault Restricted</p>
                </div>
              )}
            </div>
          </div>

          {/* Institutional Enquiry Panel */}
          <div className="space-y-10">
            <div className="bg-royal-blue p-12 rounded-[48px] shadow-2xl shadow-royal-blue/30 text-white sticky top-10">
              <h3 className="text-3xl font-black mb-10 tracking-tight leading-none">Initiate <br /> Negotiation</h3>
              
              <div className="space-y-8 mb-12">
                <div className="flex gap-5">
                  <div className="bg-white/10 p-3.5 rounded-2xl h-fit border border-white/10">
                    <ShieldCheck size={28} className="text-blue-200" />
                  </div>
                  <div>
                    <h5 className="font-black text-blue-100 uppercase tracking-widest text-[10px] mb-1">Authenticated Asset</h5>
                    <p className="text-blue-200/80 text-xs font-bold leading-relaxed">This listing has completed institutional integrity verification.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <textarea 
                  placeholder="Outline your acquisition proposal or request for documents..."
                  className="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-white placeholder:text-blue-300/40 outline-none focus:bg-white/10 transition-all min-h-[180px] font-bold text-sm"
                  value={enquiryMsg}
                  onChange={(e) => setEnquiryMsg(e.target.value)}
                  disabled={submitting}
                />
                <button 
                  onClick={handleEnquiry}
                  disabled={submitting || !enquiryMsg.trim()}
                  className="w-full bg-white text-royal-blue py-6 rounded-[24px] font-black text-lg hover:bg-blue-50 shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <MessageSquare size={24} />}
                  {submitting ? "Transmitting..." : "Submit Interest"}
                </button>
              </div>

              <div className="mt-12 pt-10 border-t border-white/10 flex justify-center gap-12">
                <button className="flex flex-col items-center gap-3 text-blue-300 hover:text-white transition-all group">
                  <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Circulate</span>
                </button>
                <button 
                  onClick={handleFavorite}
                  className={cn(
                    "flex flex-col items-center gap-3 transition-all group",
                    favorited ? "text-red-400" : "text-blue-300 hover:text-white"
                  )}
                >
                  <Heart size={24} className={cn("transition-transform group-hover:scale-110", favorited && "fill-current")} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{favorited ? 'Whitelisted' : 'Whitelist'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-slate-100">
              <h4 className="font-black text-royal-blue mb-8 uppercase tracking-[0.3em] text-[10px]">Strategic Matches</h4>
              <div className="space-y-8">
                <div className="flex gap-5 items-center group cursor-pointer">
                  <div className="w-20 h-20 bg-royal-blue/5 rounded-3xl shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                     <Briefcase size={28} className="text-royal-blue/20" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-700 text-sm group-hover:text-royal-blue transition-colors leading-tight">Digital Infrastructure Hub in Singapore</h5>
                    <p className="text-royal-blue font-black text-xs mt-2 tracking-widest uppercase">SGD 2,500,000</p>
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
;
