// src/pages/AddFamilyMember.tsx

import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import ImageUpload from '../components/ImageUpload'; // Image uploader component

const AddFamilyMember: React.FC = () => {
  // State for family member form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('Child'); // Default role
  const [photoURL, setPhotoURL] = useState<string | null>(null); // Stores uploaded image URL
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) throw new Error("User document not found");

      const circleId = userDoc.data().circleId;
      if (!circleId) throw new Error("User is not part of a circle");

      // Add the new family member to Firestore under the current user's circle
      await addDoc(collection(db, 'familyMembers'), {
        name,
        age,
        role,
        photoURL: photoURL || '', // Add uploaded photo URL if available
        circleId,
        createdBy: user.uid,
        createdAt: new Date()
      });

      alert("Family member added!");
      setName('');
      setAge('');
      setRole('Child');
      setPhotoURL(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Add Family Member</h2>
          <p className="text-sm text-gray-600">Record details and upload a photo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Age input */}
          <input
            type="number"
            placeholder="Age"
            className="w-full px-3 py-2 border rounded"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />

          {/* Role dropdown */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Child">Child</option>
            <option value="Parent">Parent</option>
            <option value="Guardian">Guardian</option>
          </select>

          {/* Upload photo */}
          <ImageUpload onUpload={(url) => setPhotoURL(url)} />

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-[#004b6e] text-white py-2 rounded hover:bg-[#003b56]"
          >
            Save Member
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddFamilyMember;
