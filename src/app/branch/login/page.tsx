'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function BranchLoginRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/staff'); }, []);
  return null;
}
