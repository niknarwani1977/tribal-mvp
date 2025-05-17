// src/pages/TrustedCircles.tsx
// Component to list circles owned by the user and manage invites
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const TrustedCircles: React.FC = () => {
  const [circles, setCircles] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    // Query circles where current user is owner
    const q = query(collection(db, 'circles'), where('ownerId', '==', user.uid));
    // Subscribe to real-time updates
    const unsub = onSnapshot(q, snap => {
      setCircles(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });
    return unsub;
  }, [user]);

  // Remove an invite by deleting the invite doc
  const revokeInvite = async (circleId: string, inviteId: string) => {
    await deleteDoc(doc(db, 'circles', circleId, 'invites', inviteId));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Circles</h2>
      {circles.map(c => (
        <div key={c.id} className="mb-6 p-4 border rounded">
          <h3 className="font-medium">{c.name}</h3>
          <div className="mt-2">
            <strong>Invites:</strong>
            <InvitesList circleId={c.id} onRevoke={revokeInvite} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Component to display list of invites for a circle
const InvitesList: React.FC<{ circleId: string; onRevoke: (c: string, i: string) => void }> = ({ circleId, onRevoke }) => {
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to invites subcollection
    const q = collection(db, 'circles', circleId, 'invites');
    const unsub = onSnapshot(q, snap =>
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))
    );
    return unsub;
  }, [circleId]);

  return (
    <ul>
      {invites.map(inv => (
        <li key={inv.id} className="flex justify-between items-center">
          <span>{inv.email} ({inv.status})</span>
          <button onClick={() => onRevoke(circleId, inv.id)} className="text-red-500">
            Revoke
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TrustedCircles;
