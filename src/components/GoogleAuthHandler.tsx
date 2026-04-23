'use client';

import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';
import { toast } from './Toast';

export default function GoogleAuthHandler() {
  const { login } = useSimbaStore();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('auth_token');
    const userRaw = params.get('auth_user');
    const error = params.get('auth_error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      router.replace('/');
      return;
    }

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        login(user, token);
        toast.success(`Welcome, ${user.name}!`);
      } catch {
        toast.error('Could not complete sign-in.');
      }
      // Clean URL
      router.replace('/');
    }
  }, []);

  return null;
}
