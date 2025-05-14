// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarView from './CalendarView';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fef9f4] px-4 pt-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-[#004b6e] mb-4">
          Welcome to TribalConnect
        </h1>
        <p className="text-gray-700 mb-6">
          Your private circle for family coordination. Manage events, share calendars, and stay connected with trusted people.
        </p>
        <button
          onClick={() => navigate('/calendar')}
          className="mb-8 px-6 py-2 bg-[#004b6e] text-white rounded-md hover:bg-[#003b56]"
        >
          Go to Calendar
        </button>
      </div>

      {/* Embed calendar grid directly on home screen */}
      <div className="max-w-lg mx-auto">
        <CalendarView />
      </div>
    </div>
  );
};

export default HomePage;
