import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, ShieldCheck, Zap, Crown, ArrowUpRight, Heart } from 'lucide-react';
import type { BusinessListing } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { isFavorite, toggleFavorite } from '../services/firestore';
import { useState, useEffect } from 'react';

interface BusinessCardProps {
  business: BusinessListing;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const isPlatinum = business.planType === 'Platinum';
  const currency = business.location.country === 'UAE' ? 'AED' : 
                   business.location.country === 'Singapore' ? 'SGD' : 
                   business.location.country === 'Malaysia' ? 'MYR' : 'USD';

  useEffect(() => {
    const checkFav = async () => {
      if (user) {
        const fav = await isFavorite(business.id);
        setFavorited(fav);
      }
    };
    checkFav();
  }, [user, business.id]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const isFav = await toggleFavorite(business.id);
    setFavorited(isFav);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group bg-white rounded-[40px] overflow-hidden border transition-all duration-500 flex flex-col h-full relative",
        isPlatinum ? "border-amber-200/50 shadow-2xl shadow-amber-400/5" : "border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-royal-blue/10"
      )}
    >
      {/* Visual Asset Layer */}
      <div className="relative h-64 overflow-hidden shrink-0">
        <img 
          src={business.images?.[0] || `https://picsum.photos/seed/${business.id}/800/600`} 
          alt={business.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Superior Status Overlays */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-3 z-10">
          <span className="bg-white/95 backdrop-blur-md text-royal-blue text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-lg border border-white/20">
            {business.category}
          </span>
          {isPlatinum && (
            <span className="bg-amber-400 text-royal-blue text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Crown size={12} strokeWidth={3} />
              Featured
            </span>
          )}
        </div>

        {/* Favorite Toggle */}
        {user && (
          <button 
            onClick={handleFavorite}
            className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 transition-all shadow-lg border border-white/20"
          >
            <Heart size={18} className={cn(favorited && "fill-red-400 text-red-400")} />
          </button>
        )}

        {/* Action Projection */}
        <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Institutional Profile Content */}
      <div className="p-10 flex flex-col flex-1">
        <div className="flex flex-col mb-6">
          <h3 className="text-2xl font-black text-royal-blue leading-[1.1] line-clamp-2 group-hover:text-blue-700 transition-colors tracking-tighter mb-4">
            {business.title}
          </h3>
          
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-black uppercase tracking-widest mb-4">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <MapPin size={14} className="text-royal-blue/40" />
            </div>
            {business.location.city}, {business.location.country}
          </div>

          <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        </div>

        <div className="mt-auto border-t border-slate-50 pt-8 flex items-end justify-between">
          <div>
            <p className="text-slate-300 text-[9px] uppercase font-black tracking-[0.3em] mb-2">Institutional Value</p>
            <p className="text-3xl font-black text-royal-blue tracking-tighter leading-none">
              <span className="text-[0.6em] text-slate-400 mr-1 font-bold">{currency}</span>
              {business.price.toLocaleString()}
            </p>
          </div>
          
          <Link 
            to={`/business/${business.id}`}
            className="group/btn flex items-center gap-3 px-8 h-14 rounded-3xl bg-royal-blue text-white shadow-2xl shadow-royal-blue/30 hover:bg-blue-800 hover:scale-105 transition-all duration-300"
          >
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">View Details</span>
            <ArrowUpRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Platinum Accent */}
      {isPlatinum && (
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
           <div className="absolute top-0 right-0 w-[200%] h-1 bg-gradient-to-l from-amber-400 to-transparent rotate-45 translate-x-1/2" />
        </div>
      )}
    </motion.div>
  );
};

export default BusinessCard;
