import React from 'react';
import { Bell } from 'lucide-react';
import type { Notification } from '../types';

const Notifications = () => {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'event_response',
      message: 'John accepted to pick up Sarah from soccer practice',
      read: false,
      createdAt: '2024-03-20T14:30:00',
    },
    {
      id: '2',
      type: 'event_request',
      message: 'New event request from Emma\'s circle',
      read: false,
      createdAt: '2024-03-20T11:30:00',
    },
    {
      id: '3',
      type: 'traffic_alert',
      message: 'Heavy traffic reported on route to Soccer Practice',
      read: true,
      createdAt: '2024-03-20T10:15:00',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your circles</p>
        </div>
        <Bell className="w-6 h-6 text-gray-500" />
      </header>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white p-4 rounded-lg shadow-sm ${
              !notification.read ? 'border-l-4 border-[#ff7e47]' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'event_response'
                    ? 'bg-[#004b6e]'
                    : notification.type === 'event_request'
                    ? 'bg-[#ff7e47]'
                    : 'bg-yellow-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;