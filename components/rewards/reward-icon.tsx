import { UserRound } from "lucide-react"
import type { IconeId } from "@/lib/rewards"
import { cn } from "@/lib/utils"

/**
 * Mapeia cada ícone de recompensa (exceto "default") para a imagem correspondente
 * em /public. A ordem segue exatamente a ordem de RECOMPENSAS em lib/rewards.ts:
 * shield (nível 2) → icone1.jpg ... mountain (nível 13) → icone12.jpg.
 */
const ICON_IMAGE_MAP: Record<Exclude<IconeId, "default">, string> = {
  shield: "/icone1.jpg",
  star: "/icone2.jpg",
  book: "/icone3.jpg",
  medal: "/icone4.jpg",
  rocket: "/icone5.jpg",
  crown: "/icone6.jpg",
  lightbulb: "/icone7.jpg",
  gem: "/icone8.jpg",
  trophy: "/icone9.jpg",
  planet: "/icone10.jpg",
  bolt: "/icone11.jpg",
  mountain: "/icone12.jpg",
}

export function RewardIcon({
  icone,
  className,
}: {
  icone: IconeId | string
  className?: string
}) {
  // Sem recompensa resgatada ainda: mantém o ícone de avatar padrão (não há imagem pra esse caso).
  if (!icone || icone === "default" || !(icone in ICON_IMAGE_MAP)) {
    return <UserRound className={cn("size-6", className)} />
  }

  const src = ICON_IMAGE_MAP[icone as Exclude<IconeId, "default">]

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn("size-6 rounded-full object-cover", className)}
    />
  )
}