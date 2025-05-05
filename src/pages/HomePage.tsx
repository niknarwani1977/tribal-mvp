// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#fef9f4] px-4">
      <h1 className="text-4xl font-bold text-[#004b6e] mb-4">Welcome to TribalConnect</h1>
      <p className="text-gray-700 text-center mb-6 max-w-md">
        Your private circle for family coordination. Manage events, share calendars, and stay connected with trusted people.
      </p>
      <button
        onClick={() => navigate('/calendar')}
        className="px-6 py-2 bg-[#004b6e] text-white rounded-md hover:bg-[#003b56]"
      >
        Go to Calendar
      </button>
    </div>
  );
};

export default HomePage;
