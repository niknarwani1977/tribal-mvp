// src/pages/JoinCircle.tsx
// Page that handles accepting a circle-invite via a token link.
// 1. Reads the `token` query parameter.
// 2. Waits for the user to be authenticated (redirects to login if not).
// 3. Finds the matching invite in Firestore.
// 4. Adds the current user as a member of the invited circle.
// 5. Marks the invite document as “accepted”.
// 6. Redirects the user into the Circles list.

// React / Router imports
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Firebase imports
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
  // Grab the `token` from the URL: /join-circle?token=...
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const navigate = useNavigate();

  // Track current state of the join flow
  const [status, setStatus] = useState<
    'loading' | 'unauthenticated' | 'error' | 'success'
  >('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // If no token provided, error out immediately
    if (!token) {
      setStatus('error');
      setMessage('No invite token provided.');
      return;
    }

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If user is not signed in, prompt them to login
      if (!user) {
        setStatus('unauthenticated');
        return;
      }

      // User is signed in, proceed to accept the invite
      setStatus('loading');
      try {
        // 1️⃣ Query all "invites" subcollections for a matching token
        const invitesQuery = query(
          collectionGroup(db, 'invites'),
          where('token', '==', token)
        );
        const inviteSnap = await getDocs(invitesQuery);

        if (inviteSnap.empty) {
          throw new Error('Invite not found or already used.');
        }

        // We take the first matching document
        const inviteDoc = inviteSnap.docs[0];

        // Retrieve the parent circle ID from the document path:
        // path: /circles/{circleId}/invites/{inviteId}
        const circleId = inviteDoc.ref.parent.parent!.id;

        // 2️⃣ Add the user to the members subcollection of that circle
        const memberRef = doc(db, 'circles', circleId, 'members', user.uid);
        await setDoc(memberRef, {
          role: 'member',
          joinedAt: serverTimestamp(),
        });

        // 3️⃣ Mark the invite as accepted so it can’t be reused
        await updateDoc(inviteDoc.ref, { status: 'accepted' });

        // Success! Notify and redirect
        setStatus('success');
        setMessage('You’ve successfully joined the circle! Redirecting…');

        // Wait a moment so the user can see the confirmation
        setTimeout(() => {
          navigate('/circles');
        }, 2000);
      } catch (err: any) {
        // Handle any errors (e.g., network, missing token, Firestore permissions)
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred.');
      }
    });

    // Clean up the auth listener when the component unmounts
    return unsubscribe;
  }, [token, navigate]);

  // Render different UI based on status
  if (status === 'loading') {
    return <div className="p-6 text-center">Joining circle…</div>;
  }
  if (status === 'unauthenticated') {
    return (
      <div className="p-6 text-center">
        <p>
          Please{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 underline"
          >
            sign in
          </button>{' '}
          to accept your invite.
        </p>
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
