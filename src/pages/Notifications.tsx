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
 * Shows real-time notifications for circles the user belongs to.
 */
const NotificationsPage: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Circle IDs for membership
  const [circleIds, setCircleIds] = useState<string[]>([]);
  // Notifications list
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Debug log at each render
  console.log('Rendering NotificationsPage', { user, authReady, circleIds, loading, error, notifications });

  // 1️⃣ Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
      console.log('User not signed in');
      setError('You must be signed in to view notifications.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    (async () => {
      try {
        const circlesSnap = await getDocs(collection(db, 'circles'));
        const membershipChecks = circlesSnap.docs.map(async (cDoc) => {
          const memberSnap = await getDoc(doc(db, 'circles', cDoc.id, 'members', user.uid));
          return memberSnap.exists() ? cDoc.id : null;
        });
        const results = await Promise.all(membershipChecks);
        const ids = results.filter((id): id is string => Boolean(id));
        console.log('Fetched circleIds:', ids);
        setCircleIds(ids);
      } catch (err) {
        console.error('Error fetching memberships:', err);
        setError('Failed to load circle memberships.');
        setLoading(false);
      }
    })();
  }, [authReady, user]);

  // 3️⃣ Real-time subscription to notifications
  useEffect(() => {
    if (!authReady || !user) return;

    if (circleIds.length === 0) {
      console.log('No circleIds to subscribe');
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
    console.log('Subscribing to notifications for:', circleIds);

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<NotificationRecord, 'id'>)
        }));
        console.log('Received notifications:', notifs);
        setNotifications(notifs);
        setLoading(false);
      },
      (err) => {
        console.error('Subscription error:', err);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [authReady, user, circleIds]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-2">Loading notifications…</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // No notifications
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <p>No notifications yet.</p>
      </div>
    );
  }

  // Render notifications list
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <ul className="space-y-2">
        {notifications.map((n) => (
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
