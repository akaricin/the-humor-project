"use client";

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface Caption {
  id: number;
  content: string;
  images: {
    url: string;
  } | null;
}

function CaptionVoteContent() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) return;

    const fetchCaptions = async () => {
      const { data, error } = await supabase
        .from('captions')
        .select('id, content, images(url)')
        .eq('is_public', true)
        .limit(50);

      if (error) {
        console.error("Fetch Error:", error);
      } else {
        console.log("Fetched Data:", data);
        if (data) {
          const shuffled = shuffleArray(data);
          setCaptions(shuffled);
        } else {
          setCaptions([]);
        }
      }
    };

    fetchCaptions();
  }, [user, supabase]);

  const handleVote = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const currentCaption = captions[currentIndex];
  const isFinished = captions.length > 0 && currentIndex >= captions.length;

  if (loadingUser) {
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
            {captions.length === 0 ? (
              <p className="text-black text-xl font-bold">SHUFFLING THE DECK...</p>
            ) : currentCaption?.images?.url ? (
              <img src={currentCaption.images.url} alt={currentCaption.content} className="w-full h-full object-cover" />
            ) : null}
          </div>
          
          {/* Caption Area */}
          <div className="p-4 flex-grow font-mono text-center text-sm flex items-center justify-center">
            {captions.length === 0 ? (
              ""
            ) : isFinished ? (
              <p className="font-bold">YOU'VE SEEN EVERYTHING!</p>
            ) : (
              <p>"{currentCaption?.content}"</p>
            )}
          </div>

          {/* Button Area */}
          <div className="flex justify-between p-4 gap-4 border-t-[6px] border-black bg-gray-50">
            <button
              onClick={handleVote}
              disabled={isFinished || captions.length === 0}
              className="w-full text-black font-bold py-3 px-4 transition-all bg-[#ff9999] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
            >
              Downvote
            </button>
            <button
              onClick={handleVote}
              disabled={isFinished || captions.length === 0}
              className="w-full text-black font-bold py-3 px-4 transition-all bg-[#90ee90] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
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
