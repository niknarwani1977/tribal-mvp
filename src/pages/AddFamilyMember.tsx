// src/pages/AddFamilyMember.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { CircleUserRound } from 'lucide-react';

const AddFamilyMember: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      setError('You must be logged in to add a family member.');
      return;
    }

    try {
      // Use built-in crypto API for UUID
      const memberId = crypto.randomUUID();
      const familyRef = doc(db, 'users', user.uid, 'family', memberId);

      await setDoc(familyRef, {
        id: memberId,
        name,
        relationship,
        photoUrl: '', // update this later when handling uploads
      });

      alert('Family member added successfully!');
      navigate('/manage-family');
    } catch (err: any) {
      setError('Error saving family member: ' + err.message);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <CircleUserRound className="mx-auto h-16 w-16 text-[#004b6e]" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Add Family Member</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />

          <input
            type="text"
            placeholder="Relationship"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#004b6e] hover:bg-[#003b56] text-white font-medium py-2 px-4 rounded-md"
          >
            Save Member
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFamilyMember;
