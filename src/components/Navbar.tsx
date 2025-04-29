// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-[#004b6e] fixed bottom-0 w-full z-50 flex justify-around py-3 text-white">
      <Link to="/login" className="hover:text-gray-300 text-sm">
        Login
      </Link>
      <Link to="/invite" className="hover:text-gray-300 text-sm">
        Invite
      </Link>
      <Link to="/circles" className="hover:text-gray-300 text-sm">
        Circles
      </Link>
      <Link to="/calendar" className="hover:text-gray-300 text-sm">
        Calendar
      </Link>
    </nav>
  );
};

export default Navbar;
