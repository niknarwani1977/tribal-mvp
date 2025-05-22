// src/pages/TrustedCircles.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// Extended Circle interface now includes unread notification count
type Circle = {
  id: string;
  name: string;
  ownerId: string;
  unread: number;
};

/**
 * TrustedCircles
 * --------------
 * Fetches all circles in Firestore and displays only those
 * where the current user is owner or member, with an unread badge.
 */
const TrustedCircles: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        // Redirect unauthenticated users
        navigate('/login');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // 1️⃣ Fetch all circles
        const circleSnapshot = await getDocs(collection(db, 'circles'));
        const joinedBasic = [] as Omit<Circle, 'unread'>[];

        // 2️⃣ Determine owner or membership
        for (const circleDoc of circleSnapshot.docs) {
          const data = circleDoc.data() as any;
          const circleId = circleDoc.id;

          const isOwner = data.ownerId === user.uid;
          const memberSnap = await getDoc(
            doc(db, 'circles', circleId, 'members', user.uid)
          );
          const isMember = memberSnap.exists();

          if (isOwner || isMember) {
            joinedBasic.push({
              id: circleId,
              name: data.name,
              ownerId: data.ownerId
            });
          }
        }

        // 3️⃣ Compute unread notification counts
        const circlesWithUnread = await Promise.all(
          joinedBasic.map(async (c) => {
            const notifSnap = await getDocs(
              query(
                collection(db, 'notifications'),
                where('circleId', '==', c.id)
              )
            );
            // Count those not yet read by this user
            const unreadCount = notifSnap.docs.filter((d) => {
              const rd = (d.data() as any).readBy as string[];
              return !rd?.includes(user.uid);
            }).length;
            return { ...c, unread: unreadCount };
          })
        );

        // Update state
        setCircles(circlesWithUnread);
      } catch (e: any) {
        console.error('Error loading circles:', e);
        setError('Failed to load your circles.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="p-6 text-center">Loading your circles…</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Your Circles</h2>

      {/* Always allow creating new circles */}
      <button
        onClick={() => navigate('/create-circle')}
        className="mb-6 px-4 py-2 bg-blue-700 text-white rounded"
      >
        Add New Circle
      </button>

      {circles.length === 0 ? (
        <div className="text-center">
          <p>You have no circles yet.</p>
          <button
            onClick={() => navigate('/create-circle')}
            className="mt-3 px-4 py-2 bg-blue-700 text-white rounded"
          >
            Create your first circle
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {circles.map((c) => (
            <li
              key={c.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <span className="font-medium flex items-center">
                {c.name}
                {/* Show unread badge if there are new notifications */}
                {c.unread > 0 && (
                  <span className="ml-2 inline-block bg-red-500 text-white text-xs font-semibold rounded-full px-2">
                    {c.unread}
                  </span>
                )}
              </span>
              <button
                onClick={() => navigate(`/circles/${c.id}`)}
                className="text-blue-600 hover:underline"
              >
                Manage
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrustedCircles;
