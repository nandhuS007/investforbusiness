import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  isWhite?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, isWhite = false }) => {
  const primaryColor = isWhite ? "#ffffff" : "#1a237e";

  return (
    <div className={cn("inline-flex items-center justify-center select-none h-10", className)}>
      <motion.svg
        viewBox="0 0 540 180"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto block"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Magnifying Glass Graphic */}
        <g stroke={primaryColor} strokeWidth="14" fill="none" transform="translate(10, 30)">
          {/* Handle */}
          <line x1="20" y1="120" x2="60" y2="80" strokeLinecap="round" />
          {/* Outer Circle */}
          <circle cx="110" cy="55" r="55" />
          {/* Inner Highlight Arc */}
          <path d="M90 30 A30 30 0 0 1 140 30" strokeWidth="10" strokeLinecap="round" />
        </g>

        {/* INVEST 4 Label */}
        <text 
          x="190" 
          y="115" 
          fill={primaryColor} 
          style={{ 
            font: '900 88px Inter, system-ui, sans-serif', 
            letterSpacing: '-3px',
          }}
        >
          INVEST 4
        </text>

        {/* BUSINESS Subtitle */}
        <text 
          x="225" 
          y="155" 
          fill={isWhite ? "#bfdbfe" : "#1e40af"} 
          style={{ 
            font: '800 28px Inter, system-ui, sans-serif', 
            letterSpacing: '12px',
          }}
        >
          BUSINESS
        </text>

        {/* Briefcase Accent */}
        <g fill={primaryColor} transform="translate(445, 20) scale(0.6)">
          {/* Handle */}
          <path d="M30 15 V8 A8 8 0 0 1 38 0 H62 A8 8 0 0 1 70 8 V15" fill="none" stroke={primaryColor} strokeWidth="10" />
          {/* Case Body */}
          <rect x="0" y="15" width="100" height="65" rx="14" />
          {/* Latch Detail */}
          <rect x="42" y="48" width="16" height="12" rx="4" fill={isWhite ? "#1a237e" : "#ffffff"} />
          <path d="M2 54 H98" stroke={isWhite ? "#1a237e60" : "#ffffff60"} strokeWidth="2" />
        </g>
      </motion.svg>
    </div>
  );
};

export default Logo;
