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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setCaptions([]); // Set to empty if there's an error
        } else {
          console.log("Fetched Data:", data);
          if (data && data.length > 0) {
            const shuffled = shuffleArray(data);
            setCaptions(shuffled);
          } else {
            setCaptions([]); // Set to empty if data is null or empty array
          }
        }
    };

    fetchCaptions();
  }, [user, supabase]);

  const handleVote = async (voteValue: 1 | -1) => {
    if (isSubmitting) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Log in to save your vote!");
      return;
    }

    const currentCaption = captions[currentIndex];
    if (!currentCaption) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('caption_votes').insert({
        profile_id: user.id,
        caption_id: currentCaption.id,
        vote_value: voteValue,
        created_datetime_utc: new Date().toISOString(),
        modified_datetime_utc: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Failed to save vote:", error);
      // The app will still advance to the next card even if the vote fails
    } finally {
      setCurrentIndex(prev => prev + 1);
      setIsSubmitting(false);
    }
  };

  const currentCaption = captions[currentIndex];
  const isFinished = captions.length > 0 && currentIndex >= captions.length;

  if (loadingUser) {
    return <div className="bg-[#b5c7eb] min-h-screen"></div>;
  }

  return (
    <div className="min-h-screen bg-[#b5c7eb] font-mono flex items-center justify-center p-4">
      {!user ? (
        <div className="bg-white border-4 border-black p-[15px] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="mb-6 text-lg">Want to see some cool captions? Please log in to continue.</p>
        </div>
      ) : (
        <div className="w-[350px] min-h-[600px] mx-auto my-10 bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden">
          {/* Image Area */}
          <div className="w-full max-h-[400px] overflow-hidden bg-gray-200 border-b-[6px] border-black flex items-center justify-center">
            {captions.length === 0 ? (
              <p className="text-black text-xl font-bold h-full flex items-center justify-center">SHUFFLING THE DECK...</p>
            ) : currentCaption?.images?.url ? (
              <img src={currentCaption.images.url} alt={currentCaption.content} className="w-full h-auto max-h-[400px] object-cover block" />
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
              onClick={() => handleVote(-1)}
              disabled={isFinished || captions.length === 0 || isSubmitting}
              className="w-full text-black font-bold py-3 px-4 transition-all bg-[#ff9999] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
            >
              Downvote
            </button>
            <button
              onClick={() => handleVote(1)}
              disabled={isFinished || captions.length === 0 || isSubmitting}
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
