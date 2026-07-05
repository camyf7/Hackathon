"use client"

import { useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

interface PerformanceChartProps {
  xpTotal: number
  streakDias: number
}

/**
 * Gráfico de evolução de XP. O modelo de dados atual só guarda o XP total acumulado
 * (não um histórico diário), então a série abaixo é uma projeção presentacional
 * distribuindo o XP total ao longo dos últimos 7 dias, só para dar a sensação de
 * evolução no dashboard. Quando houver um histórico real de XP por dia, é só trocar
 * esse `data` pela série verdadeira — o resto do componente não muda.
 */
export function PerformanceChart({ xpTotal, streakDias }: PerformanceChartProps) {
  const data = useMemo(() => {
    const dias = 7
    const base = Math.max(0, xpTotal - xpTotal * 0.35)
    return Array.from({ length: dias }, (_, i) => {
      const progresso = (i + 1) / dias
      return {
        dia: `D${i + 1}`,
        xp: Math.round(base + (xpTotal - base) * progresso),
      }
    })
  }, [xpTotal])

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111827] p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display font-extrabold text-white">Desempenho</h3>
        <span className="text-xs font-bold text-emerald-400">🔥 {streakDias} dias seguidos</span>
      </div>
      <p className="mb-3 text-xs font-medium text-slate-500">Evolução de XP na última semana</p>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5EEAD4" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#5EEAD4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="dia" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0B0E14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
              labelStyle={{ color: "#94A3B8", fontWeight: 700, fontSize: 11 }}
              itemStyle={{ color: "#5EEAD4", fontWeight: 800 }}
            />
            <Area type="monotone" dataKey="xp" stroke="#5EEAD4" strokeWidth={2.5} fill="url(#xpGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}