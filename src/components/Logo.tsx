import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  isWhite?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, isWhite = false }) => {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className={cn(
        "relative w-10 h-10 flex items-center justify-center rounded-xl rotate-3 shadow-lg transition-transform group-hover:rotate-0",
        isWhite ? "bg-white text-royal-blue" : "bg-royal-blue text-white"
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-6 h-6"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2",
          isWhite ? "bg-royal-blue border-white" : "bg-blue-400 border-royal-blue"
        )} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn(
          "text-xl font-black tracking-tighter uppercase",
          isWhite ? "text-white" : "text-royal-blue"
        )}>
          Invest <span className="opacity-60 text-sm">4</span>
        </span>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.3em]",
          isWhite ? "text-blue-200" : "text-blue-500"
        )}>
          Business
        </span>
      </div>
    </div>
  );
};

export default Logo;
