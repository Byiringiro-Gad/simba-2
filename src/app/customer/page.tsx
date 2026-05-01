'use client';
import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';
export default function CustomerPage() {
  const { setAuthOpen } = useSimbaStore();
  const router = useRouter();
  useEffect(() => { setAuthOpen(true); router.replace('/'); }, []);
  return null;
}
