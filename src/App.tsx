import { useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CakeScene from './components/CakeScene'
import BirthdayMessage from './components/BirthdayMessage'
import { useYouTubeAudio } from './hooks/useYouTubeAudio'

type Phase = 'initial' | 'listening' | 'complete'

export default function App() {
  const [phase, setPhase] = useState<Phase>('initial')
  const [candlesLit, setCandlesLit] = useState<boolean[]>(() => Array(21).fill(true))
  const [volume, setVolume] = useState(0)
  const extinguishingRef = useRef(false)
  const { playIntro, playBirthday } = useYouTubeAudio()

  const handleMicStart = useCallback(() => {
    setPhase('listening')
    playIntro()
  }, [playIntro])

  const handleBlowDetected = useCallback(() => {
    if (extinguishingRef.current) return
    extinguishingRef.current = true

    // Random delay per candle: 0–800ms
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

    // Switch to birthday screen + song after candles finish
    setTimeout(() => {
      playBirthday()
      setPhase('complete')
    }, 1800)
  }, [playBirthday])

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
              onMusicStart={playIntro}
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
