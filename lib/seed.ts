import type {
  Aluno,
  Banner,
  DB,
  Escola,
  Exercicio,
  Missao,
  Presenca,
  ProgressoTrilha,
  RecompensaReal,
  Squad,
  Trilha,
  Turma,
} from "./types"
import { adicionarDias, hojeISO, nivelDoXp } from "./game"

// ---------- Trilhas / Exercícios ----------
function ex(
  trilha_id: string,
  nivel: number,
  pergunta: string,
  opcoes: string[],
  resposta_correta: number,
  xp = 15,
): Exercicio {
  return {
    id: `${trilha_id}-n${nivel}-${Math.random().toString(36).slice(2, 7)}`,
    trilha_id,
    nivel,
    tipo: "multipla",
    pergunta,
    opcoes,
    resposta_correta,
    xp_recompensa: xp,
  }
}

const trilhas: Trilha[] = [
  {
    id: "mat",
    nome: "Matemática",
    emoji: "🔢",
    cor: "green",
    niveis: 5,
    exercicios: [
      ex("mat", 1, "Quanto é 7 + 5?", ["10", "11", "12", "13"], 2),
      ex("mat", 2, "Quanto é 9 × 3?", ["27", "18", "21", "24"], 0),
      ex("mat", 3, "Qual é a metade de 48?", ["22", "24", "26", "28"], 1),
      ex("mat", 4, "Quanto é 144 ÷ 12?", ["11", "12", "13", "14"], 1),
      ex("mat", 5, "Qual fração equivale a 0,5?", ["1/3", "2/5", "1/2", "3/4"], 2, 25),
    ],
  },
  {
    id: "port",
    nome: "Português",
    emoji: "📚",
    cor: "purple",
    niveis: 5,
    exercicios: [
      ex("port", 1, "Qual palavra é um substantivo?", ["correr", "bonito", "cachorro", "rápido"], 2),
      ex("port", 2, "Qual é o plural de 'pão'?", ["pães", "pãos", "pão", "pãoes"], 0),
      ex("port", 3, "'Casa' é uma palavra:", ["oxítona", "paroxítona", "proparoxítona", "monossílaba"], 1),
      ex("port", 4, "Qual frase está correta?", ["Nós vai", "Eles foi", "Nós fomos", "Eu vão"], 2),
      ex("port", 5, "Antônimo de 'alegre':", ["feliz", "contente", "triste", "animado"], 2, 25),
    ],
  },
  {
    id: "cie",
    nome: "Ciências",
    emoji: "🔬",
    cor: "turquoise",
    niveis: 5,
    exercicios: [
      ex("cie", 1, "Qual planeta é o nosso?", ["Marte", "Terra", "Vênus", "Júpiter"], 1),
      ex("cie", 2, "As plantas produzem energia pela:", ["respiração", "fotossíntese", "digestão", "evaporação"], 1),
      ex("cie", 3, "Qual é um mamífero?", ["tubarão", "sapo", "baleia", "águia"], 2),
      ex("cie", 4, "A água ferve a quantos graus?", ["50°C", "80°C", "100°C", "120°C"], 2),
      ex("cie", 5, "Qual gás respiramos para viver?", ["gás carbônico", "hidrogênio", "oxigênio", "hélio"], 2, 25),
    ],
  },
  {
    id: "hist",
    nome: "História",
    emoji: "🏛️",
    cor: "orange",
    niveis: 5,
    exercicios: [
      ex("hist", 1, "Em que ano o Brasil foi 'descoberto'?", ["1500", "1600", "1400", "1700"], 0),
      ex("hist", 2, "Quem proclamou a Independência?", ["D. João", "D. Pedro I", "Tiradentes", "Getúlio"], 1),
      ex("hist", 3, "A escravidão foi abolida pela:", ["Lei Áurea", "Lei Seca", "Lei do Ventre", "Constituição"], 0),
      ex("hist", 4, "Capital do Brasil é:", ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], 2),
      ex("hist", 5, "Os primeiros habitantes do Brasil foram os:", ["portugueses", "indígenas", "africanos", "espanhóis"], 1, 25),
    ],
  },
  {
    id: "ing",
    nome: "Inglês",
    emoji: "🇬🇧",
    cor: "pink",
    niveis: 5,
    exercicios: [
      ex("ing", 1, "Como se diz 'gato' em inglês?", ["dog", "cat", "bird", "fish"], 1),
      ex("ing", 2, "'Hello' significa:", ["tchau", "olá", "obrigado", "por favor"], 1),
      ex("ing", 3, "Qual é a cor 'blue'?", ["vermelho", "verde", "azul", "amarelo"], 2),
      ex("ing", 4, "'I am' significa:", ["eu sou", "você é", "eles são", "nós somos"], 0),
      ex("ing", 5, "Plural de 'child':", ["childs", "childes", "children", "childrens"], 2, 25),
    ],
  },
]

// ---------- Banners (recompensas dentro do jogo) ----------
const banners: Banner[] = [
  { id: "b_ceu", nome: "Céu de Verão", raridade: "comum", custo_xp: 0, gradiente: "bg-gradient-to-r from-sky-300 to-cyan-200" },
  { id: "b_folha", nome: "Folhas ao Vento", raridade: "comum", custo_xp: 150, gradiente: "bg-gradient-to-r from-lime-300 to-emerald-300" },
  { id: "b_por", nome: "Pôr do Sol", raridade: "raro", custo_xp: 300, gradiente: "bg-gradient-to-r from-orange-400 to-pink-400" },
  { id: "b_oceano", nome: "Fundo do Mar", raridade: "raro", custo_xp: 500, gradiente: "bg-gradient-to-r from-cyan-400 to-blue-500" },
  { id: "b_aurora", nome: "Aurora Boreal", raridade: "epico", custo_xp: 800, gradiente: "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-teal-400" },
  { id: "b_galaxia", nome: "Galáxia Distante", raridade: "epico", custo_xp: 1200, gradiente: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" },
  { id: "b_ouro", nome: "Chuva de Ouro", raridade: "lendario", custo_xp: 1800, gradiente: "bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500" },
  { id: "b_dragao", nome: "Sopro do Dragão", raridade: "lendario", custo_xp: 2500, gradiente: "bg-gradient-to-r from-red-500 via-orange-500 to-amber-400" },
]

// ---------- Recompensas do mundo real ----------
const recompensas_reais: RecompensaReal[] = [
  { id: "r_ponto", nome: "Ponto extra na disciplina", emoji: "➕", criterio_xp: 500 },
  { id: "r_bombom", nome: "Caixa de bombom", emoji: "🍬", criterio_xp: 700 },
  { id: "r_musica", nome: "Escolher a música do intervalo", emoji: "🎵", criterio_xp: 400 },
  { id: "r_certificado", nome: "Certificado de destaque", emoji: "📜", criterio_xp: 1000 },
]

// ---------- Geração de escolas, turmas, alunos e squads ----------
const AVATARES = ["🦊", "🐼", "🦁", "🐨", "🐸", "🦉", "🐙", "🦄", "🐵", "🐯", "🐧", "🦖", "🐢", "🐝", "🦋"]
const NOMES = [
  "Ana Beatriz", "Lucas Silva", "Maria Clara", "Pedro Henrique", "Júlia Santos", "Gabriel Souza",
  "Larissa Lima", "Enzo Oliveira", "Sophia Costa", "Miguel Rocha", "Helena Alves", "Davi Martins",
  "Valentina Dias", "Arthur Gomes", "Laura Ferreira", "Bernardo Nunes", "Manuela Ribeiro", "Théo Cardoso",
  "Alice Barbosa", "Heitor Mendes", "Cecília Pinto", "Rafael Araújo", "Isabela Melo", "Nicolas Freitas",
  "Lorena Castro", "Bento Correia", "Antonella Ramos", "Gael Teixeira", "Marina Lopes", "Vicente Moura",
]

function bannersIniciais(xp: number): string[] {
  return banners.filter((b) => xp >= b.custo_xp).map((b) => b.id)
}

function badgesIniciais(xp: number, streak: number): string[] {
  const b: string[] = ["primeiro_passo"]
  if (streak >= 3) b.push("streak_3")
  if (streak >= 7) b.push("streak_7")
  if (nivelDoXp(xp) >= 5) b.push("nivel_5")
  if (xp >= 1000) b.push("mil_xp")
  return b
}

export function criarSeed(): DB {
  const hoje = hojeISO()
  const escolas: Escola[] = [
    { id: "esc1", nome: "EM Prof. Manoel de Barros" },
    { id: "esc2", nome: "EM Tabatinga do Mar" },
  ]

  const turmas: Turma[] = []
  const alunos: Aluno[] = []
  const squads: Squad[] = []
  const progresso: ProgressoTrilha[] = []
  const presencas: Presenca[] = []

  const seriesPorEscola = [
    ["6º A", "7º B", "9º A"],
    ["5º A", "8º A", "1º EM"],
  ]

  let nomeIdx = 0
  const squadEmojis = ["🚀", "⭐", "🐉", "🔥", "🌈", "⚡", "🦸", "🎯"]
  let squadEmojiIdx = 0

  escolas.forEach((escola, ei) => {
    seriesPorEscola[ei].forEach((serieNome, ti) => {
      const turmaId = `${escola.id}-t${ti}`
      turmas.push({
        id: turmaId,
        escola_id: escola.id,
        nome: serieNome,
        serie: serieNome,
      })

      const qtd = 5 + ((ei + ti) % 2) // 5 ou 6 alunos
      const alunosTurma: Aluno[] = []
      for (let i = 0; i < qtd; i++) {
        // XP variado; garante ao menos um aluno com baixo engajamento por turma
        let xp = Math.round([80, 340, 620, 950, 1450, 1900][i % 6] * (0.7 + Math.random() * 0.6))
        let streak = [1, 4, 8, 12, 0, 6][i % 6]
        let telaSemana = [45, 90, 140, 210, 12, 160][i % 6]
        // primeiro aluno da 1ª turma de cada escola = alerta (streak baixo, trilha parada)
        const alerta = i === 0
        if (alerta) {
          xp = 90
          streak = 0
          telaSemana = 8
        }
        // um aluno com tempo de tela excessivo (alerta de uso compulsivo)
        const excessivo = i === 3
        if (excessivo) telaSemana = 320

        const aluno: Aluno = {
          id: `${turmaId}-a${i}`,
          nome: NOMES[nomeIdx % NOMES.length],
          turma_id: turmaId,
          avatar: AVATARES[nomeIdx % AVATARES.length],
          xp_total: xp,
          nivel: nivelDoXp(xp),
          streak_dias: streak,
          squad_id: null,
          tempo_tela_minutos_hoje: alerta ? 3 : Math.round(telaSemana / 7),
          tempo_tela_minutos_semana: telaSemana,
          tem_dispositivo_proprio: Math.random() > 0.4,
          banners_desbloqueados: bannersIniciais(xp),
          banner_equipado: bannersIniciais(xp)[Math.min(1, bannersIniciais(xp).length - 1)] ?? "b_ceu",
          badges: badgesIniciais(xp, streak),
          ultima_presenca: streak > 0 ? hoje : adicionarDias(hoje, -3),
        }
        nomeIdx++
        alunos.push(aluno)
        alunosTurma.push(aluno)

        // progresso em trilhas
        trilhas.forEach((tr) => {
          const nivelAtual = alerta ? 1 : Math.min(tr.niveis, 1 + (xp % 5))
          const completos: string[] = []
          tr.exercicios.forEach((e) => {
            if (e.nivel < nivelAtual) completos.push(e.id)
          })
          progresso.push({
            aluno_id: aluno.id,
            trilha_id: tr.id,
            nivel_atual: nivelAtual,
            exercicios_completos: completos,
          })
        })

        // presença dos últimos 7 dias
        for (let d = 6; d >= 0; d--) {
          const data = adicionarDias(hoje, -d)
          const presente = alerta ? Math.random() > 0.7 : Math.random() > 0.15
          presencas.push({
            aluno_id: aluno.id,
            data,
            presente,
            justificada: !presente && Math.random() > 0.5,
          })
        }
      }

      // forma squads (uma dupla, um trio, resto squad)
      const ids = alunosTurma.map((a) => a.id)
      const grupos: string[][] = []
      if (ids.length >= 5) {
        grupos.push(ids.slice(0, 2)) // dupla
        grupos.push(ids.slice(2, 5)) // trio
        if (ids.length > 5) grupos.push(ids.slice(5)) // resto
      } else {
        grupos.push(ids)
      }
      grupos.forEach((g, gi) => {
        if (g.length === 0) return
        const squadId = `${turmaId}-sq${gi}`
        const tipo = g.length === 2 ? "dupla" : g.length === 3 ? "trio" : "squad"
        const xpColetivo = g.reduce((s, id) => s + (alunos.find((a) => a.id === id)?.xp_total ?? 0), 0)
        squads.push({
          id: squadId,
          turma_id: turmaId,
          nome: ["Foguetes", "Estrelas", "Dragões", "Chamas", "Arco-íris"][gi % 5],
          tipo,
          alunos_ids: g,
          xp_coletivo: xpColetivo,
          emoji: squadEmojis[squadEmojiIdx++ % squadEmojis.length],
        })
        g.forEach((id) => {
          const a = alunos.find((x) => x.id === id)
          if (a) a.squad_id = squadId
        })
      })
    })
  })

  const missoes: Missao[] = squads.slice(0, 6).map((sq, i) => ({
    id: `m${i}`,
    turma_id: sq.turma_id,
    squad_id: sq.id,
    titulo: "Missão do Squad",
    descricao: "Todos os membros completam 1 exercício essa semana",
    xp_recompensa: 50,
    concluida: false,
  }))

  return {
    escolas,
    turmas,
    alunos,
    squads,
    trilhas,
    progresso,
    presencas,
    banners,
    recompensas_reais,
    resgates: [],
    missoes,
    atividades: [],
    data_atual: hoje,
  }
}
