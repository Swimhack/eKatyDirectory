'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseSoundOptions {
  volume?: number
  loop?: boolean
  autoplay?: boolean
}

export function useSound(url: string, options: UseSoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { volume = 1, loop = false, autoplay = false } = options

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(url)
      audioRef.current.volume = volume
      audioRef.current.loop = loop
      
      if (autoplay) {
        audioRef.current.play().catch(() => {
          // Autoplay was prevented, which is common
          console.log('Autoplay prevented')
        })
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [url, volume, loop, autoplay])

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.error('Error playing sound:', err)
      })
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume))
    }
  }, [])

  return { play, stop, setVolume }
}