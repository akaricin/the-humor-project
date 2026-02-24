'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCodeError() {
  const router = useRouter();

  useEffect(() => {
    // Small delay to prevent flashing, then redirect home
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen font-mono">
      <div className="p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white text-center">
        <h1 className="text-2xl font-bold mb-4">ACCESS DENIED</h1>
        <p>Login cancelled or failed. Taking you back home...</p>
      </div>
    </div>
  );
}
