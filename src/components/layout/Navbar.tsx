import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, Calendar, FileText, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive 
        ? 'text-primary-700 font-medium bg-primary-50' 
        : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-100'
    }`;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <Logo className="h-8 w-auto text-primary-600" />
              <span className="ml-2 text-xl font-display font-bold text-neutral-900">
                TribalConnect
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink to="/map" className={navLinkClasses}>
              <MapPin className="h-5 w-5" />
              <span>Map</span>
            </NavLink>
            
            {currentUser ? (
              <>
                <NavLink to="/events" className={navLinkClasses}>
                  <Calendar className="h-5 w-5" />
                  <span>Events</span>
                </NavLink>
                <NavLink to="/resources" className={navLinkClasses}>
                  <FileText className="h-5 w-5" />
                  <span>Resources</span>
                </NavLink>
                <NavLink to="/profile" className={navLinkClasses}>
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </NavLink>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-neutral-700 hover:text-primary-600 hover:bg-neutral-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline">Log In</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 px-4 sm:px-3">
          <NavLink to="/map" className={navLinkClasses} onClick={closeMenu}>
            <MapPin className="h-5 w-5" />
            <span>Map</span>
          </NavLink>
          
          {currentUser ? (
            <>
              <NavLink to="/events" className={navLinkClasses} onClick={closeMenu}>
                <Calendar className="h-5 w-5" />
                <span>Events</span>
              </NavLink>
              <NavLink to="/resources" className={navLinkClasses} onClick={closeMenu}>
                <FileText className="h-5 w-5" />
                <span>Resources</span>
              </NavLink>
              <NavLink to="/profile" className={navLinkClasses} onClick={closeMenu}>
                <User className="h-5 w-5" />
                <span>Profile</span>
              </NavLink>
              <button 
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-neutral-700 hover:text-primary-600 hover:bg-neutral-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/login" className="btn-outline w-full" onClick={closeMenu}>
                Log In
              </Link>
              <Link to="/register" className="btn-primary w-full" onClick={closeMenu}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;