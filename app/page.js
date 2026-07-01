"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    // if (user) {
    //   router.push('/home');
    // } else {
    //   router.push('/login');
    // }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center text-white">
      <div className="w-12 h-12 rounded-lg bg-[#6366f1] flex items-center justify-center font-bold text-xl animate-pulse">
        cj j zdojv xojv x
      </div>
    </div>
  );
}
