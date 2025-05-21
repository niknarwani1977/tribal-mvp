// src/components/Navbar.tsx
// Bottom navigation bar with dynamic nav items and user menu for settings/logout

import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserCircle } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
}

interface NavbarProps {
  items: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({ items }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Track authenticated user
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  // Track unread notifications
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Query unread notifications (customize schema as needed)
        const notifQ = query(
          collection(db, 'notifications'),
          where('readBy', 'not-in', [user.uid])
        );
        const snap = await getDocs(notifQ);
        setHasNewNotifications(!snap.empty);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    })();
  }, [user, location]);

  // Build nav entries: login-only if unauthenticated
  const navEntries: NavItem[] = user
    ? items
    : [{ label: 'Login', path: '/login' }];

  // User menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-[#004b6e] fixed bottom-0 w-full z-50 flex justify-around items-center py-3 text-white text-xs sm:text-sm">
      {navEntries.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${isActive ? 'font-semibold' : ''} hover:text-gray-300`}
          >
            {item.label}
          </Link>
        );
      })}

      {/* Notifications link with badge */}
      {user && (
        <div className="relative">
          <Link
            to="/notifications"
            className={`${location.pathname === '/notifications' ? 'font-semibold' : ''} hover:text-gray-300`}
          >
            Notifications
          </Link>
          {hasNewNotifications && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          )}
        </div>
      )}

      {/* User menu icon and dropdown */}
      {user && (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(open => !open)}
            className="hover:text-gray-300"
          >
            <UserCircle className="w-6 h-6" />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full mb-2 right-0 w-40 bg-white text-black rounded shadow-lg overflow-hidden">
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <Link
                to="/terms"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Terms & Conditions
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
