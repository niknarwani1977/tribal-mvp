import React from 'react';
import { Calendar, Users, Bell } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sarah Johnson</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Users className="w-6 h-6 text-[#004b6e] mb-2" />
          <h3 className="font-semibold">Active Circles</h3>
          <p className="text-2xl font-bold text-[#004b6e]">3</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Calendar className="w-6 h-6 text-[#ff7e47] mb-2" />
          <h3 className="font-semibold">Today's Events</h3>
          <p className="text-2xl font-bold text-[#ff7e47]">2</p>
        </div>
      </div>

      <section className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-[#004b6e] pl-3">
            <p className="font-semibold">Soccer Practice Pickup</p>
            <p className="text-sm text-gray-600">Today, 4:30 PM</p>
          </div>
          <div className="border-l-4 border-[#ff7e47] pl-3">
            <p className="font-semibold">Piano Lessons</p>
            <p className="text-sm text-gray-600">Tomorrow, 3:00 PM</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Notifications</h2>
          <Bell className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-[#ff7e47] mt-2" />
            <div>
              <p className="text-sm">John accepted to pick up Sarah from soccer practice</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-[#004b6e] mt-2" />
            <div>
              <p className="text-sm">New event request from Emma's circle</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;