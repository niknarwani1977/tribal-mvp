import { useState, useEffect, FormEvent } from 'react';
import { User, Camera, Mail, MapPin, Building, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../utils/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  tribe: string;
  location: string;
  bio: string;
}

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: '',
    tribe: '',
    location: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProfile({
            displayName: userDoc.data().displayName || '',
            email: currentUser.email || '',
            photoURL: userDoc.data().photoURL || '',
            tribe: userDoc.data().tribe || '',
            location: userDoc.data().location || '',
            bio: userDoc.data().bio || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;

    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      setError('Photo must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const storageRef = ref(storage, `profile-photos/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL
      });
      
      await updateUserProfile(profile.displayName, photoURL);
      
      setProfile(prev => ({ ...prev, photoURL }));
      setSuccess('Photo updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: profile.displayName,
        tribe: profile.tribe,
        location: profile.location,
        bio: profile.bio
      });

      await updateUserProfile(profile.displayName, profile.photoURL);
      
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-primary-600 px-6 py-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-primary-100">
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-4 text-primary-600" />
                  )}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-neutral-50"
                >
                  <Camera className="h-5 w-5 text-primary-600" />
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-white">
                {profile.displayName || 'Your Profile'}
              </h1>
              <p className="text-primary-100">{profile.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-error-100 text-error-700 p-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-success-100 text-success-700 p-3 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700">
                  Display Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="input pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    disabled
                    className="input pl-10 bg-neutral-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tribe" className="block text-sm font-medium text-neutral-700">
                  Tribe/Nation
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="tribe"
                    value={profile.tribe}
                    onChange={(e) => setProfile({ ...profile, tribe: e.target.value })}
                    className="input pl-10"
                    placeholder="Your tribe or nation"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700">
                  Location
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="input pl-10"
                    placeholder="Your location"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-neutral-700">
                  Bio
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-neutral-400" />
                  </div>
                  <textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="input pl-10"
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;