export default function Table() {
  const woodDark = '#7B4F2E'
  const woodLight = '#A0673A'
  const clothColor = '#FFF0F8'

  return (
    <group>
      {/* Tablecloth — slightly wider, sits on top of table */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[3.55, 3.55, 0.06, 48]} />
        <meshStandardMaterial color={clothColor} roughness={0.9} />
      </mesh>

      {/* Table top */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[3.3, 3.3, 0.2, 48]} />
        <meshStandardMaterial color={woodLight} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Table edge ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.3, 0.06, 8, 48]} />
        <meshStandardMaterial color={woodDark} roughness={0.3} metalness={0.08} />
      </mesh>

      {/* 4 legs */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 2.4, -1.2, Math.sin(angle) * 2.4]}>
          <cylinderGeometry args={[0.12, 0.14, 2.4, 10]} />
          <meshStandardMaterial color={woodDark} roughness={0.5} />
        </mesh>
      ))}

      {/* Floor — large warm parquet plane */}
      <mesh position={[0, -2.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#C8965A" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* Floor board lines — subtle strips */}
      {[-6, -3, 0, 3, 6].map((offset, i) => (
        <mesh key={i} position={[offset, -2.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 40]} />
          <meshStandardMaterial color="#A0724A" roughness={0.9} />
        </mesh>
      ))}

      {/* Wall — back plane */}
      <mesh position={[0, 5, -8]} rotation={[0, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#FFE8F4" roughness={1} />
      </mesh>
      <mesh position={[-8, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#F0E4FF" roughness={1} />
      </mesh>
    </group>
  )
}
