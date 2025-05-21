// src/pages/NotificationsPage.tsx

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
 * Displays real-time notifications for all circles the user belongs to.
 * Subscribes to the root notifications collection and filters client-side
 * to avoid Firestore composite index requirements.
 */
const NotificationsPage: React.FC = () => {
  // Firebase authenticated user
  const [user, setUser] = useState<User | null>(null);
  // Auth resolution flag
  const [authReady, setAuthReady] = useState(false);

  // Circle IDs the user belongs to
  const [circleIds, setCircleIds] = useState<string[]>([]);
  // Notifications to display
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 1️⃣ Listen for Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // 2️⃣ Fetch circle membership IDs once auth is ready and user is present
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
        const membershipIds = await Promise.all(
          circlesSnap.docs.map(async (cDoc) => {
            const mSnap = await getDoc(doc(db, 'circles', cDoc.id, 'users', user.uid));
            return mSnap.exists() ? cDoc.id : null;
          })
        );
      
        const validIds = membershipIds.filter((id): id is string => Boolean(id));
        setCircleIds(validIds);
      } catch (e) {
        console.error('Error fetching circle memberships:', e);
        setError('Failed to load circle memberships.');
        setLoading(false);
      }
    })();
  }, [authReady, user]);

  // 3️⃣ Subscribe to root notifications collection and filter client-side
  useEffect(() => {
    if (!authReady || !user) return;
    if (circleIds.length === 0) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    // Subscribe to all notifications and filter in-memory
    const unsubscribe = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        // Map documents to NotificationRecord
        const allNotifs: NotificationRecord[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<NotificationRecord, 'id'>)
        }));

        // Filter for user's circles
        const filtered = allNotifs.filter((n) => circleIds.includes(n.circleId));
        // Sort descending by createdAt
        filtered.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        setNotifications(filtered);
        setLoading(false);
      },
      (subErr) => {
        console.error('Notification subscription error:', subErr);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authReady, user, circleIds]);

  // Render loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-2">Loading notifications…</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  // Render empty state
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
