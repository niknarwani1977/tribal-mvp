// src/pages/CircleDetails.tsx
// Component to manage a specific circle: view members and pending invites,
// allowing circle owners to revoke or delete invites.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  doc,
  onSnapshot,
  collection,
  onSnapshot as onCollectionSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Data shapes for TypeScript
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
  revokedAt?: any;
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

    // 1️⃣ Subscribe to the circle document for changes
    const circleRef = doc(db, 'circles', circleId);
    const unsubCircle = onSnapshot(circleRef, snap => {
      if (snap.exists()) {
        setCircle({ id: snap.id, ...(snap.data() as any) });
      } else {
        // Redirect if the circle no longer exists
        navigate('/circles');
      }
    });

    // 2️⃣ Subscribe to members subcollection
    const membersCol = collection(db, 'circles', circleId, 'members');
    const unsubMembers = onCollectionSnapshot(membersCol, snap => {
      setMembers(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Member))
      );
    });

    // 3️⃣ Subscribe to invites subcollection
    const invitesCol = collection(db, 'circles', circleId, 'invites');
    const unsubInvites = onCollectionSnapshot(invitesCol, snap => {
      setInvites(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Invite))
      );
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubCircle();
      unsubMembers();
      unsubInvites();
    };
  }, [user, circleId, navigate]);

  // Determine if current user is the circle owner
  const isOwner = circle?.ownerId === user?.uid;

  /**
   * Remove a member from this circle.
   * Only circle owners (other than themselves) can remove members.
   */
  const handleRemoveMember = async (memberId: string) => {
    if (!isOwner || !circleId) return;
    if (memberId === circle!.ownerId) return; // Prevent removing the owner
    await deleteDoc(doc(db, 'circles', circleId, 'members', memberId));
  };

  /**
   * Revoke an invite by updating its status to 'revoked'.
   * The invite remains in the list until explicitly deleted.
   */
  const handleRevokeInvite = async (inviteId: string) => {
    if (!isOwner || !circleId) return;
    const inviteRef = doc(db, 'circles', circleId, 'invites', inviteId);
    await updateDoc(inviteRef, {
      status: 'revoked',
      revokedAt: serverTimestamp()
    });
  };

  /**
   * Delete an invite document entirely so it no longer appears.
   */
  const handleDeleteInvite = async (inviteId: string) => {
    if (!isOwner || !circleId) return;
    await deleteDoc(doc(db, 'circles', circleId, 'invites', inviteId));
  };

  // Require login to view details
  if (!user) {
    return <div className="p-4">Please log in to view circle details.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Circle: {circle?.name || 'Loading…'}
      </h2>

      {/* Members Section */}
      <section className="mb-6">
        <h3 className="text-xl font-medium">Members</h3>
        <ul className="mt-2 space-y-2">
          {members.map(m => (
            <li key={m.id} className="flex justify-between items-center">
              <span>
                {m.id} — <em>{m.role}</em>
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
            <li
              key={inv.id}
              className="flex justify-between items-center"
            >
              <span>
                {inv.email} — <em>{inv.status}</em>
              </span>
              {isOwner && (
                <div className="flex gap-2">
                  {inv.status === 'pending' && (
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="text-yellow-600 hover:underline text-sm"
                    >
                      Revoke
                    </button>
                  )}
                  {(inv.status === 'pending' || inv.status === 'revoked') && (
                    <button
                      onClick={() => handleDeleteInvite(inv.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CircleDetails;
