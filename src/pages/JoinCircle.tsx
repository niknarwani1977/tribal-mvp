// src/pages/JoinCircle.tsx
// Page to accept a circle invite via token
//  • Reads the token from the URL
//  • If not signed in, prompts to sign in with Google (in-place)
//  • Once signed in, finds the invite, adds you as a member, marks it accepted
//  • Redirects you back to /circles when done

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import {
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const JoinCircle: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  // status: loading → needSignIn → error → success
  const [status, setStatus] = useState<'loading'|'needSignIn'|'error'|'success'>('loading');
  const [message, setMessage] = useState<string>('');

  // Kick off the join flow whenever auth state changes
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No invite token provided.');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not signed in yet
        setStatus('needSignIn');
        return;
      }

      // Signed in – proceed to join
      setStatus('loading');
      try {
        // 1️⃣ Find the invite doc by token across ALL circles/*/invites
        const invitesRef = collectionGroup(db, 'invites');
        const q = query(invitesRef, where('token', '==', token));
        const snap = await getDocs(q);

        if (snap.empty) {
          throw new Error('Invite not found or already used.');
        }
        const inviteDoc = snap.docs[0];

        // 2️⃣ Derive the circle ID from the invite’s path
        const circleId = inviteDoc.ref.parent.parent!.id;

        // 3️⃣ Create membership under circles/{circleId}/members/{user.uid}
        await setDoc(doc(db, 'circles', circleId, 'members', user.uid), {
          role: 'member',
          joinedAt: serverTimestamp(),
        });

        // 4️⃣ Mark the invite as accepted
        await updateDoc(inviteDoc.ref, { status: 'accepted' });

        // Done!
        setStatus('success');
        setMessage('🎉 You’ve joined the circle! Redirecting…');
        setTimeout(() => navigate('/circles'), 2000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred.');
      }
    });

    return unsubscribe;
  }, [token, navigate]);

  // Handler to pop up Google login without leaving the page
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will fire again and pick up the join logic
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      setStatus('error');
      setMessage('Google sign-in failed. Please try again.');
    }
  };

  // Render based on status
  if (status === 'loading') {
    return <div className="p-6 text-center">Joining circle…</div>;
  }
  if (status === 'needSignIn') {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">You need to sign in to accept your invite.</p>
        <button
          onClick={handleGoogleSignIn}
          className="px-6 py-2 bg-[#004b6e] text-white rounded-md hover:bg-[#003b56]"
        >
          Sign in with Google
        </button>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error: {message}</p>
      </div>
    );
  }
  if (status === 'success') {
    return (
      <div className="p-6 text-center text-green-600">
        <p>{message}</p>
      </div>
    );
  }
  return null;
};

export default JoinCircle;
