import { Suspense, useRef, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import CakeMesh from './CakeMesh'
import Candles from './Candles'
import BlowDetector from './BlowDetector'
import BirthdayBackground from './BirthdayBackground'
import Table from './Table'
import { useMicrophone } from '../hooks/useMicrophone'

interface Props {
  phase: 'initial' | 'listening'
  candlesLit: boolean[]
  volume: number
  onMicStart: () => void
  onBlowDetected: () => void
  onVolumeChange: (v: number) => void
}

function LoadingSpinner() {
  return (
    <Html center>
      <div
        style={{
          width: 52,
          height: 52,
          border: '4px solid rgba(255,182,193,0.15)',
          borderTopColor: '#FF69B4',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </Html>
  )
}

function SceneContent({
  phase,
  candlesLit,
  volume,
  allOut,
  getVolume,
  getPeak,
  onVolumeChange,
  onBlowDetected,
  orbitRef,
}: {
  phase: 'initial' | 'listening'
  candlesLit: boolean[]
  volume: number
  allOut: boolean
  getVolume: () => number
  getPeak: () => number
  onVolumeChange: (v: number) => void
  onBlowDetected: () => void
  orbitRef: React.MutableRefObject<any>
}) {
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isBlowing = volume > 42 && phase === 'listening'

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* Birthday background — orbs, balloons */}
      <BirthdayBackground />

      {/* Lighting — brighter to match warm room feel */}
      <ambientLight intensity={0.9} />
      {!allOut ? (
        <pointLight position={[0, 3, 0]} intensity={1.4} color="#FFD700" castShadow={false} />
      ) : (
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#AADDFF" />
      )}
      <directionalLight position={[3, 6, 5]} intensity={0.8} />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#FFD0E8" />
      <pointLight position={[-4, 3, 3]} intensity={0.5} color="#FF69B4" />

      {/* Camera controls */}
      <OrbitControls
        ref={orbitRef}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.7}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0.5, 0]}
        onStart={() => {
          if (orbitRef.current) orbitRef.current.autoRotate = false
          if (resumeTimer.current) clearTimeout(resumeTimer.current)
        }}
        onEnd={() => {
          resumeTimer.current = setTimeout(() => {
            if (orbitRef.current) orbitRef.current.autoRotate = true
          }, 3000)
        }}
      />

      {/* Table + floor — in world space */}
      <group position={[0, -1.15, 0]}>
        <Table />
      </group>

      {/* Cake group */}
      <group position={[0, -1, 0]}>
        <CakeMesh />
        <Candles candlesLit={candlesLit} />

        {/* "soffia" hint */}
        {phase === 'listening' && (
          <Html position={[0, 4.1, 0]} center>
            <p
              style={{
                fontSize: 30,
                fontFamily: "'Georgia', 'Times New Roman', serif",
                color: '#8B1A5A',
                textShadow: '0 1px 0 #fff, 0 0 14px rgba(255,105,180,0.7)',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                opacity: allOut ? 0 : 1,
                transition: 'opacity 0.7s ease',
                animation: isBlowing
                  ? 'shake 0.09s ease-in-out infinite'
                  : 'pulse 1.4s ease-in-out infinite',
              }}
            >
              soffia 🌬️
            </p>
          </Html>
        )}
      </group>

      {/* Blow detector inside Canvas to access useFrame */}
      {phase === 'listening' && !allOut && (
        <BlowDetector
          getVolume={getVolume}
          getPeak={getPeak}
          onVolumeChange={onVolumeChange}
          onBlowDetected={onBlowDetected}
        />
      )}
    </Suspense>
  )
}

export default function CakeScene({
  phase,
  candlesLit,
  volume,
  onMicStart,
  onBlowDetected,
  onVolumeChange,
}: Props) {
  const { startListening, getVolume, getPeak, error, supported } = useMicrophone()
  const orbitRef = useRef<any>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const allOut = candlesLit.every((lit) => !lit)

  const handleMicClick = useCallback(async () => {
    const ok = await startListening()
    if (ok) {
      onMicStart()
    } else {
      setMicError('Microfono non disponibile')
    }
  }, [startListening, onMicStart])

  const volPercent = Math.min(100, (volume / 55) * 100)
  const barColor = volume > 42 ? '#22c55e' : volume > 25 ? '#fbbf24' : 'rgba(80,20,60,0.25)'

  return (
    <div
      className="relative w-full h-full"
      style={{
        background:
          'linear-gradient(160deg, #FFB7D5 0%, #FFC8E8 20%, #EDD0FF 50%, #C8DCFF 80%, #C0F0E8 100%)',
      }}
    >
      {/* 3D Canvas — 80% height, alpha:true so CSS gradient shows through */}
      <div style={{ height: '80%', position: 'relative' }}>
        <Canvas
          gl={{
            antialias: window.devicePixelRatio <= 2,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          shadows={false}
          camera={{ position: [0, 1.5, 5.5], fov: 48 }}
          style={{ touchAction: 'none' }}
        >
          <SceneContent
            phase={phase}
            candlesLit={candlesLit}
            volume={volume}
            allOut={allOut}
            getVolume={getVolume}
            getPeak={getPeak}
            onVolumeChange={onVolumeChange}
            onBlowDetected={onBlowDetected}
            orbitRef={orbitRef}
          />
        </Canvas>
      </div>

      {/* Bottom UI */}
      <div
        style={{ height: '20%' }}
        className="flex flex-col items-center justify-center gap-3 px-6"
      >
        {phase === 'initial' && (
          <>
            <p style={{ color: '#7C3460', fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
              Avvicina il telefono alla bocca e soffia 💨
            </p>

            {!supported || micError || error ? (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {(micError || error) && (
                  <p style={{ color: '#dc2626', fontSize: 12, textAlign: 'center' }}>
                    {micError || error}
                  </p>
                )}
                <button
                  onClick={onBlowDetected}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    background: 'rgba(139,26,90,0.1)',
                    color: '#8B1A5A',
                    borderRadius: 16,
                    fontSize: 16,
                    border: '2px solid rgba(139,26,90,0.3)',
                    cursor: 'pointer',
                  }}
                >
                  👆 Tocca per spegnere
                </button>
              </div>
            ) : (
              <button
                onClick={handleMicClick}
                style={{
                  width: '100%',
                  maxWidth: 320,
                  padding: '16px 0',
                  background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                  color: 'white',
                  borderRadius: 18,
                  fontSize: 17,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 28px rgba(168,85,247,0.45)',
                  transition: 'transform 0.1s',
                }}
                onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                🎤 Dai il permesso al microfono
              </button>
            )}
          </>
        )}

        {phase === 'listening' && (
          <>
            <div
              style={{
                width: '100%',
                maxWidth: 320,
                height: 10,
                background: 'rgba(139,26,90,0.12)',
                borderRadius: 5,
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${volPercent}%`,
                  background: barColor,
                  borderRadius: 5,
                  transition: 'width 0.08s linear, background-color 0.2s',
                  boxShadow: volume > 42 ? '0 0 8px #22c55e' : 'none',
                }}
              />
            </div>
            <p style={{ color: '#9B4470', fontSize: 12, fontWeight: 500 }}>
              {allOut ? '🎉 Bravo!' : 'soffia nelle candeline! 🎂'}
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(1.05); }
          25% { transform: translateX(-4px) scale(1.07); }
          75% { transform: translateX(4px) scale(1.07); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
