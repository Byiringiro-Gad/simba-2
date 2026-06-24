'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /staff is an alias for the branch login portal — redirect there
export default function StaffRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/branch/login'); }, []);
  return null;
}
