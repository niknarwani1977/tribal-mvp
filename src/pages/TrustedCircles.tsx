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
    console.log('TrustedCircles: current user', user.uid);
    const q = query(collection(db, 'circles'), where('ownerId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const cs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      console.log('TrustedCircles: fetched circles', cs);
      setCircles(cs);
    });
    return unsub;
  }, [user]);

  const revokeInvite = async (circleId: string, inviteId: string) => {
    await deleteDoc(doc(db, 'circles', circleId, 'invites', inviteId));
  };

  if (!user) {
    return (
      <div className="p-4 text-center">
        Please{' '}
        <button onClick={() => navigate('/login')} className="text-blue-600 underline">
          log in
        </button>{' '}
        to see your circles.
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with create button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Circles</h2>
        <button
          onClick={() => navigate('/create-circle')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + New Circle
        </button>
      </div>

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
          <div key={c.id} className="mb-6 p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">{c.name}</h3>
              <button
                onClick={() => navigate(`/circles/${c.id}`)}
                className="text-blue-600 hover:underline text-sm"
              >
                Manage
              </button>
            </div>
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
    const q = collection(db, 'circles', circleId, 'invites');
    const unsub = onSnapshot(q, snap =>
      setInvites(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    );
    return unsub;
  }, [circleId]);

  if (invites.length === 0) {
    return <div className="text-gray-500 mt-2">No pending invites.</div>;
  }

  return (
    <ul className="mt-2 space-y-2">
      {invites.map(inv => (
        <li key={inv.id} className="flex justify-between items-center">
          <span>
            {inv.email}{' '}
            <span className="text-sm text-gray-500">({inv.status})</span>
          </span>
          <button
            onClick={() => onRevoke(circleId, inv.id)}
            className="text-red-500 hover:underline text-sm"
          >
            Revoke
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TrustedCircles;
