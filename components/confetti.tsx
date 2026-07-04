"use client"

import { useEffect, useState } from "react"

const CORES = [
  "var(--brand-green)",
  "var(--brand-purple)",
  "var(--brand-orange)",
  "var(--brand-turquoise)",
  "var(--brand-gold)",
  "var(--brand-pink)",
]

export function Confetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; cor: string }[]>([])

  useEffect(() => {
    if (fire === 0) return
    const novos = Array.from({ length: 40 }, (_, i) => ({
      id: fire * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      cor: CORES[Math.floor(Math.random() * CORES.length)],
    }))
    setPieces(novos)
    const t = setTimeout(() => setPieces([]), 2600)
    return () => clearTimeout(t)
  }, [fire])

  if (pieces.length === 0) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{ left: `${p.left}%`, background: p.cor, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  )
}
