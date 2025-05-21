// src/components/Navbar.tsx
// Bottom navigation bar component that renders dynamic nav items
// and conditionally shows a notification badge on the "Notifications" link.

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Define what a navigation item looks like
interface NavItem {
  label: string;
  path: string;
}

interface NavbarProps {
  items: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({ items }) => {
  const location = useLocation(); // Track current route for active styles
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    // Check for unread notifications whenever the route changes
    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Assume notifications are stored with a circleId field
        // This logic can be customized based on your schema
        // For simplicity, query all notifications for the user
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
  }, [location]);

  return (
    <nav className="bg-[#004b6e] fixed bottom-0 w-full z-50 flex justify-around py-3 text-white text-xs sm:text-sm">
      {items.map(item => {
        const isActive = location.pathname === item.path;
        const baseClasses = 'hover:text-gray-300';
        const activeClasses = isActive ? 'font-semibold' : '';

        // For the Notifications link, show a badge if unread
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
