// src/pages/CreateCircle.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

const CreateCircle: React.FC = () => {
  const [circleName, setCircleName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateCircle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in');

      // Create a new circle in Firestore
      const circleRef = await addDoc(collection(db, "circles"), {
        name: circleName,
        createdByUID: user.uid,
        createdAt: new Date()
      });

      // Update the user's Firestore document to reference the new circle
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        circleId: circleRef.id
      });

      alert("Circle created successfully!");
      navigate('/'); // Redirect to home or dashboard
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fef9f4]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create a New Circle</h2>
          <p className="mt-2 text-sm text-gray-600">Build your trusted group today.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleCreateCircle}>
          <div className="space-y-4">
            <div>
              <label htmlFor="circleName" className="sr-only">Circle Name</label>
              <input
                id="circleName"
                name="circleName"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#004b6e] focus:border-[#004b6e] focus:z-10 sm:text-sm"
                placeholder="Enter Circle Name"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#004b6e] hover:bg-[#003b56] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004b6e]"
            >
              Create Circle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCircle;
