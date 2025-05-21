// src/pages/Notifications.tsx
// Page to display and manage notifications for circles the user belongs to.
// Enhanced with debug logs to trace subscription flow.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collectionGroup,
  collection,
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
    console.log('Notifications: effect mount');
    let unsubAuth: () => void;
    let unsubMembers: () => void = () => {};
    let unsubNotifs: () => void = () => {};

    unsubAuth = onAuthStateChanged(auth, (user) => {
      console.log('Notifications: auth state changed', user?.uid);
      if (!user) {
        console.log('Notifications: no user, redirect');
        navigate('/login');
        return;
      }

      // Subscribe to membership
      const memQ = query(
        collectionGroup(db, 'members'),
        where('__name__', '==', user.uid)
      );
      console.log('Notifications: subscribing to members');
      unsubMembers = onSnapshot(
        memQ,
        (memSnap) => {
          console.log('Notifications: memSnap docs:', memSnap.docs.length);
          const circleIds = memSnap.docs.map(d => d.ref.parent.parent!.id);
          console.log('Notifications: circleIds:', circleIds);

          if (circleIds.length === 0) {
            console.log('Notifications: no circles, clear');
            setNotifications([]);
            setLoading(false);
            return;
          }

          // Subscribe to notifications for those circles
          const notifsQ = query(
            collection(db, 'notifications'),
            where('circleId', 'in', circleIds),
            orderBy('createdAt', 'desc')
          );
          console.log('Notifications: subscribing to notifications');
          unsubNotifs();
          unsubNotifs = onSnapshot(
            notifsQ,
            (notifSnap) => {
              console.log('Notifications: notifSnap docs:', notifSnap.docs.length);
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
            },
            (err) => {
              console.error('Notifications subscription error:', err);
              setError('Failed to load notifications.');
              setLoading(false);
            }
          );
        },
        (err) => {
          console.error('Membership subscription error:', err);
          setError('Failed to load notifications.');
          setLoading(false);
        }
      );
    });

    return () => {
      console.log('Notifications: cleanup');
      unsubAuth();
      unsubMembers();
      unsubNotifs();
    };
  }, [navigate]);

  const markAsRead = async (notif: Notification) => {
    const user = auth.currentUser;
    if (!user) return;
    console.log('Notifications: markAsRead', notif.id);
    const notifRef = doc(db, 'notifications', notif.id);
    await updateDoc(notifRef, {
      readBy: arrayUnion(user.uid),
    });
  };

  const markAllRead = async () => {
    const user = auth.currentUser;
    if (!user) return;
    console.log('Notifications: markAllRead');
    await Promise.all(
      notifications.map((notif) => {
        if (notif.readBy.includes(user.uid)) return Promise.resolve();
        const notifRef = doc(db, 'notifications', notif.id);
        return updateDoc(notifRef, { readBy: arrayUnion(user.uid) });
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
        <button onClick={markAllRead} className="text-sm text-[#004b6e] hover:underline">
          Mark All Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-600">No notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => {
            const user = auth.currentUser!;
            const isRead = notif.readBy.includes(user.uid);
            return (
              <li key={notif.id} className={`p-4 border rounded-lg flex justify-between items-start ${isRead ? 'bg-gray-100' : 'bg-white'}`}>
                <div>
                  <p className="text-sm text-gray-700">{notif.message}</p>
                  <p className="text-xs text-gray-400">{notif.createdAt.toDate().toLocaleString()}</p>
                </div>
                {!isRead && (
                  <button onClick={() => markAsRead(notif)} className="text-blue-600 text-sm hover:underline">
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
