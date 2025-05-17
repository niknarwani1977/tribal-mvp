// src/pages/TrustedCircles.tsx
// Component to list circles owned by the user and manage invites
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const TrustedCircles: React.FC = () => {
  const navigate = useNavigate();
  const [circles, setCircles] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    // Log the current user ID for debugging
    console.log('TrustedCircles: current user', user.uid);
    // Query circles where the current user is the owner
    const q = query(collection(db, 'circles'), where('ownerId', '==', user.uid));
    // Subscribe to real-time updates
    const unsub = onSnapshot(q, snap => {
      const cs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      console.log('TrustedCircles: fetched circles', cs);
      setCircles(cs);
    });
    return unsub;
  }, [user]);

  // Remove an invite by deleting the invite document
  const revokeInvite = async (circleId: string, inviteId: string) => {
    await deleteDoc(doc(db, 'circles', circleId, 'invites', inviteId));
  };

  // Prompt unauthenticated users to log in
  if (!user) {
    return (
      <div className="p-4 text-center">
        Please <button onClick={() => navigate('/login')} className="text-blue-600 underline">log in</button> to see your circles.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Circles</h2>
      {circles.length === 0 ? (
        <div className="text-gray-600">
          You have no circles yet.{' '}
          <button
            className="text-blue-600 underline"
            onClick={() => navigate('/create-circle')}
          >
            Create your first circle
          </button>
          .
        </div>
      ) : (
        circles.map(c => (
          <div key={c.id} className="mb-6 p-4 border rounded">
            <h3 className="font-medium text-lg">{c.name}</h3>
            <div className="mt-2">
              <strong>Invites:</strong>
              <InvitesList circleId={c.id} onRevoke={revokeInvite} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Component to display list of invites for a circle
const InvitesList: React.FC<{ circleId: string; onRevoke: (c: string, i: string) => void }> = ({ circleId, onRevoke }) => {
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to the invites subcollection under this circle
    const q = collection(db, 'circles', circleId, 'invites');
    const unsub = onSnapshot(q, snap =>
      setInvites(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    );
    return unsub;
  }, [circleId]);

  if (invites.length === 0) {
    // Empty state if there are no pending invites
    return <div className="text-gray-500 mt-2">No pending invites.</div>;
  }

  return (
    <ul className="mt-2 space-y-2">
      {invites.map(inv => (
        <li key={inv.id} className="flex justify-between items-center">
          <span>
            {inv.email} <span className="text-sm text-gray-500">({inv.status})</span>
          </span>
          <button onClick={() => onRevoke(circleId, inv.id)} className="text-red-500">
            Revoke
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TrustedCircles;
