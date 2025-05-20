// src/pages/TrustedCircles.tsx
// Lists all circles the signed-in user belongs to by querying
// every circles/*/members subcollection for docs whose ID == current user UID.

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
    let unsubscribeMembers: (() => void) | null = null;

    // 1️⃣ Listen to auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Not signed in → send to login
        navigate('/login');
        return;
      }

      // Signed in → build a collectionGroup query on members where docID == user.uid
      const membersQ = query(
        collectionGroup(db, 'members'),
        where('__name__', '==', user.uid)
      );

      // 2️⃣ Subscribe to real-time member docs
      //    Unsubscribe any previous listener first
      if (unsubscribeMembers) unsubscribeMembers();

      unsubscribeMembers = onSnapshot(
        membersQ,
        async (snapshot) => {
          try {
            // 3️⃣ For each member doc, fetch its parent circle
            const circlesData = await Promise.all(
              snapshot.docs.map(async (memDoc) => {
                // memDoc.ref.parent is the 'members' collection
                // memDoc.ref.parent.parent is the circle doc reference
                const circleRef = memDoc.ref.parent.parent as DocumentReference;
                const circleSnap = await getDoc(circleRef);
                if (!circleSnap.exists()) return null;
                const data = circleSnap.data();
                return {
                  id: circleRef.id,
                  name: data.name as string,
                  ownerId: data.ownerId as string,
                } as Circle;
              })
            );

            // Filter out any nulls and update state
            setCircles(circlesData.filter(Boolean));
            setLoading(false);
          } catch (err: any) {
            console.error('Error loading circles:', err);
            setError('Failed to load your circles.');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Membership subscription error:', err);
          setError('Failed to load your circles.');
          setLoading(false);
        }
      );
    });

    // Cleanup both listeners on unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeMembers) unsubscribeMembers();
    };
  }, [navigate]);

  // Render
  if (loading) {
    return <div className="p-6 text-center">Loading your circles…</div>;
  }
  if (error) {
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
