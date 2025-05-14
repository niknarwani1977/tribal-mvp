// src/pages/CalendarView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<{ id: string; title: string; date: string }[]>([]);

  // Listen for real-time updates from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'events'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const evts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as { title: string; date: string; startTime: string; endTime: string; repeatRule?: any })
      }));
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

  const calendarDates = Array.from({ length: rows * 7 }).map((_, i) => {
    const dayNum = i - firstDayIndex + 1;
    return dayNum > 0 && dayNum <= daysInMonth
      ? new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          dayNum
        )
      : null;
  });

  const prevMonth = () =>
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );

  return (
    <div className="p-4">
      {/* Month header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-2">‹</button>
        <h2 className="text-xl font-semibold">
          {currentMonth.toLocaleString('default', {
            month: 'long',
            year: 'numeric'
          })}
        </h2>
        <button onClick={nextMonth} className="px-2">›</button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 text-center font-medium text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 mt-2">
        {calendarDates.map((date, idx) => {
          const key = date ? date.toISOString().slice(0, 10) : `empty-${idx}`;
          const dayEvents = date ? eventsByDate[key] || [] : [];

          return (
            <div
              key={idx}
              onClick={() => date && navigate(`/create-event?date=${key}`)}
              className="h-24 border rounded-lg p-1 bg-white relative overflow-auto cursor-pointer hover:bg-gray-100"
            >
              {date && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  {/* Events */}
                  {dayEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/edit-event/${evt.id}`);
                      }}
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
