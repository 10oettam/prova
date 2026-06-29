import { useRef, useCallback, useEffect } from 'react'

declare global {
  interface Window {
    YT: { Player: new (el: HTMLElement, opts: object) => YTPlayer; PlayerState: { ENDED: number } }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  setVolume(v: number): void
  destroy(): void
}

const INTRO_ID = 'goTXPdm_rH8'
const BIRTHDAY_ID = 'Nb1-vi2lCQI'

export function useYouTubeAudio() {
  const introRef = useRef<YTPlayer | null>(null)
  const birthdayRef = useRef<YTPlayer | null>(null)
  const pendingRef = useRef<'intro' | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Hidden container — 1px positioned off-screen
    const container = document.createElement('div')
    container.style.cssText =
      'position:fixed;width:1px;height:1px;top:0;left:0;overflow:hidden;opacity:0.01;pointer-events:none;z-index:-1;'
    document.body.appendChild(container)
    containerRef.current = container

    const introEl = document.createElement('div')
    const birthdayEl = document.createElement('div')
    container.appendChild(introEl)
    container.appendChild(birthdayEl)

    const initPlayers = () => {
      introRef.current = new window.YT.Player(introEl, {
        height: '1',
        width: '1',
        videoId: INTRO_ID,
        playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: INTRO_ID, rel: 0 },
        events: {
          onReady: () => {
            if (pendingRef.current === 'intro') {
              introRef.current?.playVideo()
              pendingRef.current = null
            }
          },
        },
      })

      birthdayRef.current = new window.YT.Player(birthdayEl, {
        height: '1',
        width: '1',
        videoId: BIRTHDAY_ID,
        playerVars: { autoplay: 0, controls: 0, rel: 0 },
      })
    }

    if (window.YT?.Player) {
      initPlayers()
    } else {
      // Inject the IFrame API script once
      if (!document.getElementById('yt-iframe-api')) {
        const script = document.createElement('script')
        script.id = 'yt-iframe-api'
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
      window.onYouTubeIframeAPIReady = initPlayers
    }

    return () => {
      container.remove()
    }
  }, [])

  const playIntro = useCallback(() => {
    if (introRef.current?.playVideo) {
      introRef.current.playVideo()
    } else {
      // API not yet ready — queue it
      pendingRef.current = 'intro'
    }
  }, [])

  const playBirthday = useCallback(() => {
    try {
      introRef.current?.pauseVideo()
      birthdayRef.current?.playVideo()
    } catch {
      // Silently fail — music is a nice-to-have
    }
  }, [])

  return { playIntro, playBirthday }
}
