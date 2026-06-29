import { useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CakeScene from './components/CakeScene'
import BirthdayMessage from './components/BirthdayMessage'

type Phase = 'initial' | 'listening' | 'complete'

export default function App() {
  const [phase, setPhase] = useState<Phase>('initial')
  const [candlesLit, setCandlesLit] = useState<boolean[]>(() => Array(21).fill(true))
  const [volume, setVolume] = useState(0)
  const extinguishingRef = useRef(false)

  const handleMicStart = useCallback(() => {
    setPhase('listening')
  }, [])

  const handleBlowDetected = useCallback(() => {
    if (extinguishingRef.current) return
    extinguishingRef.current = true

    for (let i = 0; i < 21; i++) {
      const delay = Math.random() * 800
      setTimeout(() => {
        setCandlesLit((prev) => {
          const next = [...prev]
          next[i] = false
          return next
        })
      }, delay)
    }

    setTimeout(() => {
      setPhase('complete')
    }, 1800)
  }, [])

  const handleReset = useCallback(() => {
    extinguishingRef.current = false
    setPhase('initial')
    setCandlesLit(Array(21).fill(true))
    setVolume(0)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0D0D0D' }}>
      <AnimatePresence mode="wait">
        {phase !== 'complete' ? (
          <motion.div
            key="cake"
            style={{ position: 'absolute', inset: 0 }}
            exit={{ scale: 0.82, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            <CakeScene
              phase={phase as 'initial' | 'listening'}
              candlesLit={candlesLit}
              volume={volume}
              onMicStart={handleMicStart}
              onBlowDetected={handleBlowDetected}
              onVolumeChange={setVolume}
            />
          </motion.div>
        ) : (
          <motion.div
            key="birthday"
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BirthdayMessage onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
