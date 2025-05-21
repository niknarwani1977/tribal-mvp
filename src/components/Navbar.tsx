// src/components/Navbar.tsx
// Bottom navigation bar that dynamically shows nav items based on authentication state

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface NavItem {
  label: string;
  path: string;
}

interface NavbarProps {
  // Primary nav items to show when signed in
  items: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({ items }) => {
  const location = useLocation();

  // Track authentication state
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Track unread notifications for the notifications badge
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        // Query unread notifications where 'readBy' does not include this user
        const notifQ = query(
          collection(db, 'notifications'),
          where('readBy', 'not-in', [user.uid])
        );
        const snap = await getDocs(notifQ);
        setHasNewNotifications(!snap.empty);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, [user, location]);

  // Build the list of nav entries: if not signed in, only show Login
  const navEntries: NavItem[] = user
    ? items
    : [{ label: 'Login', path: '/login' }];

  return (
    <nav className="bg-[#004b6e] fixed bottom-0 w-full z-50 flex justify-around py-3 text-white text-xs sm:text-sm">
      {navEntries.map((item) => {
        const isActive = location.pathname === item.path;
        const baseClasses = 'hover:text-gray-300';
        const activeClasses = isActive ? 'font-semibold' : '';

        // Handle notifications entry separately to show badge
        if (item.path === '/notifications') {
          return (
            <div key={item.path} className="relative">
              <Link to={item.path} className={`${baseClasses} ${activeClasses}`}> 
                {item.label}
              </Link>
              {hasNewNotifications && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${baseClasses} ${activeClasses}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
