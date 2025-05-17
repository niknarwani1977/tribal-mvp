// src/pages/CreateCircle.tsx
// Component to create a new circle and send an invite link
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const CreateCircle: React.FC = () => {
  // Local state for circle name and email invitation
  const [name, setName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return; // Ensure user is authenticated

    // 1. Create a new circle document
    const circlesRef = collection(db, 'circles');
    const circleDoc = await addDoc(circlesRef, {
      name,                   // Name of the circle
      ownerId: user.uid,      // Record owner as current user
      createdAt: serverTimestamp() // Server timestamp for creation
    });
    const circleId = circleDoc.id;

    // 2. Add the owner to the members subcollection
    await setDoc(doc(db, 'circles', circleId, 'members', user.uid), {
      role: 'owner',          // Owner role grants full permissions
      joinedAt: serverTimestamp() // Timestamp when owner joined
    });

    // 3. Generate invite token and write invite document
    const token = crypto.randomUUID();
    await addDoc(collection(db, 'circles', circleId, 'invites'), {
      email: inviteEmail,     // Invitee's email
      token,                  // Unique token for joining
      invitedBy: user.uid,    // Who sent the invite
      status: 'pending',      // Invite status
      sentAt: serverTimestamp() // Timestamp of invite
    });

    // Show link to invite and navigate back to circles list
    alert(`Circle created! Share this link to invite: ${window.location.origin}/join-circle?token=${token}`);
    navigate('/circles');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create New Circle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Circle Name Input */}
        <input
          type="text"
          placeholder="Circle Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        {/* Invite Email Input */}
        <input
          type="email"
          placeholder="Invite Member Email"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
          Create Circle & Invite
        </button>
      </form>
    </div>
  );
};

export default CreateCircle;
