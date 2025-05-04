// src/components/ImageUpload.tsx

import React, { useState } from 'react';
import { storage } from '../firebase'; // Firebase Storage instance
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Props for this component: expects a function to call with the image URL after upload
interface ImageUploadProps {
  onUpload: (url: string) => void; // Callback after upload completes
}

// ImageUpload component handles selecting and uploading an image to Firebase Storage
const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  // Local state to track file selection
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  // Triggered when user clicks the "Upload Photo" button
  const handleUpload = () => {
    if (!file) return;

    // Create a Firebase Storage reference with a path based on the file name
    const storageRef = ref(storage, `familyMembers/${file.name}`);
    
    // Start the upload
    const uploadTask = uploadBytesResumable(storageRef, file);
    setUploading(true);

    // Listen for state changes (progress, errors, and completion)
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate and update upload progress
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
      },
      () => {
        // Once the upload completes, retrieve the public download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploading(false);
          onUpload(downloadURL); // Call parent with uploaded image URL
        });
      }
    );
  };

  return (
    <div className="space-y-2">
      {/* File input field */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* Upload button */}
      <button
        type="button"
        className="bg-[#004b6e] text-white px-4 py-2 rounded hover:bg-[#003b56]"
        onClick={handleUpload}
        disabled={!file || uploading} // Disable if no file or already uploading
      >
        {uploading ? `Uploading... (${progress}%)` : 'Upload Photo'}
      </button>

      {/* Optional success message */}
      {progress > 0 && !uploading && <p className="text-sm text-gray-600">Upload complete!</p>}
    </div>
  );
};

export default ImageUpload;
