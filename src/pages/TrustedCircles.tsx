// src/pages/TrustedCircles.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface Circle {
  id: string;
  name: string;
  ownerId: string;
}

/**
 * TrustedCircles
 * --------------
 * Lists all circles the current user owns or belongs to.
 * Logs debug info for each circle to help diagnose membership issues.
 */
const TrustedCircles: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        // If not authenticated, redirect to login
        navigate('/login');
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Fetch all circles
        const circleSnapshot = await getDocs(collection(db, 'circles'));
        const joined: Circle[] = [];

        // Check ownership or membership for each circle
        for (const circleDoc of circleSnapshot.docs) {
          const data = circleDoc.data() as any;
          const circleId = circleDoc.id;

          // Owner check
          const isOwner = data.ownerId === user.uid;
          // Membership check in 'members' subcollection
          const memberSnap = await getDoc(
            doc(db, 'circles', circleId, 'members', user.uid)
          );
          const isMember = memberSnap.exists();

          // Debug log
          console.log(
            `Circle ${circleId}: name=${data.name}, ownerId=${data.ownerId}, isOwner=${isOwner}, isMember=${isMember}`
          );

          // Include if owner or member
          if (isOwner || isMember) {
            joined.push({
              id: circleId,
              name: data.name,
              ownerId: data.ownerId,
            });
          }
        }

        // Final joined list debug
        console.log('Final joined circles:', joined.map(c => c.id));
        setCircles(joined);
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
    return (
      <div className="p-6 text-center">Loading your circles…</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">{error}</div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Your Circles</h2>

      {/* Create Circle button always visible when signed-in */}
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
          {circles.map(c => (
            <li
              key={c.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
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
