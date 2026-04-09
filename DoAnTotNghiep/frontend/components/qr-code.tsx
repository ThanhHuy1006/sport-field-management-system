"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

// Simple QR Code generator using canvas
export function QRCode({ value, size = 200, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple QR-like pattern generator (for demo purposes)
    // In production, use a proper QR library like 'qrcode'
    const moduleCount = 25
    const moduleSize = size / moduleCount

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Generate pattern based on value hash
    const hash = hashCode(value)
    const pattern = generatePattern(hash, moduleCount)

    // Draw modules
    ctx.fillStyle = "#000000"
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Draw finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize)
    drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize)
    drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize)
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} className={className} />
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function generatePattern(hash: number, size: number): boolean[][] {
  const pattern: boolean[][] = []
  let seed = hash

  for (let row = 0; row < size; row++) {
    pattern[row] = []
    for (let col = 0; col < size; col++) {
      // Skip finder pattern areas
      if ((row < 8 && col < 8) || (row < 8 && col >= size - 8) || (row >= size - 8 && col < 8)) {
        pattern[row][col] = false
      } else {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        pattern[row][col] = seed % 3 === 0
      }
    }
  }

  return pattern
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) {
  // Outer black square
  ctx.fillStyle = "#000000"
  ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize)

  // Inner white square
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize)

  // Center black square
  ctx.fillStyle = "#000000"
  ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize)
}
