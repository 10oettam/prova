import { useMemo } from 'react'

const COLORS = ['#FFD700', '#FF6B9D', '#6BB8FF', '#B8F0D3', '#FF6B6B', '#C44DFF', '#FFB6C1']

interface Piece {
  id: number
  x: number
  color: string
  duration: number
  delay: number
  initRotation: number
  size: number
  isCircle: boolean
}

export default function Confetti() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: 3 + Math.random() * 2.5,
        delay: Math.random() * 2.5,
        initRotation: Math.random() * 360,
        size: 6 + Math.random() * 9,
        isCircle: Math.random() > 0.5,
      })),
    [],
  )

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            transform: `rotate(${p.initRotation}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
