// src/pages/TrustedCircles.tsx
// Lists all circles the signed-in user belongs to by querying the
// 'members' subcollections across every circle (collectionGroup).

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';

interface Circle {
  id: string;
  name: string;
  ownerId: string;
}

const TrustedCircles: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Wait for auth state
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        // If not logged in, send them to /login
        navigate('/login');
        return;
      }

      // 2️⃣ Query ALL 'members' docs where docID == current user UID
      //    This uses a collectionGroup query across circles/*/members
      const membersQ = query(
        collectionGroup(db, 'members'),
        where('__name__', '==', user.uid)
      );

      // 3️⃣ Subscribe to real-time changes
      const unsubscribeMembers = onSnapshot(
        membersQ,
        async (snapshot) => {
          try {
            // For each membership doc, fetch its parent circle
            const circlePromises = snapshot.docs.map(async (memDoc) => {
              // memDoc.ref.parent = .../members
              // memDoc.ref.parent.parent = circles/{circleId}
              const circleRef = memDoc.ref.parent.parent;
              if (!circleRef) return null;
              const circleSnap = await getDoc(circleRef);
              if (!circleSnap.exists()) return null;

              const data = circleSnap.data();
              return {
                id: circleRef.id,
                name: data.name as string,
                ownerId: data.ownerId as string,
              };
            });

            const loaded = (await Promise.all(circlePromises)).filter(
              Boolean
            ) as Circle[];

            setCircles(loaded);
            setLoading(false);
          } catch (err: any) {
            console.error('Error loading circles:', err);
            setError('Failed to load your circles.');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Membership query failed:', err);
          setError('Failed to load your circles.');
          setLoading(false);
        }
      );

      // 4️⃣ Cleanup when component unmounts
      return () => unsubscribeMembers();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

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
      <h2 className="text-xl font-semibold mb-4 text-[#004b6e]">
        Your Circles
      </h2>

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
