"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { generatePresignedUrl, uploadToS3, registerImage, generateCaptions } from '@/lib/pipeline';

export default function UploadPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [captions, setCaptions] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    getUser();
  }, [supabase.auth]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerateCaptions = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setCaptions([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token;
      if (!supabaseToken) throw new Error("Authentication token not found.");

      setStatus('Step 1/4: Generating presigned URL...');
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(selectedFile.type, supabaseToken);

      setStatus('Step 2/4: Uploading to S3...');
      await uploadToS3(presignedUrl, selectedFile);

      setStatus('Step 3/4: Registering image...');
      const { imageId } = await registerImage(cdnUrl, supabaseToken);

      setStatus('Step 4/4: Generating captions...');
      const generatedCaptions = await generateCaptions(imageId, supabaseToken);
      setCaptions(generatedCaptions);
      setStatus('Done!');

    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setStatus('');
    } finally {
      setIsUploading(false);
    }
  };

  if (loadingUser) {
    return <div className="bg-[#b5c7eb] min-h-screen"></div>;
  }

  return (
    <div className="min-h-screen bg-[#b5c7eb] font-mono flex items-center justify-center p-4">
      {!user ? (
        <div className="bg-white border-4 border-black p-[15px] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="mb-6 text-lg">Please log in to continue.</p>
          <Link href="/" className="text-blue-500 hover:underline">Back to Home</Link>
        </div>
      ) : (
        <div className="w-[600px] bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center">
          {previewUrl && (
            <div className="w-64 h-64 mb-4">
              <img src={previewUrl} alt="Image preview" className="w-full h-full object-cover border-4 border-black" />
            </div>
          )}
          <div className="flex gap-4 mb-4">
            <label className="py-3 px-6 bg-gray-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer">
              Choose Image
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <button
              onClick={handleGenerateCaptions}
              disabled={!selectedFile || isUploading}
              className="py-3 px-6 bg-green-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
            >
              {isUploading ? 'Generating...' : 'Generate Captions'}
            </button>
          </div>
          {status && <p className="mb-4">{status}</p>}
          {captions && captions.length > 0 && (
            <div className="w-full mt-4">
              <h3 className="text-xl font-bold mb-2">Generated Captions:</h3>
              <ul className="border-4 border-black p-4 bg-gray-100">
                {captions.map((caption, index) => (
                  <li key={index} className="mb-2 p-2 border-b-2 border-black">{caption.content}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
