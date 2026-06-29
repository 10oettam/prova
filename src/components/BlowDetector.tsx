import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

interface Props {
  getVolume: () => number
  getPeak: () => number
  onVolumeChange: (v: number) => void
  onBlowDetected: () => void
}

const THRESHOLD_AVG = 42   // average volume — reduced from 65
const THRESHOLD_PEAK = 75  // peak bin — reduced from 110
const SUSTAIN_MS = 500     // 500ms sustained — reduced from 900ms

export default function BlowDetector({ getVolume, getPeak, onVolumeChange, onBlowDetected }: Props) {
  const blowStartRef = useRef<number | null>(null)
  const detectedRef = useRef(false)
  const lastUiUpdateRef = useRef(0)

  useFrame(() => {
    if (detectedRef.current) return

    const vol = getVolume()
    const peak = getPeak()

    const now = Date.now()
    if (now - lastUiUpdateRef.current > 80) {
      lastUiUpdateRef.current = now
      onVolumeChange(vol)
    }

    const isBlowing = vol > THRESHOLD_AVG && peak > THRESHOLD_PEAK

    if (isBlowing) {
      if (blowStartRef.current === null) {
        blowStartRef.current = now
      } else if (now - blowStartRef.current >= SUSTAIN_MS) {
        detectedRef.current = true
        onBlowDetected()
      }
    } else {
      blowStartRef.current = null
    }
  })

  return null
}
