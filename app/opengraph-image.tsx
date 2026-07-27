import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = "Najot Ta'lim HR — HR tizimi va vakansiyalar portali";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1120 0%, #1d4ed8 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
          Najot Ta&apos;lim HR
        </div>
        <div style={{ fontSize: 34, fontWeight: 500, marginTop: 24, opacity: 0.85 }}>
          HR tizimi va vakansiyalar portali
        </div>
      </div>
    ),
    { ...size },
  );
}
