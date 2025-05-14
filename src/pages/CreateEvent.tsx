// src/pages/CreateEvent.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateEvent: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Repeat settings
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [interval, setInterval] = useState(1);
  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [monthlyDay, setMonthlyDay] = useState<number>(1);

  const navigate = useNavigate();

  const toggleWeeklyDay = (day: string) => {
    setWeeklyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build repeat rule
    const repeatRule: any = { frequency: repeat };
    if (repeat !== 'none') repeatRule.interval = interval;
    if (repeat === 'weekly') repeatRule.days = weeklyDays;
    if (repeat === 'monthly') repeatRule.dayOfMonth = monthlyDay;

    const newEvent = { title, date, startTime, endTime, repeatRule };

    // TODO: replace with API call
    console.log('Event to save:', newEvent);
    alert('Event created (with repeatable logic)');
    navigate('/calendar');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4 text-[#004b6e]">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title */}
        <div>
          <label className="block text-sm text-gray-700">Event Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e]"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-gray-700">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e]"
          />
        </div>

        {/* Start / End Time */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-700">Start Time</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700">End Time</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e]"
            />
          </div>
        </div>

        {/* Repeat Frequency */}
        <div>
          <label className="block text-sm text-gray-700">Repeat</label>
          <select
            value={repeat}
            onChange={e => setRepeat(e.target.value as any)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Repeat Details */}
        {repeat !== 'none' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Every</label>
              <input
                type="number"
                min={1}
                value={interval}
                onChange={e => setInterval(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <span className="text-xs text-gray-500">
                {repeat === 'daily' && 'day(s)'}
                {repeat === 'weekly' && 'week(s)'}
                {repeat === 'monthly' && 'month(s)'}
              </span>
            </div>

            {repeat === 'weekly' && (
              <div>
                <label className="block text-sm text-gray-700">Repeat on:</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeeklyDay(day)}
                      className={`px-2 py-1 border rounded ${weeklyDays.includes(day) ? 'bg-[#004b6e] text-white' : 'border-gray-300'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {repeat === 'monthly' && (
              <div>
                <label className="block text-sm text-gray-700">Day of month</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={monthlyDay}
                  onChange={e => setMonthlyDay(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            )}
          </div>
        )}

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

export default CreateEvent;
