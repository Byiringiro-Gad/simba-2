'use client';

import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { useSimbaStore } from '@/store/useSimbaStore';

type HomeBrandLinkProps = {
  className?: string;
  iconWrapperClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  imageClassName?: string;
  showText?: boolean;
};

export default function HomeBrandLink({
  className,
  iconWrapperClassName,
  titleClassName,
  subtitleClassName,
  imageClassName,
  showText = true,
}: HomeBrandLinkProps) {
  const goHome = useSimbaStore((state) => state.goHome);
  const titleClasses = clsx('font-black tracking-tight leading-none', titleClassName ?? 'text-white');
  const subtitleClasses = clsx(
    'block text-[10px] font-medium tracking-widest uppercase',
    subtitleClassName ?? 'text-white/60',
  );

  return (
    <Link
      href="/"
      onClick={goHome}
      aria-label={showText ? undefined : 'Simba home'}
      className={clsx('flex items-center gap-2', className)}
    >
      <div
        className={clsx(
          'relative flex-shrink-0 overflow-hidden bg-brand-dark',
          iconWrapperClassName ?? 'w-10 h-10 rounded-xl',
        )}
      >
        <Image
          src="/simba-icon.png"
          alt="Simba"
          fill
          sizes="64px"
          className={clsx('object-cover', imageClassName)}
        />
      </div>
      {showText && (
        <span className={titleClasses}>
          SIMBA
          <span className={subtitleClasses}>
            Online Supermarket
          </span>
        </span>
      )}
    </Link>
  );
}
