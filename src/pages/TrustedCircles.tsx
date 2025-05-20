// src/pages/TrustedCircles.tsx
// Lists all circles the signed-in user belongs to by querying
// the 'members' subcollections across all circles (collectionGroup).
// Includes debug logs to trace auth and snapshot events.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  getDoc,
  DocumentReference,
} from 'firebase/firestore';

interface Circle {
  id: string;
  name: string;
  ownerId: string;
}

const TrustedCircles: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('TrustedCircles: component mounted');
    let unsubscribeMembers: (() => void) | null = null;

    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log('TrustedCircles: auth state changed:', user?.uid || 'no user');

      if (!user) {
        // If not signed in, redirect to login
        console.log('TrustedCircles: user not authenticated, redirecting');
        navigate('/login');
        return;
      }

      // User is signed in, query membership docs where doc ID == user.uid
      const membersQ = query(
        collectionGroup(db, 'members'),
        where('__name__', '==', user.uid)
      );

      // Clean up any previous listener
      if (unsubscribeMembers) unsubscribeMembers();

      // Subscribe to real-time updates for the membership query
      unsubscribeMembers = onSnapshot(
        membersQ,
        async (snapshot) => {
          console.log('TrustedCircles: membership snapshot received, count=', snapshot.docs.length);
          try {
            // For each membership document, fetch its parent circle doc
            const loadedCircles = await Promise.all(
              snapshot.docs.map(async (memDoc) => {
                const circleRef = memDoc.ref.parent.parent as DocumentReference;
                console.log('TrustedCircles: fetching circle:', circleRef.id);
                const circleSnap = await getDoc(circleRef);
                if (!circleSnap.exists()) {
                  console.warn('TrustedCircles: circle does not exist:', circleRef.id);
                  return null;
                }
                const data = circleSnap.data();
                return {
                  id: circleRef.id,
                  name: data.name as string,
                  ownerId: data.ownerId as string,
                } as Circle;
              })
            );

            // Filter out nulls and update state
            const validCircles = loadedCircles.filter(Boolean) as Circle[];
            console.log('TrustedCircles: loaded circles:', validCircles);
            setCircles(validCircles);
            setLoading(false);
          } catch (err: any) {
            console.error('TrustedCircles: error loading circles:', err);
            setError('Failed to load your circles.');
            setLoading(false);
          }
        },
        (err) => {
          console.error('TrustedCircles: subscription error:', err);
          setError('Failed to load your circles.');
          setLoading(false);
        }
      );
    });

    // Cleanup listeners on unmount
    return () => {
      console.log('TrustedCircles: cleanup');
      unsubscribeAuth();
      if (unsubscribeMembers) unsubscribeMembers();
    };
  }, [navigate]);

  // Render based on state
  if (loading) {
    console.log('TrustedCircles: still loading...');
    return <div className="p-6 text-center">Loading your circles…</div>;
  }
  if (error) {
    console.log('TrustedCircles: error state:', error);
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-[#004b6e]">Your Circles</h2>
      {circles.length === 0 ? (
        <div className="text-center">
          <p>You have no circles yet.</p>
          <button
            onClick={() => navigate('/create-circle')}
            className="mt-3 px-4 py-2 bg-[#004b6e] text-white rounded-md hover:bg-[#003b56]"
          >
            Create your first circle
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {circles.map((c) => (
            <li
              key={c.id}
              className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center"
            >
              <span className="font-medium">{c.name}</span>
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
