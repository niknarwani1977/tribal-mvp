// src/pages/TrustedCircles.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
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

export default function TrustedCircles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Wait for auth
    const unsubAuth = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // 2️⃣ Fetch all circles
        const circleDocs = await getDocs(collection(db, 'circles'));
        const joined: Circle[] = [];

        // 3️⃣ Check the 'users' subcollection for membership
        await Promise.all(circleDocs.docs.map(async (cDoc) => {
          const data = cDoc.data() as any;
          const mSnap = await getDoc(
            doc(db, 'circles', cDoc.id, 'users', user.uid)
          );
          if (mSnap.exists()) {
            joined.push({
              id: cDoc.id,
              name: data.name,
              ownerId: data.ownerId,
            });
          }
        }));

        setCircles(joined);
      } catch (e: any) {
        console.error('TrustedCircles load error:', e);
        setError('Failed to load your circles.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center">Loading your circles…</div>;
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Your Circles</h2>

      {/* Always show create button once authenticated */}
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
            <li key={c.id} className="p-4 bg-white rounded shadow flex justify-between">
              <span>{c.name}</span>
              <button
                onClick={() => navigate(`/circles/${c.id}`)}
                className="text-blue-600 underline"
              >
                Manage
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
