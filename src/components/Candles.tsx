import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

const CANDLE_COLORS = ['#FFD700', '#FF6B6B', '#6BB8FF', '#6BFFB8']

function generatePositions(): [number, number, number][] {
  const pos: [number, number, number][] = []
  // Center (1)
  pos.push([0, 0, 0])
  // Inner ring (5)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    pos.push([Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28])
  }
  // Middle ring (7)
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    pos.push([Math.cos(a) * 0.52, 0, Math.sin(a) * 0.52])
  }
  // Outer ring (8)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    pos.push([Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85])
  }
  return pos
}

const CANDLE_POSITIONS = generatePositions()

function SmokeParticles() {
  const pointsRef = useRef<THREE.Points>(null!)
  const startRef = useRef(Date.now())

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const arr = new Float32Array(15)
    for (let i = 0; i < 5; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.08
      arr[i * 3 + 1] = i * 0.04
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.08
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    const elapsed = (Date.now() - startRef.current) / 1000
    const arr = geo.attributes.position.array as Float32Array
    for (let i = 0; i < 5; i++) arr[i * 3 + 1] += 0.003
    geo.attributes.position.needsUpdate = true
    ;(pointsRef.current.material as THREE.PointsMaterial).opacity = Math.max(0, 0.85 - elapsed * 1.4)
  })

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial color="#aaaaaa" size={0.06} transparent opacity={0.85} sizeAttenuation />
    </points>
  )
}

interface CandleProps {
  position: [number, number, number]
  color: string
  lit: boolean
  index: number
}

function Candle({ position, color, lit, index }: CandleProps) {
  const flameRef = useRef<THREE.Mesh>(null!)
  const candleRef = useRef<THREE.Mesh>(null!)
  const prevLit = useRef(true)
  const [showSmoke, setShowSmoke] = useState(false)
  const phase = index * 0.37

  useEffect(() => {
    if (prevLit.current && !lit) {
      // Animate flame out
      if (flameRef.current) {
        gsap.to(flameRef.current.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.3,
          ease: 'back.in(2)',
        })
      }
      // Fade candle body to gray
      if (candleRef.current) {
        const mat = candleRef.current.material as THREE.MeshStandardMaterial
        gsap.to(mat.color, { r: 0.533, g: 0.533, b: 0.533, duration: 0.4 })
      }
      // Show smoke briefly
      setShowSmoke(true)
      setTimeout(() => setShowSmoke(false), 1200)
    }
    prevLit.current = lit
  }, [lit])

  useFrame(({ clock }) => {
    if (!flameRef.current || !lit) return
    const t = clock.elapsedTime
    flameRef.current.position.x = Math.sin(t * 2 + phase) * 0.014
    flameRef.current.scale.x = 1 + Math.sin(t * 3.1 + phase) * 0.13
    flameRef.current.scale.z = 1 + Math.cos(t * 2.7 + phase) * 0.1
    flameRef.current.scale.y = 1 + Math.sin(t * 2.4 + phase) * 0.08
  })

  // Candles sit on top of the top tier (y=2.1 in cake-group space)
  return (
    <group position={[position[0], 2.1, position[2]]}>
      {/* Candle body */}
      <mesh ref={candleRef} position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.06, 6]} />
        <meshStandardMaterial color="#333333" roughness={1} />
      </mesh>

      {/* Flame */}
      {lit && (
        <mesh ref={flameRef} position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial
            color="#FF8C00"
            emissive="#FF8C00"
            emissiveIntensity={2.0}
            roughness={0.1}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}

      {/* Smoke after extinction */}
      {showSmoke && <SmokeParticles />}
    </group>
  )
}

interface Props {
  candlesLit: boolean[]
}

export default function Candles({ candlesLit }: Props) {
  return (
    <>
      {CANDLE_POSITIONS.map((pos, i) => (
        <Candle
          key={i}
          position={pos}
          color={CANDLE_COLORS[i % CANDLE_COLORS.length]}
          lit={candlesLit[i]}
          index={i}
        />
      ))}
    </>
  )
}
