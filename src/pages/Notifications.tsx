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
// Import a Spinner or fallback to a simple inline loader
// If you have a Spinner component, adjust the path accordingly. Otherwise, we define a local spinner below.
// import Spinner from '@/components/ui/Spinner';

// Type definition for a notification record
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
 * Implements robust auth state handling, parallel membership checks, and real-time Firestore subscription.
 */
const NotificationsPage: React.FC = () => {
  // Authenticated Firebase user
  const [user, setUser] = useState<User | null>(null);
  // Indicates when auth has been resolved (success or null)
  const [authReady, setAuthReady] = useState(false);

  // IDs of circles the current user belongs to
  const [circleIds, setCircleIds] = useState<string[]>([]);
  // Loaded notifications for those circles
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 1️⃣ Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    // Cleanup on unmount
    return unsubscribe;
  }, []);

  // 2️⃣ Once auth is ready and user is present, fetch circle membership IDs in parallel
  useEffect(() => {
    if (!authReady || !user) {
      // Either still loading auth or user is not signed in
      if (authReady && !user) {
        // If auth resolved but no user, stop loading to show error
        setLoading(false);
        setError('You must be signed in to view notifications.');
      }
      return;
    }

    setLoading(true);
    setError('');

    (async () => {
      try {
        // Fetch all circles
        const circlesSnap = await getDocs(collection(db, 'circles'));
        // Check membership subcollection in parallel
        const membershipPromises = circlesSnap.docs.map(async (cDoc) => {
          const memberSnap = await getDoc(
            doc(db, 'circles', cDoc.id, 'members', user.uid)
          );
          return memberSnap.exists() ? cDoc.id : null;
        });

        const results = await Promise.all(membershipPromises);
        const ids = results.filter((id): id is string => Boolean(id));
        setCircleIds(ids);
      } catch (fetchErr: any) {
        console.error('Error fetching circle memberships:', fetchErr);
        setError('Failed to load your circle memberships.');
        setLoading(false);
      }
    })();
  }, [authReady, user]);

  // 3️⃣ Subscribe to notifications when circleIds update
  useEffect(() => {
    if (!user || circleIds.length === 0) {
      // Nothing to subscribe to or no memberships
      // If memberships loaded but array empty, stop loading
      if (authReady && circleIds.length === 0) {
        setLoading(false);
      }
      return;
    }

    setError('');

    // Build an 'in' query on notifications for user’s circles
    const notifQuery = query(
      collection(db, 'notifications'),
      where('circleId', 'in', circleIds),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        const notifs: NotificationRecord[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<NotificationRecord, 'id'>)
        }));
        setNotifications(notifs);
        setLoading(false);
      },
      (subErr) => {
        console.error('Notifications subscription error:', subErr);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    );

    // Cleanup Firestore listener on unmount or circleIds change
    return () => unsubscribe();
  }, [authReady, user, circleIds]);

  // Render UI states
  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner />
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
