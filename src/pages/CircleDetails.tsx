// src/pages/CircleDetails.tsx
// Component to manage a specific circle: view and remove members and invites
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  doc,
  onSnapshot,
  collection,
  onSnapshot as onCollectionSnapshot,
  deleteDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

interface Member {
  id: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: any;
}

interface Invite {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'revoked';
  token: string;
  invitedBy: string;
  sentAt: any;
}

interface Circle {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
}

const CircleDetails: React.FC = () => {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !circleId) return;
    // Subscribe to circle doc
    const circleRef = doc(db, 'circles', circleId);
    const unsubCircle = onSnapshot(circleRef, snap => {
      if (snap.exists()) {
        setCircle({ id: snap.id, ...(snap.data() as any) });
      } else {
        // Circle deleted or not found
        navigate('/circles');
      }
    });

    // Subscribe to members subcollection
    const membersCol = collection(db, 'circles', circleId, 'members');
    const unsubMembers = onCollectionSnapshot(membersCol, snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Member)));
    });

    // Subscribe to invites subcollection
    const invitesCol = collection(db, 'circles', circleId, 'invites');
    const unsubInvites = onCollectionSnapshot(invitesCol, snap => {
      setInvites(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Invite)));
    });

    return () => {
      unsubCircle();
      unsubMembers();
      unsubInvites();
    };
  }, [user, circleId, navigate]);

  // Only circle owner can manage
  const isOwner = circle?.ownerId === user?.uid;

  // Remove a member from the circle
  const handleRemoveMember = async (memberId: string) => {
    if (!isOwner || !circleId) return;
    if (memberId === circle!.ownerId) return; // Prevent removing owner
    await deleteDoc(doc(db, 'circles', circleId, 'members', memberId));
  };

  // Revoke a pending invite
  const handleRevokeInvite = async (inviteId: string) => {
    if (!isOwner || !circleId) return;
    await deleteDoc(doc(db, 'circles', circleId, 'invites', inviteId));
  };

  if (!user) {
    return <div className="p-4">Please log in to view circle details.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Circle: {circle?.name}</h2>

      {/* Members Section */}
      <section className="mb-6">
        <h3 className="text-xl font-medium">Members</h3>
        <ul className="mt-2 space-y-2">
          {members.map(m => (
            <li key={m.id} className="flex justify-between items-center">
              <span>
                {m.id} - <em>{m.role}</em>
              </span>
              {isOwner && m.id !== circle?.ownerId && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Invites Section */}
      <section>
        <h3 className="text-xl font-medium">Invites</h3>
        <ul className="mt-2 space-y-2">
          {invites.map(inv => (
            <li key={inv.id} className="flex justify-between items-center">
              <span>
                {inv.email} - <em>{inv.status}</em>
              </span>
              {isOwner && inv.status === 'pending' && (
                <button
                  onClick={() => handleRevokeInvite(inv.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CircleDetails;
