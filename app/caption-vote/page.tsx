"use client";

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';

interface Image {
  id: number;
  caption: string;
  image_url: string;
}

function CaptionVoteContent() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<Image | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchImage = async () => {
      const id = searchParams.get('id');
      if (!id) return;

      const { data, error } = await supabase
        .from('images')
        .select('id, caption, image_url')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching image:', error);
      } else {
        setImage(data);
      }
    };

    if (user) {
      fetchImage();
    }
  }, [searchParams, user, supabase]);


  if (loading) {
    return <div className="bg-[#f0e6ff] min-h-screen"></div>;
  }

  return (
    <div className="min-h-screen bg-[#f0e6ff] font-mono flex items-center justify-center p-4">
      {!user ? (
        <div className="bg-white border-4 border-black p-[15px] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="mb-6 text-lg">Want to see some cool captions? Please log in to continue.</p>
        </div>
      ) : (
        <div className="w-[350px] min-h-[600px] mx-auto my-10 bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden">
          {/* Image Area */}
          <div className="w-full aspect-square border-b-[6px] border-black flex items-center justify-center bg-gray-200">
            {image ? (
              <img src={image.image_url} alt={image.caption} className="w-full h-full object-cover" />
            ) : (
              <p className="text-black text-xl font-bold">IMAGE LOADING...</p>
            )}
          </div>
          
          {/* Caption Area */}
          <div className="p-4 flex-grow font-mono text-center text-sm flex items-center justify-center">
            {image ? (
              <p>"{image.caption}"</p>
            ) : (
              <p>WAITING FOR CAPTION...</p>
            )}
          </div>

          {/* Button Area */}
          <div className="flex justify-between p-4 gap-4 border-t-[6px] border-black bg-gray-50">
            <button
              className="w-full text-black font-bold py-3 px-4 transition-all bg-[#ff9999] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              Downvote
            </button>
            <button
              className="w-full text-black font-bold py-3 px-4 transition-all bg-[#90ee90] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              Upvote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaptionVotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CaptionVoteContent />
    </Suspense>
  );
}
