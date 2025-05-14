// src/pages/CreateEvent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateEvent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just log the new event
    console.log({ title, date });
    alert('Event created (dummy logic)');
    navigate('/calendar');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4 text-[#004b6e]">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700">Event Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#004b6e] text-white rounded-md hover:bg-[#003b56]"
        >
          Save Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent; 
