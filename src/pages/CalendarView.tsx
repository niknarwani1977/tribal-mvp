// src/pages/CalendarView.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Dummy data for now – replace with actual events from Firestore later
const sampleEvents = [
  { id: '1', title: 'Soccer Practice', date: '2025-05-06' },
  { id: '2', title: 'Parent-Teacher Meeting', date: '2025-05-07' },
  { id: '3', title: 'Birthday Party', date: '2025-05-08' },
];

const CalendarView: React.FC = () => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/edit-event/${id}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-[#004b6e]">Upcoming Events</h2>
      <div className="space-y-3">
        {sampleEvents.map((event) => (
          <div
            key={event.id}
            className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="text-gray-800 font-medium">{event.title}</p>
              <p className="text-gray-500 text-sm">{event.date}</p>
            </div>
            <button
              onClick={() => handleEdit(event.id)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
