'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { useSimbaStore } from '@/store/useSimbaStore';

type HomeBrandLinkProps = {
  className?: string;
  showText?: boolean;
  /** 'header' = white circle on orange bg (navbar/header use)
   *  'light'  = white circle on any dark bg (login, loading screens)
   *  'footer' = same as header but slightly smaller */
  variant?: 'header' | 'light' | 'footer';
};

export default function HomeBrandLink({
  className,
  showText = true,
  variant = 'header',
}: HomeBrandLinkProps) {
  const goHome = useSimbaStore((state) => state.goHome);

  const circleSize = variant === 'footer' ? 'w-9 h-9' : 'w-11 h-11';
  const imgSize   = variant === 'footer' ? 'w-8 h-8'  : 'w-10 h-10';
  const titleSize = variant === 'footer' ? 'text-sm'  : 'text-base';

  return (
    <Link
      href="/"
      onClick={goHome}
      aria-label="Simba Supermarket — go home"
      className={clsx('flex items-center gap-2.5', className)}
    >
      {/* White circle with lion */}
      <div className={clsx('rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden', circleSize)}>
        <div className={clsx('relative', imgSize)}>
          <Image
            src="/simba-icon.png"
            alt="Simba logo"
            fill
            sizes="44px"
            className="object-contain"
          />
        </div>
      </div>

      {showText && (
        <div className="leading-tight">
          <p className={clsx('font-black text-white leading-none tracking-tight', titleSize)}>
            Simba Supermarket
          </p>
          <p className="text-white/80 text-[11px] font-medium leading-none mt-0.5">
            Online Shopping
          </p>
        </div>
      )}
    </Link>
  );
}
