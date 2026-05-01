'use client';
import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';
export default function LangPage() {
  const { setLanguage } = useSimbaStore();
  const router = useRouter();
  useEffect(() => { setLanguage('rw'); router.replace('/'); }, []);
  return null;
}
