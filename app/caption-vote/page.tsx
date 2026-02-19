"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function CaptionVotePage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [supabase.auth]);

  if (loading) {
    return <div className="bg-[#f0e6ff] min-h-screen"></div>; // Render a blank screen during load to avoid flash
  }

  return (
    <div className="min-h-screen bg-[#f0e6ff] font-mono flex items-center justify-center p-4">
      {!user ? (
        // Logged-out state: Speech Bubble
        <div className="bg-white border-4 border-black p-[15px] relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="mb-6 text-lg">Want to see some cool captions? Please log in to continue.</p>
        </div>
      ) : (
        // Logged-in state: Game Box
        <div className="bg-white border-4 border-black p-[15px] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] w-full max-w-md">
          <div className="border-4 border-black p-[15px] mb-4 text-center">
            <p className="text-xl font-bold mb-2">Image Placeholder</p>
            <div className="bg-gray-200 h-64 w-full border-2 border-black"></div>
            <p className="mt-4 italic">"This is a placeholder for a witty caption."</p>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              className="bg-[#90ee90] text-black font-bold py-3 px-6 border-b-4 border-r-4 border-black active:border-0 active:translate-y-1 active:translate-x-1"
              style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            >
              Upvote
            </button>
            <button
              className="bg-[#ff9999] text-black font-bold py-3 px-6 border-b-4 border-r-4 border-black active:border-0 active:translate-y-1 active:translate-x-1"
              style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            >
              Downvote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
