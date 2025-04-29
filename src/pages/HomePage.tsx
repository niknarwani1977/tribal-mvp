// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  createdAt: Timestamp;
}

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        if (!user) throw new Error("User not logged in");

        // Fetch user's Circle ID
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const circleId = userData.circleId;

          if (!circleId) {
            console.log("User is not part of a Circle");
            return;
          }

          // Query events from the user's Circle
          const eventsQuery = query(
            collection(db, "events"),
            where("circleId", "==", circleId)
          );

          const querySnapshot = await getDocs(eventsQuery);

          let fetchedEvents: Event[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedEvents.push({
              id: docSnap.id,
              title: data.title,
              date: data.date,
              time: data.time,
              createdAt: data.createdAt,
            });
          });

          // Sort events by date
          fetchedEvents.sort((a, b) => {
            const dateA = new Date(a.date + "T" + a.time).getTime();
            const dateB = new Date(b.date + "T" + b.time).getTime();
            return dateA - dateB;
          });

          // Only keep the next 3 events
          setEvents(fetchedEvents.slice(0, 3));
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    fetchUpcomingEvents();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-6">
        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user && user.email ? `, ${user.email.split('@')[0]}!` : "!"}
          </h1>
          <p className="text-gray-600 mt-2">Here’s what’s coming up in your Circle:</p>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-gray-500">No upcoming events yet.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="p-4 rounded-lg bg-white shadow-md">
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex justify-around mt-6">
          <button
            onClick={() => navigate('/calendar')}
            className="bg-[#004b6e] text-white py-2 px-4 rounded-lg hover:bg-[#003b56]"
          >
            View Calendar
          </button>
          <button
            onClick={() => navigate('/create-event')}
            className="bg-[#004b6e] text-white py-2 px-4 rounded-lg hover:bg-[#003b56]"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
