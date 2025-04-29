// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#004b6e] fixed bottom-0 w-full z-50 flex justify-around py-3 text-white text-xs sm:text-sm">
      <Link to="/login" className="hover:text-gray-300">Login</Link>
      <Link to="/invite" className="hover:text-gray-300">Invite</Link>
      <Link to="/circles" className="hover:text-gray-300">Circles</Link>
      <Link to="/calendar" className="hover:text-gray-300">Calendar</Link>
      <Link to="/create-event" className="hover:text-gray-300">Create Event</Link>
      <Link to="/notifications" className="hover:text-gray-300">Notifications</Link>
    </nav>
  );
};

export default Navbar;
