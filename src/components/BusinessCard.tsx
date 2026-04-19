import React from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, MapPin, Briefcase, Star, ArrowRight } from 'lucide-react';
import type { BusinessListing } from '../types';
import { cn } from '../lib/utils';

interface BusinessCardProps {
  business: BusinessListing;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-500 flex flex-col h-full">
      {/* Image & Category */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={business.images?.[0] || `https://picsum.photos/seed/${business.title}/800/600`} 
          alt={business.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-royal-blue text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {business.category}
          </span>
          {business.isFeatured && (
            <span className="bg-amber-400 text-royal-blue text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Star size={10} fill="currentColor" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-royal-blue leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
            {business.title}
          </h3>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-slate-500 text-sm">
            <MapPin size={14} className="mr-1.5 text-royal-blue" />
            {business.location}
          </div>
          <div className="flex items-center text-slate-500 text-sm">
            <Briefcase size={14} className="mr-1.5 text-royal-blue" />
            {business.category}
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-0.5">Asking Price</p>
            <p className="text-2xl font-extrabold text-royal-blue flex items-center">
              <IndianRupee size={20} className="mr-0.5" />
              {business.price.toLocaleString('en-IN')}
            </p>
          </div>
          
          <Link 
            to={`/business/${business.id}`}
            className="bg-royal-blue text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-800 transition-all group/btn shadow-lg shadow-royal-blue/20"
          >
            <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
