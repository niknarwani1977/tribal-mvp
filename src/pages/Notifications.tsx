// src/pages/Notifications.tsx
// Page to display and manage notifications for circles the user belongs to.
// Features:
//  • Subscribes in real-time to notifications for user's circles
//  • Displays each notification with timestamp and circle context
//  • Allows marking individual notifications as read
//  • Provides "Mark All as Read" action

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  collectionGroup,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

// TypeScript interface for a notification
interface Notification {
  id: string;
  circleId: string;
  message: string;
  createdAt: Timestamp;
  readBy?: string[];  // array of user UIDs who have read this
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    let unsubAuth: (() => void) | null = null;
    let unsubNotifs: (() => void) | null = null;

    // 1️⃣ Wait for auth state
    unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If not signed in, redirect to login
        navigate('/login');
        return;
      }

      // 2️⃣ Query membership docs to get circle IDs
      try {
        const membersQ = query(
          collectionGroup(db, 'members'),
          where('__name__', '==', user.uid)
        );
        const membershipSnap = await onSnapshot(membersQ, async (memSnap) => {
          const circleIds = memSnap.docs.map(doc => doc.ref.parent.parent!.id);

          if (circleIds.length === 0) {
            setNotifications([]);
            setLoading(false);
            return;
          }

          // 3️⃣ Subscribe to notifications for those circles
          const notifsQ = query(
            collection(db, 'notifications'),
            where('circleId', 'in', circleIds),
            orderBy('createdAt', 'desc')
          );
          unsubNotifs = onSnapshot(notifsQ, (notifSnap) => {
            const loaded: Notification[] = notifSnap.docs.map(d => {
              const data = d.data() as DocumentData;
              return {
                id: d.id,
                circleId: data.circleId,
                message: data.message,
                createdAt: data.createdAt,
                readBy: data.readBy || [],
              };
            });
            setNotifications(loaded);
            setLoading(false);
          });
        });
      } catch (err: any) {
        console.error('Error subscribing to notifications:', err);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubNotifs) unsubNotifs();
    };
  }, [navigate]);

  /**
   * Mark a single notification as read by adding current user UID to its readBy array.
   */
  const markAsRead = async (notif: Notification) => {
    const user = auth.currentUser;
    if (!user) return;
    const notifRef = doc(db, 'notifications', notif.id);
    await updateDoc(notifRef, {
      readBy: arrayUnion(user.uid)
    });
  };

  /**
   * Mark all notifications as read for this user.
   */
  const markAllRead = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const batchPromises = notifications.map(notif => {
      if (notif.readBy?.includes(user.uid)) return Promise.resolve();
      const notifRef = doc(db, 'notifications', notif.id);
      return updateDoc(notifRef, { readBy: arrayUnion(user.uid) });
    });
    await Promise.all(batchPromises);
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
            const isRead = auth.currentUser && notif.readBy?.includes(auth.currentUser.uid);
            return (
              <li
                key={notif.id}
                className={`p-4 border rounded-lg flex justify-between items-start ${isRead ? 'bg-gray-100' : 'bg-white'}`}
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
