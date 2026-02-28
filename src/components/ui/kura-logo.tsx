'use client';

import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Shared sub-components (defined outside render to satisfy React     */
/*  Compiler's static-components rule)                                 */
/* ------------------------------------------------------------------ */

function LogoMarkSvg({
  logoSize,
  animated,
}: {
  logoSize: number;
  animated: boolean;
}) {
  return (
    <motion.svg
      width={logoSize}
      height={logoSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={animated ? { rotate: -180, opacity: 0 } : undefined}
      animate={animated ? { rotate: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer ring - 360 coverage */}
      <circle
        cx="32"
        cy="32"
        r="30"
        stroke="url(#ringGrad)"
        strokeWidth="2.5"
        strokeDasharray="4 3"
        opacity="0.4"
      />
      {/* Shield - trust & protection */}
      <path
        d="M32 6C32 6 12 14 12 28C12 42 22 54 32 58C42 54 52 42 52 28C52 14 32 6 32 6Z"
        fill="url(#shieldGrad)"
        stroke="url(#shieldStroke)"
        strokeWidth="1.5"
      />
      {/* Checkmark / ballot mark */}
      <path
        d="M23 32L29 38L41 24"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Circular progress arc */}
      <path
        d="M32 8C32 8 14 15 14 28C14 40 23 51 32 55"
        stroke="url(#arcGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Dot accents */}
      <circle cx="32" cy="4" r="2" fill="#27AE60" />
      <circle cx="56" cy="20" r="1.5" fill="#4A9FE5" opacity="0.6" />
      <circle cx="56" cy="44" r="1.5" fill="#27AE60" opacity="0.4" />
      <defs>
        <linearGradient id="shieldGrad" x1="12" y1="6" x2="52" y2="58">
          <stop offset="0%" stopColor="#0F2A44" />
          <stop offset="50%" stopColor="#1B3A5C" />
          <stop offset="100%" stopColor="#0F2A44" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="12" y1="6" x2="52" y2="58">
          <stop offset="0%" stopColor="#4A9FE5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#27AE60" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="2" y1="2" x2="62" y2="62">
          <stop offset="0%" stopColor="#4A9FE5" />
          <stop offset="100%" stopColor="#27AE60" />
        </linearGradient>
        <linearGradient id="arcGrad" x1="14" y1="8" x2="32" y2="55">
          <stop offset="0%" stopColor="#4A9FE5" />
          <stop offset="100%" stopColor="#27AE60" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

function WordmarkText({
  textSize,
  subSize,
  color,
  subColor,
  animated,
}: {
  textSize: number;
  subSize: number;
  color: string;
  subColor: string;
  animated: boolean;
}) {
  return (
    <motion.div
      className="flex items-baseline gap-0.5"
      initial={animated ? { x: -10, opacity: 0 } : undefined}
      animate={animated ? { x: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="font-heading"
        style={{
          fontSize: textSize,
          fontWeight: 700,
          color,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        kura
      </span>
      <span
        className="font-heading"
        style={{
          fontSize: subSize,
          fontWeight: 600,
          color: subColor,
          letterSpacing: '0.05em',
          lineHeight: 1,
          position: 'relative',
          top: -2,
        }}
      >
        360
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Public components                                                  */
/* ------------------------------------------------------------------ */

interface KuraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'mark' | 'wordmark';
  animated?: boolean;
  className?: string;
}

export function KuraLogo({
  size = 'md',
  variant = 'full',
  animated = true,
  className = '',
}: KuraLogoProps) {
  const sizes = {
    sm: { logo: 28, text: 18, sub: 10 },
    md: { logo: 36, text: 24, sub: 12 },
    lg: { logo: 48, text: 32, sub: 14 },
    xl: { logo: 64, text: 42, sub: 16 },
    hero: { logo: 96, text: 64, sub: 20 },
  };

  const s = sizes[size];

  if (variant === 'mark') {
    return <LogoMarkSvg logoSize={s.logo} animated={animated} />;
  }
  if (variant === 'wordmark') {
    return (
      <WordmarkText
        textSize={s.text}
        subSize={s.sub}
        color="#0F2A44"
        subColor="#27AE60"
        animated={animated}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMarkSvg logoSize={s.logo} animated={animated} />
      <WordmarkText
        textSize={s.text}
        subSize={s.sub}
        color="#0F2A44"
        subColor="#27AE60"
        animated={animated}
      />
    </div>
  );
}

/** White variant for dark sidebar background */
export function KuraLogoWhite({
  size = 'md',
  animated = true,
}: {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}) {
  const sizes = {
    sm: { logo: 24, text: 16, sub: 9 },
    md: { logo: 32, text: 22, sub: 11 },
    lg: { logo: 40, text: 28, sub: 13 },
  };
  const s = sizes[size];

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={animated ? { opacity: 0, y: -5 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
    >
      <svg width={s.logo} height={s.logo} viewBox="0 0 64 64" fill="none">
        <circle
          cx="32"
          cy="32"
          r="30"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2.5"
          strokeDasharray="4 3"
        />
        <path
          d="M32 6C32 6 12 14 12 28C12 42 22 54 32 58C42 54 52 42 52 28C52 14 32 6 32 6Z"
          fill="url(#shieldWhite)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />
        <path
          d="M23 32L29 38L41 24"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="32" cy="4" r="2" fill="#27AE60" />
        <defs>
          <linearGradient id="shieldWhite" x1="12" y1="6" x2="52" y2="58">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex items-baseline gap-0.5">
        <span
          className="font-heading"
          style={{
            fontSize: s.text,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          kura
        </span>
        <span
          className="font-heading"
          style={{
            fontSize: s.sub,
            fontWeight: 600,
            color: '#27AE60',
            letterSpacing: '0.05em',
            lineHeight: 1,
            position: 'relative',
            top: -1,
          }}
        >
          360
        </span>
      </div>
    </motion.div>
  );
}
