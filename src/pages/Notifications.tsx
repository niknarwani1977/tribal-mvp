// src/pages/Notifications.tsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

/**
 * Notification record shape
 */
export interface NotificationRecord {
  id: string;
  circleId: string;
  message: string;
  createdAt: Timestamp;
  readBy: string[];
}

/**
 * Notifications component: lists real-time notifications for circles
 * where the current user is a member (under 'members').
 */
const Notifications: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [circleIds, setCircleIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
       // (removed circleIds debug log)
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setError('You must sign in to view notifications.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    (async () => {
      try {
        const circlesSnap = await getDocs(collection(db, 'circles'));
        const memberships = await Promise.all(
          circlesSnap.docs.map(async (cDoc) => {
            const m = await getDoc(doc(db, 'circles', cDoc.id, 'members', user.uid));
            return m.exists() ? cDoc.id : null;
          })
        );
        const ids = memberships.filter((x): x is string => !!x);
        console.log('Fetched circleIds:', ids);
        setCircleIds(ids);
      } catch (e) {
        console.error('Error fetching circle memberships:', e);
        setError('Failed to load circle memberships.');
        setLoading(false);
      }
    })();
  }, [authReady, user]);

  useEffect(() => {
    if (!authReady || !user) return;
    if (!circleIds.length) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const unsub = onSnapshot(
      collection(db, 'notifications'),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationRecord, 'id'>) }));
        const filtered = all.filter((n) => circleIds.includes(n.circleId));
         // (removed raw/filtered debug logs)
        filtered.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setNotifications(filtered);
        setLoading(false);
      },
      (err) => {
        console.error('Realtime subscription error:', err);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authReady, user, circleIds]);

  if (loading) {
    return <div className="p-6 text-center">Loading notifications…</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }
  if (!notifications.length) {
    return <div className="p-6 text-center">No notifications yet.</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="p-4 bg-white rounded shadow">
            <p className="font-medium">{n.message}</p>
            <p className="text-sm text-gray-500">{n.createdAt.toDate().toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
