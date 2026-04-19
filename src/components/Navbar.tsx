import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { user, isAdmin, isSeller } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className={cn(
  "sticky top-0 z-50 transition-all duration-300",
  "bg-royal-blue border-b border-white/10 shadow-lg"
)}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-20">
      <div className="flex items-center">
        <Link to="/" className="flex items-center group py-2">
          <Logo isWhite />
        </Link>
        
        <div className="hidden md:ml-10 md:flex md:space-x-8">
          <Link to="/" className="text-blue-100 hover:text-white font-medium transition-colors">Home</Link>
          <Link to="/about" className="text-blue-100 hover:text-white font-medium transition-colors">How it works</Link>
          <Link to="/pricing" className="text-blue-100 hover:text-white font-medium transition-colors">Pricing</Link>
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <Link 
              to={isAdmin ? '/admin' : (isSeller ? '/seller' : '/profile')}
              className="flex items-center gap-2 text-blue-100 hover:text-white font-semibold transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white overflow-hidden shadow-inner border border-white/20">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <span>{user.name.split(' ')[0]}</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 text-blue-300 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            {isSeller && (
              <Link 
                to="/seller/add-listing"
                className="bg-white text-royal-blue px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                Post a Business
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login" className="px-6 py-2.5 text-white font-bold hover:bg-white/10 rounded-xl transition-all">
              Login
            </Link>
            <Link to="/register" className="bg-white text-royal-blue px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg">
              Join as Seller
            </Link>
          </div>
        )}
      </div>

      <div className="md:hidden flex items-center">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </div>
  </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-50 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" className="block px-3 py-4 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Home</Link>
            <Link to="/pricing" className="block px-3 py-4 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Pricing</Link>
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-4 text-base font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Profile</Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 space-y-2">
                <Link to="/login" className="block text-center w-full py-4 text-royal-blue font-bold border border-royal-blue rounded-xl">Login</Link>
                <Link to="/register" className="block text-center w-full py-4 bg-royal-blue text-white font-bold rounded-xl shadow-lg">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
