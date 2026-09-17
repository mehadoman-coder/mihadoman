import React from 'react';

interface MihadLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  inverted?: boolean;
}

export const MihadLogo: React.FC<MihadLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  inverted = false
}) => {
  // Dimensions based on size
  const sizes = {
    sm: { icon: 34, full: 'h-9', text: 'text-base' },
    md: { icon: 46, full: 'h-12', text: 'text-xl' },
    lg: { icon: 64, full: 'h-16', text: 'text-2xl' },
    xl: { icon: 96, full: 'h-24', text: 'text-4xl' }
  };

  const navyColor = inverted ? '#ffffff' : '#0B2545';
  const silverColor = inverted ? '#cbd5e1' : '#94A3B8';

  // SVG Mark matching the uploaded MIHAD identity
  const LogoMark = (
    <svg 
      viewBox="0 0 160 160" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105`}
      style={{ width: sizes[size].icon, height: sizes[size].icon }}
    >
      {/* Background soft glow when inverted / in dark mode */}
      <defs>
        <filter id="mihad-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.25" />
        </filter>
        <linearGradient id="silver-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={inverted ? '#ffffff' : '#CBD5E1'} />
          <stop offset="100%" stopColor={inverted ? '#94A3B8' : '#64748B'} />
        </linearGradient>
        <linearGradient id="navy-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={inverted ? '#60a5fa' : '#1e40af'} />
          <stop offset="100%" stopColor={inverted ? '#3b82f6' : '#0f172a'} />
        </linearGradient>
      </defs>

      {/* Outer Rounded Frame */}
      <rect 
        x="15" 
        y="15" 
        width="130" 
        height="130" 
        rx="36" 
        stroke={navyColor} 
        strokeWidth="14" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Left Tower / Architectural Pillar (Silver) */}
      <path 
        d="M 39 105 L 39 52 L 71 36 L 71 105 L 57 105 L 57 60 L 53 62 L 53 105 Z" 
        fill={silverColor} 
      />

      {/* Right Tower / Architectural Pillar (Deep Navy / Royal) */}
      <path 
        d="M 75 36 L 107 52 L 107 88 C 107 98 100 105 89 105 C 78 105 73 98 73 88 L 73 54 L 87 54 L 87 88 C 87 91 89 93 91 93 C 93 93 95 91 95 88 L 95 60 L 75 48 Z" 
        fill={navyColor} 
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoMark}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        {LogoMark}
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-wider text-xl md:text-2xl ${inverted ? 'text-white' : 'text-[#0B2545]'}`}>
              MIHAD
            </span>
            <span className="h-4 w-[1.5px] bg-slate-500/40"></span>
            <span className={`font-black text-lg md:text-xl font-['Cairo'] ${inverted ? 'silver-gradient-text' : 'text-[#0B2545]'}`}>
              مِهَـاد
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 -mt-1 tracking-wide">
            سوق المقاولات والإنشاءات
          </span>
        </div>
      </div>
    );
  }

  // Default 'full' vertical lockup matching the original identity
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {LogoMark}
      <div className="mt-2 text-center">
        <span className={`block font-black tracking-widest text-lg md:text-xl font-sans ${inverted ? 'text-white' : 'text-[#0B2545]'}`}>
          MIHAD
        </span>
        <span className={`block font-black text-sm md:text-base font-['Cairo'] ${inverted ? 'text-slate-200' : 'text-[#0B2545]'}`}>
          مِهَاد
        </span>
      </div>
    </div>
  );
};
