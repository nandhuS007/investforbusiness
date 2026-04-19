import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedBusinesses } from '../services/firestore';
import type { BusinessListing } from '../types';
import BusinessCard from '../components/BusinessCard';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { Search, MapPin, Filter, ArrowRight, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getApprovedBusinesses();
        setListings(data);
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredListings = listings.filter(biz => 
    (biz.title.toLowerCase().includes(search.toLowerCase()) || biz.category.toLowerCase().includes(search.toLowerCase())) &&
    biz.location.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-royal-blue pt-20 pb-40 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 skew-x-[-20deg] translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative max-w-6xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              India's Premier <span className="text-blue-300 italic font-serif">Business</span> <br /> 
              Marketplace
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium opacity-90">
              The trusted platform for buying and selling businesses. Connect with institutional investors and ambitious entrepreneurs.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-4xl mx-auto p-2 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row gap-2 bg-white rounded-2xl p-2">
              <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="text-slate-400 mr-3 shrink-0" size={20} />
                <input 
                  type="text" 
                  placeholder="What are you looking for?"
                  className="w-full outline-none text-slate-700 font-medium placeholder:text-slate-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-3">
                <MapPin className="text-slate-400 mr-3 shrink-0" size={20} />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Mumbai)"
                  className="w-full outline-none text-slate-700 font-medium placeholder:text-slate-400"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button className="bg-royal-blue text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all active:scale-95 shadow-xl shadow-royal-blue/30">
                Find Opportunities
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-royal-blue mb-4">
              Featured Opportunities
            </h2>
            <div className="w-20 h-1.5 bg-blue-500 rounded-full" />
          </div>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:border-royal-blue hover:text-royal-blue transition-all">
              <Filter size={18} />
              Filter
            </button>
            <span className="bg-slate-100 text-slate-500 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center">
              {filteredListings.length} results
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.length > 0 ? (
              filteredListings.map(biz => (
                <BusinessCard key={biz.id} business={biz} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <Search className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-600">No matching business found</h3>
                <p className="text-slate-400 mt-2">Try adjusting your search criteria or location</p>
                <button 
                  onClick={() => {setSearch(''); setLocation('');}}
                  className="mt-6 text-royal-blue font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* CTA Section */}
        <section className="mt-32 relative rounded-[40px] bg-royal-blue px-8 py-16 md:p-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-400/10 blur-[100px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Ready to sell your business?
              </h2>
              <p className="text-blue-100 text-lg mb-10 opacity-80 leading-relaxed max-w-xl">
                Join thousands of entrepreneurs who have successfully exited through our platform. No hidden fees, just expert connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="bg-white text-royal-blue px-10 py-5 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl">
                  Get Started Now
                </button>
                <button className="bg-transparent text-white border-2 border-white/20 px-10 py-5 rounded-2xl font-bold hover:bg-white/5 transition-all">
                  View Pricing
                </button>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <div className="text-4xl font-black text-white mb-2">5k+</div>
                <div className="text-blue-200 font-bold uppercase tracking-widest text-xs">Businesses Sold</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-8">
                <div className="text-4xl font-black text-white mb-2">10k+</div>
                <div className="text-blue-200 font-bold uppercase tracking-widest text-xs">Verified Buyers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <div className="text-4xl font-black text-white mb-2">₹500Cr+</div>
                <div className="text-blue-200 font-bold uppercase tracking-widest text-xs">Transaction Value</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-8">
                <div className="text-4xl font-black text-white mb-2">4.9/5</div>
                <div className="text-blue-200 font-bold uppercase tracking-widest text-xs">Seller Rating</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="inline-block group mb-6">
                <Logo />
              </Link>
              <p className="text-slate-500 leading-relaxed font-medium">
                India's most trusted marketplace for business acquisitions, institutional investment, and startup exits.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-royal-blue mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-slate-600 font-medium">
                <li><Link to="/about" className="hover:text-royal-blue transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-royal-blue transition-colors">Careers</Link></li>
                <li><Link to="/press" className="hover:text-royal-blue transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-royal-blue mb-6 uppercase tracking-widest text-xs">Sell</h4>
              <ul className="space-y-4 text-slate-600 font-medium">
                <li><Link to="/pricing" className="hover:text-royal-blue transition-colors">Pricing</Link></li>
                <li><Link to="/register" className="hover:text-royal-blue transition-colors">Become a Seller</Link></li>
                <li><Link to="/how-it-works" className="hover:text-royal-blue transition-colors">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-royal-blue mb-6 uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-4 text-slate-600 font-medium">
                <li><Link to="/terms" className="hover:text-royal-blue transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-royal-blue transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-royal-blue transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-bold tracking-tight">
            <div>© 2026 Invest 4 Business. All rights reserved.</div>
            <div className="flex gap-8 uppercase tracking-[0.2em] text-xs">
              <a href="#" className="hover:text-royal-blue transition-colors">Twitter</a>
              <a href="#" className="hover:text-royal-blue transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-royal-blue transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
