// Import necessary React and Firebase libraries
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

// Define the structure of a family member object
interface FamilyMember {
  id: string;
  name: string;
  age: string;
  role: string;
  photoURL?: string; // optional field for profile photo
}

const ManageFamily: React.FC = () => {
  // Store fetched members and any error message
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [error, setError] = useState('');

  // Fetch family members after component mounts
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Get currently logged-in user
        const user = auth.currentUser;
        if (!user) throw new Error("User not logged in");

        // Fetch user document from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) throw new Error("User document not found");

        // Extract user's circleId to fetch related family members
        const circleId = userDoc.data().circleId;
        if (!circleId) throw new Error("No circleId assigned");

        // Query family members where circleId matches
        const q = query(
          collection(db, "familyMembers"),
          where("circleId", "==", circleId)
        );

        const snapshot = await getDocs(q);

        // Map the documents to usable state
        const list: FamilyMember[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<FamilyMember, "id">),
        }));

        // Save data in local state
        setMembers(list);
      } catch (err: any) {
        console.error(err);
        setError(err.message); // Show readable error to user
      }
    };

    fetchMembers(); // Call fetch on initial render
  }, []);

  // Handle deletion of a family member
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this family member?")) return;

    try {
      // Delete the document in Firestore
      await deleteDoc(doc(db, "familyMembers", id));
      // Remove the deleted member from local state
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err: any) {
      console.error(err);
      setError("Failed to delete member.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fef9f4] px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#004b6e]">Manage Family Members</h1>

      {/* Error message if anything went wrong */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Show a message if no members have been added */}
      {members.length === 0 ? (
        <p className="text-center text-gray-600">No family members added yet.</p>
      ) : (
        // Display list of members
        <ul className="space-y-4">
          {members.map(member => (
            <li
              key={member.id}
              className="bg-white rounded-lg p-4 shadow flex items-center justify-between border"
            >
              <div className="flex items-center space-x-4">
                {/* Optional profile image */}
                {member.photoURL && (
                  <img
                    src={member.photoURL}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{member.name}</h2>
                  <p className="text-sm text-gray-600">
                    {member.role} • Age: {member.age}
                  </p>
                </div>
              </div>

              {/* Action buttons for Edit/Delete */}
              <div className="flex gap-3">
                <button className="text-blue-600 text-sm">Edit</button>
                <button
                  className="text-red-600 text-sm"
                  onClick={() => handleDelete(member.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageFamily;
