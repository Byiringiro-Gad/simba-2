'use client';
import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';

// /customer — redirect to the main store with the account tab open.
// If not logged in, the auth modal opens automatically.
export default function CustomerPage() {
  const { user, setAuthOpen, setActiveTab } = useSimbaStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Already logged in — go straight to account tab
      setActiveTab('account');
      router.replace('/');
    } else {
      // Not logged in — open auth modal on the home page
      setAuthOpen(true);
      router.replace('/');
    }
  }, []);

  return null;
}
