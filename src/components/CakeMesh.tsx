import { useMemo } from 'react'
import { Html } from '@react-three/drei'

const FROSTING = '#FFFFFF'
const SPRINKLE_COLORS = ['#FFD700', '#FF6B6B', '#6BB8FF', '#B8F0D3', '#FF69B4', '#FF8C42', '#E6B8FF']
const PEARL_COLORS = ['#FFD700', '#FF69B4', '#FFFFFF', '#E6B8FF']

// Golden-angle sprinkle distribution for even visual coverage
function useSprinkles(radius: number, yMin: number, yMax: number, count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = i * 2.399193 // golden angle in radians
        const t = i / count
        return {
          angle,
          y: yMin + t * (yMax - yMin),
          r: radius,
          color: SPRINKLE_COLORS[i % SPRINKLE_COLORS.length],
          tilt: (i * 1.1) % Math.PI,
        }
      }),
    [radius, yMin, yMax, count],
  )
}

function Sprinkle({
  angle,
  y,
  r,
  color,
  tilt,
}: {
  angle: number
  y: number
  r: number
  color: string
  tilt: number
}) {
  const x = Math.cos(angle) * r
  const z = Math.sin(angle) * r
  return (
    <mesh position={[x, y, z]} rotation={[tilt, -angle, 0]}>
      <cylinderGeometry args={[0.022, 0.022, 0.13, 6]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  )
}

function PearlRing({ radius, y, count }: { radius: number; y: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * radius, y, Math.sin(a) * radius]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial
              color={PEARL_COLORS[i % PEARL_COLORS.length]}
              roughness={0.08}
              metalness={0.5}
            />
          </mesh>
        )
      })}
    </>
  )
}

function FrostingBlobs({ radius, y, count }: { radius: number; y: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + 0.15
        return (
          <mesh key={i} position={[Math.cos(a) * (radius - 0.04), y - 0.14, Math.sin(a) * (radius - 0.04)]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={FROSTING} roughness={0.08} />
          </mesh>
        )
      })}
    </>
  )
}

export default function CakeMesh() {
  const baseSprinkles = useSprinkles(2.18, 0.05, 0.75, 40)
  const midSprinkles = useSprinkles(1.68, 0.85, 1.42, 32)
  const topSprinkles = useSprinkles(1.18, 1.55, 2.05, 22)

  return (
    <group>
      {/* ── Cake plate ── */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 0.1, 48]} />
        <meshStandardMaterial color="#F5F0FF" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Plate rim edge */}
      <mesh position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.7, 0.07, 8, 48]} />
        <meshStandardMaterial color="#E8E0FF" roughness={0.1} metalness={0.4} />
      </mesh>

      {/* ── Base tier — pink #FFB6C1 ── */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.8, 48]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.25} metalness={0.08} />
      </mesh>
      {/* Frosting top */}
      <mesh position={[0, 0.81, 0]}>
        <cylinderGeometry args={[2.22, 2.18, 0.04, 48]} />
        <meshStandardMaterial color={FROSTING} roughness={0.06} />
      </mesh>
      {/* Frosting torus border */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.1, 10, 48]} />
        <meshStandardMaterial color={FROSTING} roughness={0.06} />
      </mesh>
      {/* Frosting drip blobs */}
      <FrostingBlobs radius={2.2} y={0.82} count={14} />
      {/* Ribbon accent */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.21, 0.045, 4, 48]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Sprinkles */}
      {baseSprinkles.map((s, i) => (
        <Sprinkle key={i} {...s} />
      ))}
      {/* Pearl ring */}
      <PearlRing radius={2.1} y={0.88} count={22} />

      {/* ── Middle tier — lavender #E6B8FF ── */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 0.7, 48]} />
        <meshStandardMaterial color="#E6B8FF" roughness={0.25} metalness={0.08} />
      </mesh>
      {/* Frosting top */}
      <mesh position={[0, 1.51, 0]}>
        <cylinderGeometry args={[1.72, 1.68, 0.04, 48]} />
        <meshStandardMaterial color={FROSTING} roughness={0.06} />
      </mesh>
      {/* Frosting torus */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.1, 10, 48]} />
        <meshStandardMaterial color={FROSTING} roughness={0.06} />
      </mesh>
      <FrostingBlobs radius={1.7} y={1.52} count={10} />
      {/* Ribbon */}
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.71, 0.045, 4, 48]} />
        <meshStandardMaterial color="#C44DFF" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Sprinkles */}
      {midSprinkles.map((s, i) => (
        <Sprinkle key={i} {...s} />
      ))}
      <PearlRing radius={1.6} y={1.58} count={16} />

      {/* ── "Buon Compleanno Michelle" — Html avoids font-load suspension ── */}
      <Html
        position={[0, 1.15, 1.73]}
        center
        distanceFactor={30}
        transform
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            lineHeight: 1.2,
            userSelect: 'none',
            whiteSpace: 'nowrap',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: '#FF1493',
              textShadow: '0 2px 0 #fff, 0 0 20px rgba(255,20,147,0.5)',
              letterSpacing: '-1px',
            }}
          >
            Buon Compleanno
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: '#C44DFF',
              textShadow: '0 2px 0 #fff, 0 0 20px rgba(196,77,255,0.5)',
              letterSpacing: '-1px',
            }}
          >
            Michelle
          </div>
        </div>
      </Html>

      {/* ── Top tier — mint #B8F0D3 ── */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.6, 48]} />
        <meshStandardMaterial color="#B8F0D3" roughness={0.25} metalness={0.08} />
      </mesh>
      {/* Frosting top */}
      <mesh position={[0, 2.11, 0]}>
        <cylinderGeometry args={[1.22, 1.18, 0.04, 48]} />
        <meshStandardMaterial color={FROSTING} roughness={0.06} />
      </mesh>
      {/* Frosting torus */}
      <mesh position={[0, 2.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.1, 10, 48]} />
        <meshStandardMaterial color={FROSTING} roughness={0.06} />
      </mesh>
      <FrostingBlobs radius={1.2} y={2.12} count={7} />
      {/* Ribbon */}
      <mesh position={[0, 1.84, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.21, 0.045, 4, 48]} />
        <meshStandardMaterial color="#6BFFB8" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Sprinkles */}
      {topSprinkles.map((s, i) => (
        <Sprinkle key={i} {...s} />
      ))}
      <PearlRing radius={1.1} y={2.17} count={10} />

      {/* ── Top decoration — small sugar stars ── */}
      {[0, 1.26, 2.51, 3.77, 5.03].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.6, 2.16, Math.sin(angle) * 0.6]}
          rotation={[0, angle, 0]}
        >
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial
            color={SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]}
            emissive={SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]}
            emissiveIntensity={0.3}
            roughness={0.1}
            metalness={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}
