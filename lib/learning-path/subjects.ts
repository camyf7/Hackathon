export type SubjectColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "teal"
  | "pink"
  | "grey"

export interface SubjectWorld {
  id: string
  trilhaId: string
  nome: string
  emoji: string
  descricao: string
  cor: SubjectColor
  gradient: string
  glow: string
}

export const SUBJECT_WORLDS: SubjectWorld[] = [
  {
    id: "mat",
    trilhaId: "mat",
    nome: "Matemática",
    emoji: "🔢",
    descricao: "Desenvolva seu raciocínio lógico e resolva problemas com confiança.",
    cor: "blue",
    gradient: "from-blue-500/20 to-cyan-500/10",
    glow: "shadow-blue-500/30",
  },
  {
    id: "port",
    trilhaId: "port",
    nome: "Português",
    emoji: "📚",
    descricao: "Domine a língua, leitura e escrita com clareza e expressão.",
    cor: "green",
    gradient: "from-emerald-500/20 to-green-500/10",
    glow: "shadow-emerald-500/30",
  },
  {
    id: "hist",
    trilhaId: "hist",
    nome: "História",
    emoji: "🏛️",
    descricao: "Explore o passado e compreenda o presente com contexto.",
    cor: "purple",
    gradient: "from-purple-500/20 to-violet-500/10",
    glow: "shadow-purple-500/30",
  },
  {
    id: "cie",
    trilhaId: "cie",
    nome: "Ciências",
    emoji: "🔬",
    descricao: "Investigue o mundo natural com curiosidade científica.",
    cor: "orange",
    gradient: "from-orange-500/20 to-amber-500/10",
    glow: "shadow-orange-500/30",
  },
  {
    id: "geo",
    trilhaId: "geo",
    nome: "Geografia",
    emoji: "🌍",
    descricao: "Conheça territórios, culturas e relações com o planeta.",
    cor: "teal",
    gradient: "from-teal-500/20 to-cyan-500/10",
    glow: "shadow-teal-500/30",
  },
  {
    id: "ing",
    trilhaId: "ing",
    nome: "Inglês",
    emoji: "🇬🇧",
    descricao: "Amplie horizontes com comunicação em outra língua.",
    cor: "pink",
    gradient: "from-pink-500/20 to-rose-500/10",
    glow: "shadow-pink-500/30",
  },
  {
    id: "art",
    trilhaId: "art",
    nome: "Artes",
    emoji: "🎨",
    descricao: "Expresse ideias por meio da criatividade e sensibilidade.",
    cor: "grey",
    gradient: "from-slate-400/20 to-zinc-500/10",
    glow: "shadow-slate-400/30",
  },
]

export const SUBJECT_COLOR_STYLES: Record<
  SubjectColor,
  { bg: string; ring: string; text: string; line: string; node: string }
> = {
  blue: {
    bg: "bg-blue-500",
    ring: "ring-blue-400/50",
    text: "text-blue-400",
    line: "stroke-blue-500",
    node: "from-blue-500 to-cyan-500",
  },
  green: {
    bg: "bg-emerald-500",
    ring: "ring-emerald-400/50",
    text: "text-emerald-400",
    line: "stroke-emerald-500",
    node: "from-emerald-500 to-green-500",
  },
  purple: {
    bg: "bg-purple-500",
    ring: "ring-purple-400/50",
    text: "text-purple-400",
    line: "stroke-purple-500",
    node: "from-purple-500 to-violet-500",
  },
  orange: {
    bg: "bg-orange-500",
    ring: "ring-orange-400/50",
    text: "text-orange-400",
    line: "stroke-orange-500",
    node: "from-orange-500 to-amber-500",
  },
  teal: {
    bg: "bg-teal-500",
    ring: "ring-teal-400/50",
    text: "text-teal-400",
    line: "stroke-teal-500",
    node: "from-teal-500 to-cyan-500",
  },
  pink: {
    bg: "bg-pink-500",
    ring: "ring-pink-400/50",
    text: "text-pink-400",
    line: "stroke-pink-500",
    node: "from-pink-500 to-rose-500",
  },
  grey: {
    bg: "bg-slate-500",
    ring: "ring-slate-400/50",
    text: "text-slate-400",
    line: "stroke-slate-500",
    node: "from-slate-500 to-zinc-500",
  },
}

export function getSubjectWorld(trilhaId: string): SubjectWorld | undefined {
  return SUBJECT_WORLDS.find((s) => s.trilhaId === trilhaId)
}
