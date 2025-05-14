// src/pages/CalendarView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<{ id: string; title: string; date: string }[]>([]);

  // Subscribe to Firestore events
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const eventsQuery = query(collection(db, 'users', user.uid, 'events'));
    const unsubscribe = onSnapshot(eventsQuery, snapshot => {
      const evts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setEvents(evts);
    });
    return unsubscribe;
  }, []);

  // Group events by date
  const eventsByDate = events.reduce((acc, evt) => {
    acc[evt.date] = [...(acc[evt.date] || []), evt];
    return acc;
  }, {} as Record<string, typeof events>);

  // Build calendar grid
  const firstDayIndex = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const totalCells = firstDayIndex + daysInMonth;
  const rows = Math.ceil(totalCells / 7);
  const calendarDates = Array.from({ length: rows * 7 }).map((_, idx) => {
    const day = idx - firstDayIndex + 1;
    return day > 0 && day <= daysInMonth
      ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      : null;
  });

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth}>‹</button>
        <h2 className="text-xl font-semibold">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth}>›</button>
      </div>
      <div className="grid grid-cols-7 text-center font-medium text-sm">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 mt-2">
        {calendarDates.map((date, i) => {
          const key = date ? date.toISOString().slice(0, 10) : `empty-${i}`;
          const dayEvents = date ? eventsByDate[key] || [] : [];
          return (
            <div
              key={i}
              onClick={() => {
                console.log('Calendar cell clicked:', key);
                if (date) navigate(`/create-event?date=${key}`);
              }}
              className="h-24 border rounded-lg p-1 bg-white cursor-pointer hover:bg-gray-100"
            >
              {date && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    {dayEvents.length > 0 && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                  </div>
                  {dayEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={e => { e.stopPropagation(); navigate(`/edit-event/${evt.id}`); }}
                      className="mt-1 text-xs text-blue-600 cursor-pointer hover:underline"
                    >
                      {evt.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
