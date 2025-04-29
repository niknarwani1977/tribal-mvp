// src/pages/CalendarView.tsx
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  notes?: string;
}

const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
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
        const snapshot = await getDocs(q);

        const allEvents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Event, 'id'>)
        }));

        setEvents(allEvents);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const dayStr = selectedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const dayEvents = events.filter(ev => ev.date === dayStr);
    setFilteredEvents(dayEvents);
  }, [selectedDate, events]);

  return (
    <div className="min-h-screen px-4 py-8 bg-[#fef9f4]">
      <h1 className="text-3xl font-bold text-center text-[#004b6e] mb-6">Circle Calendar</h1>

      <div className="flex flex-col md:flex-row justify-center gap-6">
        <div>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
          />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2 text-[#004b6e]">
            Events on {selectedDate.toDateString()}:
          </h2>
          {filteredEvents.length === 0 ? (
            <p className="text-gray-600">No events on this day.</p>
          ) : (
            <ul className="space-y-4">
              {filteredEvents.map(event => (
                <li key={event.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.time}</p>
                  {event.notes && <p className="text-sm text-gray-500 mt-1">{event.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default CalendarView;
