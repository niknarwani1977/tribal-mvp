// src/pages/JoinCircle.tsx
// Component to accept an invite token and join a circle
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collectionGroup, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const JoinCircle: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [status, setStatus] = useState('Joining...');

  useEffect(() => {
    const join = async () => {
      const user = auth.currentUser;
      if (!user) {
        setStatus('Please log in to join a circle.');
        return;
      }
      // Find matching invite document across all circles
      const igQ = query(
        collectionGroup(db, 'invites'),
        where('token', '==', token),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(igQ);
      if (snap.empty) {
        setStatus('Invalid or expired token.');
        return;
      }
      const invDoc = snap.docs[0];
      const circleRef = invDoc.ref.parent.parent!; // circles/{circleId}
      const circleId = circleRef.id;
      // Add current user as editor member
      await setDoc(doc(db, 'circles', circleId, 'members', user.uid), {
        role: 'editor',
        joinedAt: serverTimestamp()
      });
      // Mark invite as accepted
      await updateDoc(invDoc.ref, { status: 'accepted' });
      setStatus('Successfully joined the circle!');
      navigate('/circles');
    };
    join();
  }, [token, navigate]);

  return (
    <div className="p-4">{status}</div>
  );
};

export default JoinCircle;
