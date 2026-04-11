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
  id: string;
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
  const [lastVoteId, setLastVoteId] = useState<number | null>(null);

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
        .select('id, content, images!inner(url)')
        .eq('is_public', true)
        .eq('images.is_public', true)
        .neq('content', '')
        .not('content', 'is', null)
        .limit(50);

      if (error) {
          console.error("Fetch Error:", error);
          setCaptions([]); // Set to empty if there's an error
        } else {
          console.log("Fetched Data:", data);
          if (data && data.length > 0) {
            const formattedData = data.map((item) => ({
              ...item,
              images: Array.isArray(item.images) ? item.images[0] : (item.images as { url: string } | null)
            }));
            const shuffled = shuffleArray(formattedData);
            setCaptions(shuffled);
          } else {
            setCaptions([]); // Set to empty if data is null or empty array
          }
        }
    };

    fetchCaptions();
  }, [user, supabase]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

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
      const { data, error } = await supabase.from('caption_votes').upsert({
        profile_id: user.id,
        caption_id: currentCaption.id,
        vote_value: voteValue,
        created_datetime_utc: new Date().toISOString(),
        modified_datetime_utc: new Date().toISOString(),
      }, { onConflict: 'profile_id, caption_id' }).select('id').single();

      if (error) {
        throw error;
      }

      if (data) {
        setLastVoteId(data.id);
      }
    } catch (error) {
      let errorMessage = "Unknown error";
      if (error && typeof error === 'object' && "message" in error) {
        errorMessage = String(error.message);
      } else {
        errorMessage = String(error);
      }
      console.error("Failed to save vote:", errorMessage);
    } finally {
      setCurrentIndex(prev => prev + 1);
      setIsSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (!lastVoteId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('caption_votes')
        .delete()
        .eq('id', lastVoteId);

      if (error) throw error;

      setLastVoteId(null);
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to undo vote:", error);
      alert("Failed to undo vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCaption = captions[currentIndex];
  const isFinished = captions.length > 0 && currentIndex >= captions.length;

  if (loadingUser) {
    return <div className="flex-1 bg-[#b5c7eb]"></div>;
  }

  return (
    <div className="flex-1 bg-[#b5c7eb] font-mono flex flex-col items-center justify-center p-4 relative">
      {!user ? (
        <div className="bg-white border-4 border-black p-[15px] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="mb-6 text-lg">
            Want to see some cool captions? Please{' '}
            <button 
              onClick={handleSignIn} 
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                margin: 0, 
                font: 'inherit', 
                color: 'inherit', 
                cursor: 'pointer', 
                textDecoration: 'underline', 
                display: 'inline' 
              }}
            >
              log in
            </button>{' '}
            to continue.
          </p>
        </div>
      ) : (
        <>
          <div className="w-[350px] min-h-[600px] mx-auto my-10 bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between overflow-hidden">
            {/* Image Area */}
            <div className="w-full max-h-[400px] overflow-hidden bg-gray-200 border-b-[6px] border-black flex items-center justify-center">
              {captions.length === 0 ? (
                <p className="text-black text-xl font-bold h-full flex items-center justify-center">SHUFFLING THE DECK...</p>
              ) : isFinished ? (
                <div className="flex items-center justify-center h-[400px] w-full bg-gray-100">
                  <p className="font-bold text-xl">NO MORE CARDS!</p>
                </div>
              ) : currentCaption?.images?.url ? (
                <img src={currentCaption.images.url} alt={currentCaption.content} className="w-full h-auto max-h-[400px] object-cover block" />
              ) : null}
            </div>
            
            {/* Caption Area */}
            <div className="p-4 flex-grow font-mono text-center text-sm flex flex-col items-center justify-center">
              {captions.length === 0 ? (
                ""
              ) : isFinished ? (
                <p className="font-bold uppercase italic text-lg">You&apos;ve seen everything for now!</p>
              ) : (
                <>
                  <p className="text-lg leading-tight">&quot;{currentCaption?.content}&quot;</p>
                  
                  {/* Undo Button - Inline between caption and voting buttons */}
                  {lastVoteId && (
                    <div className="mt-4">
                      <button 
                        onClick={handleUndo}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          padding: 0, 
                          margin: 0, 
                          font: 'inherit', 
                          color: 'gray', 
                          fontSize: '0.8rem',
                          cursor: 'pointer', 
                          textDecoration: 'underline', 
                          display: 'inline' 
                        }}
                      >
                        Undo last vote
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Button Area */}
            {!isFinished && captions.length > 0 && (
              <div className="flex justify-between p-4 gap-4 border-t-[6px] border-black bg-gray-50">
                <button
                  onClick={() => handleVote(-1)}
                  disabled={isSubmitting}
                  className="w-full text-black font-bold py-3 px-4 transition-all bg-[#ff9999] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
                >
                  Downvote
                </button>
                <button
                  onClick={() => handleVote(1)}
                  disabled={isSubmitting}
                  className="w-full text-black font-bold py-3 px-4 transition-all bg-[#90ee90] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
                >
                  Upvote
                </button>
              </div>
            )}
          </div>
        </>
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
