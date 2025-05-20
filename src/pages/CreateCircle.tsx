// src/pages/CreateCircle.tsx
// Component to create a new circle, write it to Firestore, and email an invite link via Netlify Function
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const CreateCircle: React.FC = () => {
  // Local form state
  const [name, setName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return; // must be logged in

    // 1️⃣ Create Circle doc
    const circleRef = await addDoc(collection(db, 'circles'), {
      name,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
    const circleId = circleRef.id;

    // 2️⃣ Add owner to members subcollection
    await setDoc(doc(db, 'circles', circleId, 'members', user.uid), {
      role: 'owner',
      joinedAt: serverTimestamp(),
    });

    // 3️⃣ Create invite record in Firestore
    const token = crypto.randomUUID();
    await addDoc(collection(db, 'circles', circleId, 'invites'), {
      email: inviteEmail,
      token,
      invitedBy: user.uid,
      status: 'pending',
      sentAt: serverTimestamp(),
    });

    // 4️⃣ Call Netlify Function to send the email
    try {
      await fetch('/.netlify/functions/sendCircleInvite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
       email: inviteEmail,
       circleName: name,
       token,
       origin: window.location.origin   // <-- include the active URL
   }),
      });
      alert('Circle created & invite email sent! 🚀');
    } catch (err) {
      console.error('Failed to send invite email:', err);
      alert(
        'Circle created, but email failed. Share this link manually:\n' +
        `${window.location.origin}/join-circle?token=${token}`
      );
    }

    // 5️⃣ Navigate back to your circles list
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
