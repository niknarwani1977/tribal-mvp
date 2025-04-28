import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { Event } from '../types';

const CalendarView = () => {
  const events: Event[] = [
    {
      id: '1',
      title: 'Soccer Practice Pickup',
      dateTime: '2024-03-20T16:30:00',
      location: '123 Sports Complex',
      assignedMembers: ['1', '2'],
      circleId: '1',
    },
    {
      id: '2',
      title: 'Piano Lessons',
      dateTime: '2024-03-21T15:00:00',
      location: 'Music School',
      assignedMembers: ['1'],
      circleId: '1',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Your upcoming events</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 px-3 py-1 rounded text-sm">Week</button>
          <button className="bg-[#004b6e] text-white px-3 py-1 rounded text-sm">Month</button>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm">
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i - 3;
            const isToday = day === 17;
            const hasEvent = [17, 18].includes(day);

            return (
              <div
                key={i}
                className={`
                  p-2 min-h-[80px] border rounded
                  ${day < 1 || day > 31 ? 'bg-gray-50' : 'bg-white'}
                  ${isToday ? 'border-[#004b6e]' : 'border-gray-100'}
                `}
              >
                {day > 0 && day <= 31 && (
                  <>
                    <span className={isToday ? 'font-bold text-[#004b6e]' : ''}>{day}</span>
                    {hasEvent && (
                      <div className="mt-1 p-1 bg-[#fef9f4] rounded text-xs">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-[#ff7e47]" />
                          <span className="truncate">
                            {day === 17 ? 'Soccer Practice' : 'Piano Lessons'}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Upcoming Events</h2>
        {events.map((event) => (
          <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-sm text-gray-600">
              {new Date(event.dateTime).toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-600">{event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;