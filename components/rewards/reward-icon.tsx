import {
  Shield,
  Star,
  BookOpen,
  Medal,
  Rocket,
  Crown,
  Lightbulb,
  Gem,
  Trophy,
  Globe2,
  Zap,
  Mountain,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import type { IconeId } from "@/lib/rewards"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<IconeId, LucideIcon> = {
  default: UserRound,
  shield: Shield,
  star: Star,
  book: BookOpen,
  medal: Medal,
  rocket: Rocket,
  crown: Crown,
  lightbulb: Lightbulb,
  gem: Gem,
  trophy: Trophy,
  planet: Globe2,
  bolt: Zap,
  mountain: Mountain,
}

export function RewardIcon({
  icone,
  className,
}: {
  icone: IconeId | string
  className?: string
}) {
  const Icon = ICON_MAP[icone as IconeId] ?? UserRound
  return <Icon className={cn("size-6", className)} />
}
