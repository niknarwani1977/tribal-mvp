// src/pages/Notifications.tsx
// Page to display and manage notifications for circles the user belongs to.
// Features:
//  • Fetches user circle memberships on auth and subscribes to notifications
//  • Displays each notification with timestamp and read/unread status
//  • Allows marking individual notifications as read
//  • Provides "Mark All as Read" action

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collectionGroup,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  Timestamp,
  getDocs,
} from 'firebase/firestore';

interface Notification {
  id: string;
  circleId: string;
  message: string;
  createdAt: Timestamp;
  readBy: string[];
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let unsubAuth: () => void;
    let unsubNotifs: () => void = () => {};

    unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // 1️⃣ Fetch membership docs once
        const memSnap = await getDocs(
          query(collectionGroup(db, 'members'), where('__name__', '==', user.uid))
        );
        const circleIds = memSnap.docs.map(d => d.ref.parent.parent!.id);

        if (circleIds.length === 0) {
          setNotifications([]);
          setLoading(false);
          return;
        }

        // 2️⃣ Subscribe to notifications for those circles
        const notifsQ = query(
          collection(db, 'notifications'),
          where('circleId', 'in', circleIds),
          orderBy('createdAt', 'desc')
        );

        unsubNotifs = onSnapshot(
          notifsQ,
          (notifSnap) => {
            const loaded = notifSnap.docs.map(d => {
              const data = d.data();
              return {
                id: d.id,
                circleId: data.circleId,
                message: data.message,
                createdAt: data.createdAt,
                readBy: data.readBy || [],
              } as Notification;
            });
            setNotifications(loaded);
            setLoading(false);
          },
          (err) => {
            console.error('Notifications subscription error:', err);
            setError('Failed to load notifications.');
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('Error loading memberships or notifications:', err);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      unsubAuth();
      unsubNotifs();
    };
  }, [navigate]);

  const markAsRead = async (notif: Notification) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, 'notifications', notif.id), {
      readBy: arrayUnion(user.uid),
    });
  };

  const markAllRead = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await Promise.all(
      notifications.map(notif => {
        if (notif.readBy.includes(user.uid)) return Promise.resolve();
        return updateDoc(doc(db, 'notifications', notif.id), {
          readBy: arrayUnion(user.uid),
        });
      })
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading notifications…</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button
          onClick={markAllRead}
          className="text-sm text-[#004b6e] hover:underline"
        >
          Mark All Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-600">No notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map(notif => {
            const user = auth.currentUser!;
            const isRead = notif.readBy.includes(user.uid);
            return (
              <li
                key={notif.id}
                className={`p-4 border rounded-lg flex justify-between items-start ${
                  isRead ? 'bg-gray-100' : 'bg-white'
                }`}
              >
                <div>
                  <p className="text-sm text-gray-700">{notif.message}</p>
                  <p className="text-xs text-gray-400">
                    {notif.createdAt.toDate().toLocaleString()}
                  </p>
                </div>
                {!isRead && (
                  <button
                    onClick={() => markAsRead(notif)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Mark Read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
