'use client';
import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';

export default function LangPage() {
  const { setLanguage } = useSimbaStore();
  const router = useRouter();
  useEffect(() => {
    setLanguage('en');
    router.replace('/');
  }, []);
  return (
    <div style={{minHeight:'100vh',background:'#0F172A',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:'white'}}>
        <p style={{fontWeight:900,fontSize:'1.25rem',marginBottom:'0.5rem'}}>Simba Supermarket — English</p>
        <p style={{opacity:0.6,fontSize:'0.875rem'}}>Setting language to English...</p>
      </div>
    </div>
  );
}
