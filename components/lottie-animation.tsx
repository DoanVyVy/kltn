"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import lottie, { type AnimationItem } from "lottie-web"

interface LottieAnimationProps {
  animationData: any
  loop?: boolean
  autoplay?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  className = "",
  style = {},
}: LottieAnimationProps) {
  const animationContainer = useRef<HTMLDivElement>(null)
  const anim = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (animationContainer.current && animationData) {
      anim.current = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop,
        autoplay,
        animationData,
      })
    }

    return () => {
      if (anim.current) {
        anim.current.destroy()
      }
    }
  }, [animationData, loop, autoplay])

  // Add a fallback when animationData is not provided
  if (!animationData) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={style}>
        <div className="animate-pulse rounded-full bg-gray-200 h-16 w-16"></div>
      </div>
    )
  }

  return <div ref={animationContainer} className={className} style={style} aria-hidden="true" />
}

