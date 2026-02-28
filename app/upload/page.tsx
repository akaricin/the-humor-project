"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { generatePresignedUrl, uploadToS3, registerImage, generateCaptions, CaptionResult } from '@/lib/pipeline';

export default function UploadPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [captions, setCaptions] = useState<CaptionResult[]>([]);
  const [finalUrl, setFinalUrl] = useState('');
  const [fileError, setFileError] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    getUser();
  }, [supabase.auth]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFileError(true);
      setTimeout(() => setFileError(false), 5000);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCaptions([]);
    setStatus('');
    setFinalUrl('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const startPipeline = async (file: File | null) => {
    if (!file || !user) return;

    setIsUploading(true);
    setCaptions([]);
    setFinalUrl('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token;
      if (!supabaseToken) throw new Error("Authentication token not found.");

      setStatus('Step 1/4: Generating presigned URL...');
      const { presignedUrl, cdnUrl } = await generatePresignedUrl(file.type, supabaseToken);
      setFinalUrl(cdnUrl);

      setStatus('Step 2/4: Uploading to S3...');
      await uploadToS3(presignedUrl, file);

      setStatus('Step 3/4: Registering image...');
      const { imageId } = await registerImage(cdnUrl, supabaseToken);

      setStatus('Step 4/4: Generating captions...');
      const results = await generateCaptions(imageId, supabaseToken);
      
      if (!results) throw new Error("API returned no data");
      
      const finalCaptions = Array.isArray(results) ? (results as unknown as CaptionResult[]) : (results.captions || []);
      setCaptions(finalCaptions.slice(0, 10));
      
      setStatus('Done!');

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("PIPELINE ERROR:", err);
      setStatus(`Error: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
  };

  if (loadingUser) {
    return <div className="bg-[#b5c7eb] min-h-screen"></div>;
  }

  return (
    <>
      {fileError && (
        <div className="fixed top-8 right-8 bg-black border-4 border-black p-[15px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[100]">
          <p className="font-bold uppercase text-[#b5c7eb]">Wrong file type!</p>
        </div>
      )}
      <div className="p-[15px] min-h-screen bg-[#b5c7eb] font-mono flex items-center justify-center p-4 relative">
        {!user ? (
          <div className="bg-white border-4 border-black p-[15px] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <p className="mb-6 text-lg">Want to generate some captions? Please log in to continue.</p>
          </div>
        ) : (
        <div className="p-[15px] flex flex-col lg:flex-row w-full max-w-6xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden lg:h-[80vh]">
          {/* LEFT SIDE: Uploader */}
          <div className="lg:w-1/2 p-6 border-b-4 lg:border-b-0 lg:border-r-4 border-black flex flex-col min-h-[400px]">
            <h2 className="text-2xl font-bold mb-4 uppercase italic">1. Upload Image</h2>
            
            <label
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-4 border-dashed border-gray-400 rounded-xl flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group"
            >
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              
              {previewUrl ? (
                <div className="w-full flex justify-center items-center" style={{ maxHeight: '250px' }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-auto max-w-full object-contain p-2" 
                    style={{ maxHeight: '250px' }} 
                  />
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-xl font-bold mb-2">Drop an image here</p>
                  <p className="text-gray-500">or click to browse</p>
                  <p className="text-xs mt-4 text-gray-400">Supports: JPG, PNG, WEBP, GIF, HEIC</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </label>

            <div className="mt-6">
              <button
                onClick={() => startPipeline(selectedFile)}
                disabled={!selectedFile || isUploading}
                className="w-full py-4 px-6 bg-green-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 font-bold text-xl uppercase tracking-wider"
              >
                {isUploading ? 'Generating...' : 'Generate Captions'}
              </button>
              
              <div className="mt-4">
                {status && (
                  <p className={`mt-2 text-sm font-bold ${status.startsWith('Error') ? 'text-red-500' : 'text-blue-600 animate-pulse'}`}>
                    {status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Results */}
          <div className="lg:w-1/2 p-6 overflow-y-auto bg-gray-50 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 uppercase italic">2. Results</h2>
            
            {captions.length === 0 && !isUploading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-24 h-24 mb-4 border-4 border-black border-dashed rounded-full" />
                <p className="text-xl font-bold">Upload your image to see some captions!</p>
              </div>
            )}

            {isUploading && captions.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xl font-bold animate-pulse">Processing your image...</p>
              </div>
            )}

            {captions.length > 0 && (
              <div className="space-y-6">
                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <label className="block text-xs font-bold uppercase mb-2">Image URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={finalUrl} 
                      className="flex-grow p-2 border-2 border-black bg-gray-100 font-mono text-xs overflow-hidden text-ellipsis" 
                    />
                    <button 
                      onClick={handleCopy} 
                      className="py-2 px-4 bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] font-bold text-xs uppercase"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pb-4">
                  <h3 className="text-xl font-bold uppercase italic">Top Captions:</h3>
                  {captions.map((cap, index) => (
                    <div 
                      key={cap.id || index} 
                      className="border-4 border-black p-[15px] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
                    >
                      <p className="font-mono text-lg leading-tight">{cap.content || JSON.stringify(cap)}</p>
                      {cap.id && (
                        <div className="flex justify-between items-center mt-3 pt-2 border-t-2 border-gray-100">
                          <span className="text-[10px] text-gray-400 font-mono">ID: {cap.id.slice(0, 8)}</span>
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 border border-black font-bold">#{index + 1}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
