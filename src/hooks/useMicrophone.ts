import { useRef, useCallback, useState } from 'react'

export function useMicrophone() {
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supported = !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  )

  const startListening = useCallback(async (): Promise<boolean> => {
    try {
      // iOS Safari requires AudioContext creation inside a user gesture handler
      const AudioContextClass =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) throw new Error('AudioContext non supportato')

      const audioCtx = new AudioContextClass()
      audioCtxRef.current = audioCtx

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Microfono non disponibile')
      return false
    }
  }, [])

  const getVolume = useCallback((): number => {
    if (!analyserRef.current || !dataArrayRef.current) return 0
    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    const data = dataArrayRef.current
    let sum = 0
    for (let i = 0; i < data.length; i++) sum += data[i]
    return sum / data.length
  }, [])

  /** Max single frequency bin value (0-255). High for loud sustained input. */
  const getPeak = useCallback((): number => {
    if (!dataArrayRef.current) return 0
    let peak = 0
    const data = dataArrayRef.current
    for (let i = 0; i < data.length; i++) {
      if (data[i] > peak) peak = data[i]
    }
    return peak
  }, [])

  const stopListening = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    streamRef.current = null
    audioCtxRef.current = null
    analyserRef.current = null
    dataArrayRef.current = null
  }, [])

  return { startListening, getVolume, getPeak, stopListening, error, supported }
}
