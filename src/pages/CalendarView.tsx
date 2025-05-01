import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';

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
  const navigate = useNavigate();

  // Fetch all events in user's circle on component mount
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

  // Filter events by selected date
  useEffect(() => {
    const dayStr = selectedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const dayEvents = events.filter(ev => ev.date === dayStr);
    setFilteredEvents(dayEvents);
  }, [selectedDate, events]);

  // Handle deleting an event
  const handleDelete = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", eventId));
        alert("Event deleted!");
        window.location.reload(); // simple refresh
      } catch (err: any) {
        console.error("Delete error:", err.message);
      }
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-[#fef9f4]">
      <h1 className="text-3xl font-bold text-center text-[#004b6e] mb-6">Circle Calendar</h1>

      <div className="flex flex-col md:flex-row justify-center gap-6">
        <div>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dayStr = date.toISOString().split('T')[0];
                const hasEvent = events.some(event => event.date === dayStr);
                return hasEvent ? (
                  <div className="flex justify-center mt-1">
                    <span className="w-2 h-2 bg-[#004b6e] rounded-full"></span>
                  </div>
                ) : null;
              }
              return null;
            }}
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
                <li
                  key={event.id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-200"
                >
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.time}</p>
                  {event.notes && (
                    <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                  )}

                  <div className="flex justify-end gap-4 mt-2">
                    <button
                      className="text-blue-600 text-sm"
                      onClick={() => navigate(`/edit-event/${event.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 text-sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                  </div>
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
