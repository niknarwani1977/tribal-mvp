import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const CreateEvent = () => {
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    circle: '',
    members: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle event creation
    console.log('Event data:', eventData);
  };

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-600">Schedule a new event for your circle</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="title"
                className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-[#004b6e] focus:border-[#004b6e]"
                placeholder="e.g., Soccer Practice Pickup"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                className="w-full rounded-lg border border-gray-300 focus:ring-[#004b6e] focus:border-[#004b6e]"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  id="time"
                  className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-[#004b6e] focus:border-[#004b6e]"
                  value={eventData.time}
                  onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="location"
                className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-[#004b6e] focus:border-[#004b6e]"
                placeholder="Enter location"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="circle" className="block text-sm font-medium text-gray-700 mb-1">
              Select Circle
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="circle"
                className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-[#004b6e] focus:border-[#004b6e]"
                value={eventData.circle}
                onChange={(e) => setEventData({ ...eventData, circle: e.target.value })}
              >
                <option value="">Select a circle</option>
                <option value="1">Sarah's School Group</option>
                <option value="2">Soccer Team Parents</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#004b6e] text-white py-3 rounded-lg hover:bg-[#003b56] transition-colors"
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;