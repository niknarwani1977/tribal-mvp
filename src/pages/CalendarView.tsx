// src/pages/CalendarView.tsx
import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  notes?: string;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not logged in");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) throw new Error("User document not found");

        const circleId = userSnap.data().circleId;
        if (!circleId) throw new Error("User has no circle");

        const eventsRef = collection(db, "events");
        const q = query(eventsRef, where("circleId", "==", circleId));
        const querySnapshot = await getDocs(q);

        const eventsData: Event[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Event, 'id'>)
        }));

        setEvents(eventsData);
      } catch (err: any) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 bg-[#fef9f4]">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#004b6e]">Upcoming Events</h1>

      {loading && <p className="text-center text-gray-600">Loading events...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && events.length === 0 && (
        <p className="text-center text-gray-600">No events found for your circle.</p>
      )}

      <ul className="space-y-4">
        {events.map(event => (
          <li key={event.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
            <p className="text-gray-600">{event.date} at {event.time}</p>
            {event.notes && <p className="text-gray-500 mt-1">{event.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarView;
