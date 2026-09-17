import React from 'react';
import { 
  Building2, 
  Compass, 
  ShieldCheck, 
  Calculator, 
  Sparkles, 
  Layers, 
  Flame, 
  CheckCircle, 
  Briefcase, 
  TrendingUp, 
  UserCheck, 
  FileText,
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Shield,
  Search,
  PlusCircle
} from 'lucide-react';

interface GlassIconProps {
  icon: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'royal' | 'silver' | 'amber' | 'emerald';
  className?: string;
  glow?: boolean;
}

export const GlassIcon: React.FC<GlassIconProps> = ({ 
  icon: Icon, 
  size = 'md', 
  variant = 'royal',
  className = '',
  glow = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5 rounded-lg text-sm',
    md: 'w-11 h-11 p-2.5 rounded-xl text-base',
    lg: 'w-14 h-14 p-3 rounded-2xl text-xl',
    xl: 'w-20 h-20 p-4 rounded-3xl text-3xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10'
  };

  const variantStyles = {
    royal: 'from-blue-500/25 via-blue-600/15 to-indigo-900/30 border-blue-300/30 text-blue-200 shadow-blue-900/30',
    silver: 'from-slate-200/25 via-slate-400/10 to-slate-800/30 border-slate-200/40 text-slate-100 shadow-slate-900/40',
    amber: 'from-amber-400/25 via-amber-500/15 to-yellow-900/30 border-amber-300/40 text-amber-200 shadow-amber-900/30',
    emerald: 'from-emerald-400/25 via-emerald-500/15 to-teal-950/30 border-emerald-300/40 text-emerald-200 shadow-emerald-900/30'
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center bg-gradient-to-br backdrop-blur-md border shadow-lg transition-all duration-300 ${sizeClasses[size]} ${variantStyles[variant]} ${glow ? 'ring-2 ring-blue-400/30' : ''} ${className}`}
      style={{
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.3)'
      }}
    >
      {/* Glass highlights */}
      <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/30 to-transparent rounded-t-[inherit] pointer-events-none" />
      <Icon className={`${iconSizes[size]} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`} />
    </div>
  );
};
