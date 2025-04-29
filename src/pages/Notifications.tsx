// src/pages/Notifications.tsx
import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

interface Notification {
  id: string;
  message: string;
  createdAt: any;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not logged in');

        // Fetch user's Circle ID
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const circleId = userData.circleId;

          if (!circleId) {
            throw new Error('User is not part of a Circle');
          }

          // Fetch Notifications for the user's Circle
          const q = query(collection(db, "notifications"), where("circleId", "==", circleId));
          const querySnapshot = await getDocs(q);

          const fetchedNotifications: Notification[] = [];
          querySnapshot.forEach((doc) => {
            fetchedNotifications.push({
              id: doc.id,
              ...doc.data(),
            } as Notification);
          });

          // Sort notifications by newest first
          fetchedNotifications.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

          setNotifications(fetchedNotifications);
          // After setting notifications:
            if (user && fetchedNotifications.length > 0) {
              const batch = fetchedNotifications.map(async (notif) => {
                const notifRef = doc(db, "notifications", notif.id);
                const notifSnap = await getDoc(notifRef);
                const notifData = notifSnap.data();

    if (notifData && (!notifData.readBy || !notifData.readBy.includes(user.uid))) {
      await notifRef.update({
        readBy: [...(notifData.readBy || []), user.uid],
      });
    }
  });

  await Promise.all(batch);
}
        }
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Notifications</h1>

        {loading ? (
          <p className="text-gray-600 text-center">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-600 text-center">No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li key={notif.id} className="p-4 rounded-lg bg-white shadow-md text-gray-700">
                {notif.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;




/*import React from 'react';
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

export default Notifications;*/
