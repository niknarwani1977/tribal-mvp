// src/pages/CreateEvent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";

const CreateEvent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in');

      // Fetch user's circleId from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const circleId = userData.circleId;

        if (!circleId) {
          throw new Error('User is not part of any Circle.');
        }

        // Save the event inside the "events" collection
        await addDoc(collection(db, "events"), {
          title,
          date,
          time,
          notes,
          circleId,
          createdByUID: user.uid,
          createdAt: Timestamp.now()
        });

        // Save a new Notification inside the "notifications" collection
        await addDoc(collection(db, "notifications"), {
          circleId: circleId,
          message: `New event created: ${title}`,
          createdAt: Timestamp.now(),
          readBy: [], // No users have read it yet
        });

        alert("Event and Notification created successfully!");
        navigate('/calendar'); // Redirect after creation
      } else {
        throw new Error('User document not found');
      }
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create a New Event</h2>
          <p className="mt-2 text-sm text-gray-600">Add an event to your trusted Circle calendar.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleCreateEvent}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event Title"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] focus:z-10 sm:text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="date"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] focus:z-10 sm:text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <input
              type="time"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] focus:z-10 sm:text-sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <textarea
              placeholder="Notes (optional)"
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] focus:z-10 sm:text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004b6e] hover:bg-[#003b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004b6e]"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
