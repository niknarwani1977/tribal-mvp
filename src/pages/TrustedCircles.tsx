// src/pages/TrustedCircles.tsx
// Component to list circles the signed-in user belongs to by checking each circle's 'members' subcollection.
// This avoids needing a collection-group index by fetching all circles and filtering client-side.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

interface Circle {
  id: string;
  name: string;
  ownerId: string;
}

const TrustedCircles: React.FC = () => {
  // State to hold joined circles
  const [circles, setCircles] = useState<Circle[]>([]);
  // Loading / error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not authenticated => redirect to login
        navigate('/login');
        return;
      }

      try {
        setLoading(true);

        // 1. Fetch all circles
        const circlesSnapshot = await getDocs(collection(db, 'circles'));

        // 2. Filter circles where current user is a member
        const joinedCircles: Circle[] = [];
        for (const circleDoc of circlesSnapshot.docs) {
          const data = circleDoc.data() as any;

          // Check membership subcollection for this user
          const memberRef = doc(db, 'circles', circleDoc.id, 'members', user.uid);
          const memberSnap = await getDoc(memberRef);
          if (memberSnap.exists()) {
            joinedCircles.push({
              id: circleDoc.id,
              name: data.name,
              ownerId: data.ownerId,
            });
          }
        }

        // 3. Update state
        setCircles(joinedCircles);
        setLoading(false);
      } catch (err: any) {
        console.error('TrustedCircles: error fetching circles:', err);
        setError('Failed to load your circles.');
        setLoading(false);
      }
    });

    // Cleanup on unmount
    return () => unsubscribeAuth();
  }, [navigate]);

  // Show loading spinner while fetching
  if (loading) {
    return <div className="p-6 text-center">Loading your circles…</div>;
  }
  // Show error message if fetch failed
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

      {/*
        Robust "Add New Circle" button: always visible once authenticated.
        Navigates to the CreateCircle page/route.
      */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/create-circle')}
          className="px-4 py-2 bg-[#004b6e] text-white rounded-md hover:bg-[#003b56]"
        >
          Add New Circle
        </button>
      </div>

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
