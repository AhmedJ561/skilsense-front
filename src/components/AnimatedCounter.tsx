'use client'

import React, { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  end: number
  suffix?: string
  duration?: number
  className?: string
  fontSize?: string | { xs?: string, sm?: string, md?: string, lg?: string }
}

export default function AnimatedCounter({ 
  end, 
  suffix = '', 
  duration = 2000, 
  className = '',
  fontSize = 'inherit'
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const endTime = startTime + duration

    const updateCount = () => {
      const now = Date.now()
      const remaining = Math.max((endTime - now) / duration, 0)
      const current = Math.round(end - end * remaining)
      
      setCount(current)

      if (remaining > 0) {
        requestAnimationFrame(updateCount)
      }
    }

    requestAnimationFrame(updateCount)
  }, [isVisible, end, duration])

  const getFontSize = () => {
    if (typeof fontSize === 'string') return fontSize
    // For responsive objects, return the md size as default or fallback to 'inherit'
    return fontSize?.md || fontSize?.lg || fontSize?.sm || fontSize?.xs || 'inherit'
  }

  return (
    <span 
      ref={ref} 
      className={className}
      style={{
        fontSize: getFontSize(),
        display: 'inline-block',
        minWidth: '1ch'
      }}
    >
      {count}{suffix}
    </span>
  )
}
