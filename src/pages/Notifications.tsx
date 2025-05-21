// src/pages/NotificationsPage.tsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

/**
 * Type definition for a notification document.
 */
export interface NotificationRecord {
  id: string;
  circleId: string;
  message: string;
  createdAt: Timestamp;
  readBy: string[];
}

/**
 * NotificationsPage
 * -----------------
 * Displays notifications for circles the user belongs to.
 * Uses onSnapshot for real-time updates; falls back to static fetch on error.
 */
const NotificationsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [circleIds, setCircleIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  console.log('Rendering NotificationsPage', { user, authReady, circleIds, loading, error, notifications });

  // 1️⃣ Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      console.log('Auth state changed:', firebaseUser);
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // 2️⃣ Fetch circle membership IDs
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setError('You must be signed in to view notifications.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    (async () => {
      try {
        const circlesSnap = await getDocs(collection(db, 'circles'));
        const membershipChecks = circlesSnap.docs.map(async cDoc => {
          const memberSnap = await getDoc(doc(db, 'circles', cDoc.id, 'members', user.uid));
          return memberSnap.exists() ? cDoc.id : null;
        });
        const results = await Promise.all(membershipChecks);
        const ids = results.filter((id): id is string => Boolean(id));
        console.log('Fetched circleIds:', ids);
        setCircleIds(ids);
      } catch (e) {
        console.error('Error fetching memberships:', e);
        setError('Failed to load circle memberships.');
        setLoading(false);
      }
    })();
  }, [authReady, user]);

  // 3️⃣ Subscribe to notifications or static fallback
  useEffect(() => {
    if (!authReady || !user) return;
    if (circleIds.length === 0) {
      console.log('No circleIds to subscribe to.');
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const notifQuery = query(
      collection(db, 'notifications'),
      where('circleId', 'in', circleIds),
      orderBy('createdAt', 'desc')
    );
    console.log('Attempting real-time subscription for:', circleIds);
    const unsubscribe = onSnapshot(
      notifQuery,
      snapshot => {
        const notifs = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<NotificationRecord, 'id'>)
        }));
        console.log('Realtime notifications received:', notifs);
        setNotifications(notifs);
        setLoading(false);
      },
      async subErr => {
        console.warn('Realtime subscription failed, falling back:', subErr);
        try {
          let staticList: NotificationRecord[] = [];
          for (const cid of circleIds) {
            const snap = await getDocs(
              query(
                collection(db, 'notifications'),
                where('circleId', '==', cid)
              )
            );
            staticList.push(
              ...snap.docs.map(d => ({
                id: d.id,
                ...(d.data() as Omit<NotificationRecord, 'id'>)
              }))
            );
          }
          staticList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
          console.log('Static notifications fetched:', staticList);
          setNotifications(staticList);
        } catch (fetchErr) {
          console.error('Static fetch failed:', fetchErr);
          setError('Failed to load notifications.');
        } finally {
          setLoading(false);
        }
      }
    );
    return () => unsubscribe();
  }, [authReady, user, circleIds]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-2">Loading notifications…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <p>No notifications yet.</p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <ul className="space-y-2">
        {notifications.map(n => (
          <li key={n.id} className="p-4 bg-white rounded shadow">
            <p className="font-medium">{n.message}</p>
            <p className="text-sm text-gray-500">
              {n.createdAt.toDate().toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
