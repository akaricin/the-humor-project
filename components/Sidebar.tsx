"use client";

import Link from "next/link";
import { createClient } from "../utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="fixed left-0 top-0 w-[100px] h-screen bg-[#152238] flex flex-col justify-between z-50">
      <nav className="pt-20 px-6 flex flex-col gap-y-12">
        <Link
          href="/"
          className="py-3 px-6 rounded-xl text-center w-full text-[30px] no-underline hover:bg-gray-700 transition-colors"
        >
          Hello World
        </Link>
        <Link
          href="/images"
          className="py-3 px-6 rounded-xl text-center w-full text-[30px] no-underline hover:bg-gray-700 transition-colors"
        >
          Images
        </Link>
      </nav>

      <div className="pb-10 px-6">
        {user ? (
          <div>
            <p className="text-3xl font-extrabold text-[#FEFEFA]">Account</p>
            <p className="text-sm opacity-70 text-[#FEFEFA]">{user.email}</p>
            <LogoutButton />
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            className="text-[30px] text-center bg-transparent border-none text-[#FEFEFA] w-full hover:opacity-80"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}