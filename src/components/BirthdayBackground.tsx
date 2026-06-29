import { useRef, useMemo } from 'react'
import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ORB_CONFIGS = [
  { pos: [-5, 2, -10] as const, color: '#FF6B9D', size: 0.55 },
  { pos: [5.5, 0.5, -8] as const, color: '#C44DFF', size: 0.4 },
  { pos: [-4, -1.5, -7] as const, color: '#6BB8FF', size: 0.45 },
  { pos: [4.5, 3.5, -11] as const, color: '#FFD700', size: 0.38 },
  { pos: [0.5, 5, -12] as const, color: '#B8F0D3', size: 0.32 },
  { pos: [-6, 4, -9] as const, color: '#FF8C42', size: 0.3 },
]

const BALLOON_CONFIGS = [
  { pos: [-5.5, 0.5, -3] as const, color: '#FF6B9D' },
  { pos: [5, 1, -4.5] as const, color: '#C44DFF' },
  { pos: [-4, 3, -6] as const, color: '#FFD700' },
  { pos: [4.8, 2.5, -2.5] as const, color: '#6BB8FF' },
  { pos: [-2.5, -0.5, -5] as const, color: '#B8F0D3' },
]

function FloatingOrb({
  pos,
  color,
  size,
}: {
  pos: readonly [number, number, number]
  color: string
  size: number
}) {
  return (
    <Float speed={1.2 + size} floatIntensity={0.6} rotationIntensity={0.2}>
      <mesh position={[pos[0], pos[1], pos[2]]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.4}
          transparent
          opacity={0.65}
        />
      </mesh>
    </Float>
  )
}

function Balloon({ pos, color }: { pos: readonly [number, number, number]; color: string }) {
  return (
    <Float speed={0.7} floatIntensity={0.5} rotationIntensity={0.1}>
      <group position={[pos[0], pos[1], pos[2]]}>
        {/* Body */}
        <mesh scale={[1, 1.35, 1]}>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshStandardMaterial color={color} roughness={0.08} metalness={0.25} />
        </mesh>
        {/* Knot */}
        <mesh position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* String */}
        <mesh position={[0, -0.52, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.45, 4]} />
          <meshStandardMaterial color="#dddddd" roughness={1} transparent opacity={0.5} />
        </mesh>
      </group>
    </Float>
  )
}

function SparkleParticles() {
  const ref = useRef<THREE.Points>(null!)

  const { geo } = useMemo(() => {
    const count = 60
    const positions = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#FFD700'),
      new THREE.Color('#FF6B9D'),
      new THREE.Color('#C44DFF'),
      new THREE.Color('#6BB8FF'),
      new THREE.Color('#B8F0D3'),
    ]
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = -3 - Math.random() * 10
      const c = palette[Math.floor(Math.random() * palette.length)]
      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    return { geo: g }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const positions = geo.attributes.position.array as Float32Array
    const t = clock.elapsedTime
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += Math.sin(t * 0.8 + i * 0.5) * 0.002
    }
    geo.attributes.position.needsUpdate = true
    ;(ref.current.material as THREE.PointsMaterial).opacity =
      0.5 + Math.sin(t * 1.5) * 0.2
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export default function BirthdayBackground() {
  return (
    <>
      <SparkleParticles />
      {ORB_CONFIGS.map((cfg, i) => (
        <FloatingOrb key={i} {...cfg} />
      ))}
      {BALLOON_CONFIGS.map((cfg, i) => (
        <Balloon key={i} {...cfg} />
      ))}
    </>
  )
}
