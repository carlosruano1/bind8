'use client';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  const textSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }[size];

  // If className contains 'text-white', treat it as light variant
  const isLight = variant === 'light' || className?.includes('text-white');

  const baseStyles = isLight 
    ? 'text-white' 
    : 'text-gray-900';

  const numberStyles = isLight
    ? 'text-blue-400 animate-pulse drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]'
    : 'text-blue-600';

  return (
    <div className={`flex items-center ${className}`}>
      <span className={`font-bold ${textSize} ${baseStyles}`}>
        Bind
        <span className={numberStyles}>8</span>
      </span>
    </div>
  );
}