import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F2A44',
          borderRadius: 36,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 6C32 6 12 14 12 28C12 42 22 54 32 58C42 54 52 42 52 28C52 14 32 6 32 6Z"
            fill="#1B3A5C"
            stroke="#4A9FE5"
            strokeWidth="1.5"
            strokeOpacity="0.5"
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
        </svg>
      </div>
    ),
    { ...size }
  );
}
