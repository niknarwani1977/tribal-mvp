// src/pages/EditEvent.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditEvent: React.FC = () => {
  const { id } = useParams(); // Get the event ID from URL
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Load existing event details on mount
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) throw new Error("No event ID provided");
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setDate(data.date);
          setTime(data.time);
          setNotes(data.notes || '');
        } else {
          throw new Error("Event not found");
        }
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      }
    };

    fetchEvent();
  }, [id]);

  // Handle event update
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!id) throw new Error("No event ID provided");
      const docRef = doc(db, "events", id);

      await updateDoc(docRef, {
        title,
        date,
        time,
        notes
      });

      alert("Event updated!");
      navigate("/calendar");
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Edit Event</h2>
          <p className="mt-2 text-sm text-gray-600">Make changes to your event details.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleUpdate}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
              required
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
              required
            />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] sm:text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full bg-[#004b6e] text-white py-2 rounded-md hover:bg-[#003b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004b6e]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
