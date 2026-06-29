import { useRef, useCallback, useEffect } from 'react'

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement | string, opts: object) => YTPlayer
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  destroy(): void
  getPlayerState(): number
}

const INTRO_ID = 'goTXPdm_rH8'
const BIRTHDAY_ID = 'Nb1-vi2lCQI'

export function useYouTubeAudio() {
  const introRef = useRef<YTPlayer | null>(null)
  const birthdayRef = useRef<YTPlayer | null>(null)
  const pendingRef = useRef<'intro' | 'birthday' | null>(null)
  const apiReadyRef = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = document.createElement('div')
    container.style.cssText =
      'position:fixed;width:1px;height:1px;top:0;left:0;overflow:hidden;opacity:0.01;pointer-events:none;z-index:-1;'
    document.body.appendChild(container)
    containerRef.current = container

    const introEl = document.createElement('div')
    introEl.id = 'yt-intro-player'
    const birthdayEl = document.createElement('div')
    birthdayEl.id = 'yt-birthday-player'
    container.appendChild(introEl)
    container.appendChild(birthdayEl)

    const initPlayers = () => {
      apiReadyRef.current = true

      introRef.current = new window.YT.Player(introEl, {
        height: '1',
        width: '1',
        videoId: INTRO_ID,
        playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: INTRO_ID, rel: 0, mute: 0 },
        events: {
          onReady: () => {
            if (pendingRef.current === 'intro') {
              pendingRef.current = null
              try { introRef.current?.playVideo() } catch { /* ignore */ }
            }
          },
        },
      })

      birthdayRef.current = new window.YT.Player(birthdayEl, {
        height: '1',
        width: '1',
        videoId: BIRTHDAY_ID,
        playerVars: { autoplay: 0, controls: 0, rel: 0, mute: 0 },
        events: {
          onReady: () => {
            if (pendingRef.current === 'birthday') {
              pendingRef.current = null
              try {
                introRef.current?.pauseVideo()
                birthdayRef.current?.playVideo()
              } catch { /* ignore */ }
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayers()
    } else {
      if (!document.getElementById('yt-iframe-api')) {
        const script = document.createElement('script')
        script.id = 'yt-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
      window.onYouTubeIframeAPIReady = initPlayers
    }

    return () => { container.remove() }
  }, [])

  const playIntro = useCallback(() => {
    if (!apiReadyRef.current || !introRef.current) {
      pendingRef.current = 'intro'
      return
    }
    try { introRef.current.playVideo() } catch {
      pendingRef.current = 'intro'
    }
  }, [])

  const playBirthday = useCallback(() => {
    if (!apiReadyRef.current || !birthdayRef.current) {
      pendingRef.current = 'birthday'
      return
    }
    try {
      introRef.current?.pauseVideo()
      birthdayRef.current.playVideo()
    } catch {
      pendingRef.current = 'birthday'
    }
  }, [])

  return { playIntro, playBirthday }
}
