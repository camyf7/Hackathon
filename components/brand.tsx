import Image from "next/image";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import type { Banner } from "@/lib/types";
import type { IconeId } from "@/lib/rewards";
import { RewardIcon } from "@/components/rewards/reward-icon";
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

export function XpShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2.5 4 5.5v5.2c0 5 3.4 8.6 8 10.8 4.6-2.2 8-5.8 8-10.8V5.5L12 2.5Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="14.2"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="800"
        fill="currentColor"
        fontFamily="var(--font-baloo), ui-sans-serif, system-ui, sans-serif"
      >
        XP
      </text>
    </svg>
  )
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

/** Um "avatar" pode ser um emoji (ex: "🦊") ou um caminho de imagem (ex: "/avatar1.png"). */
function isImagePath(avatar: string): boolean {
  return avatar.startsWith("/") || avatar.startsWith("http")
}

/**
 * Foto de perfil exibida no banner. Prioridade:
 * 1. Ícone da Trilha de Recompensas (icone_selecionado), se já houver algum resgatado.
 * 2. Avatar do aluno — pode ser um emoji clássico OU uma imagem (/avatar1.png, /icone13.jpg...).
 */
export function BannerPerfil({
  banner,
  avatar,
  icone,
  nome,
  className,
  children,
}: {
  banner: Banner | undefined
  avatar: string
  icone?: IconeId | string
  nome?: string
  className?: string
  children?: React.ReactNode
}) {
  const temIconeRecompensa = !!icone && icone !== "default"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-4",
        banner?.gradiente ?? "bg-gradient-to-r from-sky-300 to-cyan-200",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/85 shadow-md">
          {temIconeRecompensa ? (
            <RewardIcon icone={icone!} className="size-16 rounded-2xl" />
          ) : isImagePath(avatar) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="size-16 rounded-2xl object-cover" />
          ) : (
            <span className="text-4xl">{avatar}</span>
          )}
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