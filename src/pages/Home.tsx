import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedBusinesses } from '../services/firestore';
import type { BusinessListing } from '../types';
import BusinessCard from '../components/BusinessCard';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { Search, MapPin, Filter, ArrowRight, Briefcase, Globe, CircleDollarSign, IndianRupee } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const Home: React.FC = () => {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getApprovedBusinesses({ 
          country: countryFilter,
          category: categoryFilter,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          search: search,
          limitCount: 50 // Simple limit for performance
        });
        setListings(data);
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce effects
    const timer = setTimeout(() => {
       loadData();
    }, 400);

    return () => clearTimeout(timer);
  }, [countryFilter, categoryFilter, minPrice, maxPrice, search]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-royal-blue/5 rounded-l-[120px] skew-x-[-12deg] translate-x-32" />
        
        <div className="relative max-w-7xl mx-auto z-10 text-center lg:text-left grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-royal-blue/5 rounded-full text-royal-blue border border-royal-blue/10 mb-8">
              <span className="w-2 h-2 bg-royal-blue rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Acquisition Intelligence</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-royal-blue mb-8 leading-[0.9] tracking-tighter">
              Institutional <br />
              <span className="text-blue-500">Acquisition</span> Hub.
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-xl mb-12 font-medium leading-relaxed mx-auto lg:mx-0">
               Direct access to verified business assets across Tier-1 markets. 
               Powered by strategic transparency.
            </p>

            {/* Premium Multi-Filter Search */}
            <div className="max-w-4xl bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-royal-blue/10 p-2">
               <div className="flex flex-col md:flex-row items-center gap-2">
                  <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-slate-50">
                    <Search className="text-slate-300 mr-4 shrink-0" size={24} />
                    <input 
                      type="text" 
                      placeholder="Title or description keyword..."
                      className="w-full outline-none text-royal-blue font-bold placeholder:text-slate-300 bg-transparent text-lg"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "flex items-center gap-3 px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all",
                      showFilters ? "bg-royal-blue text-white" : "text-royal-blue bg-royal-blue/5 hover:bg-royal-blue/10"
                    )}
                  >
                    <Filter size={18} />
                    {showFilters ? "Hide Metrics" : "Advanced Metrics"}
                  </button>
               </div>

               {showFilters && (
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jurisdiction</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-royal-blue text-sm appearance-none"
                         value={countryFilter}
                         onChange={(e) => setCountryFilter(e.target.value)}
                       >
                         <option>All</option>
                         <option>UAE</option>
                         <option>Qatar</option>
                         <option>Singapore</option>
                         <option>Malaysia</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Class</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none font-bold text-royal-blue text-sm appearance-none"
                         value={categoryFilter}
                         onChange={(e) => setCategoryFilter(e.target.value)}
                       >
                         <option>All</option>
                        <option>Micro Business</option>
                        <option>Partnership Sale</option>
                        <option>Full Business Sale</option>
                        <option>Investment Opportunity</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capital Floor</label>
                       <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                          <input 
                            type="number" 
                            placeholder="Min Price"
                            className="w-full bg-slate-50 border border-slate-100 p-4 pl-10 rounded-2xl outline-none font-bold text-royal-blue text-sm"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capital Ceiling</label>
                       <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                          <input 
                            type="number" 
                            placeholder="Max Price"
                            className="w-full bg-slate-50 border border-slate-100 p-4 pl-10 rounded-2xl outline-none font-bold text-royal-blue text-sm"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                          />
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
          
          <div className="lg:col-span-2 hidden lg:block">
             <div className="p-12 bg-royal-blue rounded-[80px] rotate-6 shadow-[0_40px_80px_rgba(0,35,102,0.3)]">
                <div className="grid grid-cols-2 gap-6">
                   <div className="h-40 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10" />
                   <div className="h-40 bg-white/5 rounded-3xl mt-12" />
                   <div className="h-40 bg-white/20 rounded-3xl -mt-12" />
                   <div className="h-40 bg-white/10 rounded-3xl" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Filtration Results */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <header className="flex justify-between items-end mb-16 border-b border-slate-100 pb-10">
           <div>
              <h2 className="text-3xl font-black text-royal-blue tracking-tight mb-2">Authenticated Opportunities</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Audited Platform Assets • Global Connectivity</p>
           </div>
           <div className="text-[10px] font-black text-royal-blue uppercase tracking-widest px-4 py-2 bg-royal-blue/5 rounded-lg border border-royal-blue/10">
              Matches Found: {listings.length}
           </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-[40px] h-[480px] animate-pulse border border-slate-50" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {listings.map(biz => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
             <Globe className="mx-auto text-slate-200 mb-8" size={64} />
             <h3 className="text-3xl font-black text-royal-blue">No Strategy Matches</h3>
             <p className="text-slate-400 mt-4 font-bold max-w-sm mx-auto leading-relaxed">
               Lower your institutional parameters or reset the search metrics to explore broader assets.
             </p>
             <button 
               onClick={() => {
                 setSearch('');
                 setCountryFilter('All');
                 setCategoryFilter('All');
                 setMinPrice('');
                 setMaxPrice('');
               }}
               className="mt-10 px-10 py-5 bg-royal-blue text-white rounded-[24px] font-black shadow-2xl shadow-royal-blue/30 hover:scale-105 active:scale-95 transition-all"
             >
               Purge Filter Stack
             </button>
          </div>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1">
              <Logo className="h-8 mb-8" />
              <p className="text-slate-500 font-medium leading-relaxed">
                Empowering international business acquisitions with precision, 
                security, and high-tier institutional connections.
              </p>
            </div>
            {['Inves4Business', 'Service', 'Compliance'].map((cat, idx) => (
              <div key={cat}>
                <h4 className="font-black text-royal-blue mb-8 uppercase text-[10px] tracking-[0.3em]">{cat}</h4>
                <ul className="space-y-5 text-slate-400 font-bold text-sm">
                  {idx === 0 && ['About Platform', 'Network', 'Our Mission'].map(l => <li key={l} className="hover:text-royal-blue cursor-pointer transition-colors">{l}</li>)}
                  {idx === 1 && ['Pricing Tiers', 'Listing Guide', 'Institutional Access'].map(l => <li key={l} className="hover:text-royal-blue cursor-pointer transition-colors">{l}</li>)}
                  {idx === 2 && ['Security Protocol', 'Privacy Policy', 'Cookie Ledger'].map(l => <li key={l} className="hover:text-royal-blue cursor-pointer transition-colors">{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
            <div>© 2026 Inves4Business. All Rights Reserved.</div>
            <div className="flex gap-10">
              <span className="hover:text-royal-blue cursor-pointer">LinkedIN</span>
              <span className="hover:text-royal-blue cursor-pointer">Twitter (X)</span>
              <span className="hover:text-royal-blue cursor-pointer">Terminal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
