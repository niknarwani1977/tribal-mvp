// src/components/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const Navbar: React.FC = () => {
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const location = useLocation(); // Track current route

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Fetch user's Circle ID
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const circleId = userData.circleId;

          if (!circleId) return;

          // Query for notifications related to user's Circle
          const q = query(collection(db, "notifications"), where("circleId", "==", circleId));
          const querySnapshot = await getDocs(q);

          // Check if there are any notifications not yet read by this user
          let newNotifications = false;
          querySnapshot.forEach((doc) => {
            const notifData = doc.data();
            if (!notifData.readBy || !notifData.readBy.includes(user.uid)) {
              newNotifications = true;
            }
          });

          setHasNewNotifications(newNotifications);
        }
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };

    fetchNotifications();
  }, [location]); // Re-run check whenever location changes

  return (
    <nav className="bg-[#004b6e] fixed bottom-0 w-full z-50 flex justify-around py-3 text-white text-xs sm:text-sm">
      <Link to="/login" className="hover:text-gray-300">Login</Link>
      <Link to="/invite" className="hover:text-gray-300">Invite</Link>
      <Link to="/circles" className="hover:text-gray-300">Circles</Link>
      <Link to="/calendar" className="hover:text-gray-300">Calendar</Link>
      <Link to="/create-event" className="hover:text-gray-300">Create Event</Link>

      {/* Notifications Link with Red Dot if needed */}
      <Link to="/notifications" className="relative hover:text-gray-300">
        Notifications
        {hasNewNotifications && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </Link>
    </nav>
  );
};

export default Navbar;
