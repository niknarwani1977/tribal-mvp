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
  updateDoc,
  arrayUnion,
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
 * where the current user is a member, and allows marking as read.
 */
const Notifications: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [circleIds, setCircleIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 1️⃣ Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // 2️⃣ Fetch circle membership IDs once auth is ready
  useEffect(() => {
    if (!authReady || !user) {
      if (authReady && !user) {
        setError('You must sign in to view notifications.');
        setLoading(false);
      }
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
        setCircleIds(ids);
      } catch (e) {
        console.error('Error fetching circle memberships:', e);
        setError('Failed to load circle memberships.');
        setLoading(false);
      }
    })();
  }, [authReady, user]);

  // 3️⃣ Subscribe to notifications and filter client-side
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
        const all: NotificationRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<NotificationRecord, 'id'>)
        }));
        const filtered = all
          .filter((n) => circleIds.includes(n.circleId))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
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
          <li key={n.id} className="p-4 bg-white rounded shadow space-y-2">
            <p className="font-medium">{n.message}</p>
            <p className="text-sm text-gray-500">
              {n.createdAt
                .toDate()
                .toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
            </p>
            <button
              onClick={async () => {
                if (!user) return;
                const notifRef = doc(db, 'notifications', n.id);
                await updateDoc(notifRef, { readBy: arrayUnion(user.uid) });
                // Optimistic update
                n.readBy.push(user.uid);
                setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item } : item)));
              }}
              disabled={n.readBy.includes(user?.uid || '')}
              className="text-blue-500 hover:underline text-sm"
            >
              {n.readBy.includes(user?.uid || '') ? 'Read ✓' : 'Mark as read'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
