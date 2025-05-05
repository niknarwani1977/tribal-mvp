// src/pages/CreateEvent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const CreateEvent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState('none'); // repeat option state
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const datetime = Timestamp.fromDate(new Date(`${date}T${time}`));
      await addDoc(collection(db, 'events'), {
        title,
        datetime,
        location,
        repeat, // save repeat value
        createdAt: Timestamp.now(),
      });

      alert('Event created!');
      navigate('/calendar');
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fef9f4] px-4 py-8 flex justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#004b6e]">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          {/* Repeat dropdown */}
          <div>
            <label htmlFor="repeat" className="block mb-1 text-sm font-medium text-gray-700">Repeat</label>
            <select
              id="repeat"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004b6e] text-white py-2 rounded-md hover:bg-[#003b56]"
          >
            Save Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;



/*// src/pages/CreateEvent.tsx
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

export default CreateEvent; */
