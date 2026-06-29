import { motion } from 'framer-motion'
import Confetti from './Confetti'

interface Props {
  onReset: () => void
}

const TITLE = 'Buon Compleanno!'

const letterVariants = {
  hidden: { y: -80, opacity: 0, rotate: -15 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring' as const,
      stiffness: 280,
      damping: 18,
    },
  }),
}

const bounceVariants = {
  hidden: { scale: 0, rotate: -20 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { delay: 1.1, type: 'spring' as const, stiffness: 350, damping: 12 },
  },
}

export default function BirthdayMessage({ onReset }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FF6B9D 0%, #C44DFF 100%)',
        overflow: 'hidden',
      }}
    >
      <Confetti />

      {/* Staggered title letters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 0,
          marginBottom: 16,
          padding: '0 24px',
        }}
      >
        {TITLE.split('').map((char, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'inline-block',
              fontSize: char === ' ' ? 14 : 26,
              fontWeight: 800,
              color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.25)',
              fontFamily: "'Georgia', serif",
              lineHeight: 1.1,
              width: char === ' ' ? '0.4em' : 'auto',
              letterSpacing: '-0.5px',
            }}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </div>

      {/* Cake emoji with bounce */}
      <motion.div
        variants={bounceVariants}
        initial="hidden"
        animate="visible"
        style={{ fontSize: 60, marginBottom: 16, lineHeight: 1 }}
      >
        🎂
      </motion.div>

      {/* Secondary text */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        style={{
          color: 'rgba(255,255,255,0.88)',
          fontSize: 15,
          textAlign: 'center',
          padding: '0 28px',
          marginBottom: 32,
          fontFamily: "'Georgia', serif",
          fontStyle: 'italic',
        }}
      >
        Che questa giornata sia speciale ✨
      </motion.p>

      {/* Replay button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.5 }}
        onClick={onReset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 32px',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'white',
          borderRadius: 20,
          fontSize: 16,
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          transition: 'transform 0.1s',
        }}
        whileTap={{ scale: 0.93 }}
      >
        🔄 Rifai
      </motion.button>
    </motion.div>
  )
}
