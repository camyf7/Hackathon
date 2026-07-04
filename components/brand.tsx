import Image from "next/image";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import type { Banner } from "@/lib/types";
import { progressoNivel, xpNoNivel, XP_POR_NIVEL } from "@/lib/game";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="Trilha+"
        width={160}
        height={44}
        priority
        className="h-11 w-auto object-contain"
      />
    </div>
  );
}

export function StreakFlame({ dias, className }: { dias: number; className?: string }) {
  const aceso = dias > 0
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 font-display font-extrabold",
        aceso ? "bg-brand-orange/15 text-brand-orange" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Flame className={cn("size-4", aceso && "fill-brand-orange")} />
      <span>{dias}</span>
    </div>
  )
}

export function XpBar({
  xp,
  className,
  mostrarTexto = true,
}: {
  xp: number
  className?: string
  mostrarTexto?: boolean
}) {
  const pct = progressoNivel(xp)
  const noNivel = xpNoNivel(xp)
  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-green transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        >
          <span className="absolute inset-x-2 top-0.5 h-1 rounded-full bg-white/40" />
        </div>
      </div>
      {mostrarTexto && (
        <p className="mt-1 text-right text-xs font-bold text-muted-foreground">
          {noNivel}/{XP_POR_NIVEL} XP
        </p>
      )}
    </div>
  )
}

export function BannerPerfil({
  banner,
  avatar,
  nome,
  className,
  children,
}: {
  banner: Banner | undefined
  avatar: string
  nome?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-4",
        banner?.gradiente ?? "bg-gradient-to-r from-sky-300 to-cyan-200",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/85 text-4xl shadow-md">
          {avatar}
        </span>
        {nome && (
          <span className="font-display text-xl font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            {nome}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
