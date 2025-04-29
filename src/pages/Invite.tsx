// src/pages/Invite.tsx
import React, { useState } from 'react';
import { db, auth } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

const Invite: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      // Get the user's Circle ID from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error("User document not found");

      const circleId = userSnap.data().circleId;
      if (!circleId) throw new Error("User does not belong to a Circle");

      // Save the invite to Firestore under "invites" collection
      await addDoc(collection(db, "invites"), {
        email: email.toLowerCase(),
        invitedBy: user.uid,
        circleId: circleId,
        status: "pending",
        createdAt: new Date(),
      });

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-[#004b6e]">Invite to Your Circle</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Friend's Email Address"
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] focus:z-10 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004b6e] hover:bg-[#003b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004b6e]"
          >
            Send Invite
          </button>
        </form>

        {success && (
          <p className="text-green-600 text-center">Invitation sent successfully!</p>
        )}
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Invite;
