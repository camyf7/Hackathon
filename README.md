# Submissão da Solução — Trilha+

<br/>

## 1. Identificação da equipe

| Campo | Informação |
|---|---|
| Nome da equipe | EducaDev |
| Integrantes | Camilly Ferreira, Ariel Vinicius, Karen de Carvalho e Ana vitória |
| Nome da solução | Trilha+ |
| Desafio | Desafio 4: Gamificação para engajamento educacional |

<br/>

## 2. Links de acesso

| Recurso | Link |
|---|---|
| Repositório de código | https://github.com/camyf7/Hackathon |
| Aplicação publicada  | https://educadev.netlify.app/aluno |
| Vídeo de demonstração  | https://drive.google.com/file/d/1dmXs6LdjhZewdaJ13viSCZz9AuLy385I/view?usp=sharing |



> **Responsabilidade de acesso:** a equipe garante que o repositório está público (ou com acesso liberado para os avaliadores) e que o link de deploy, se enviado, permanecerá ativo durante todo o período de avaliação.

<br/>

## 3. Visão geral da solução

**Trilha+** é uma plataforma de gamificação educacional construída em Next.js. Alunos avançam por trilhas de conhecimento, cumprem missões, acumulam XP, sobem de nível, desbloqueiam recompensas cosméticas e competem individualmente e em squads em um ranking por ligas. Professores têm um painel dedicado para criar atividades, aprovar ou negar resgates de recompensas, organizar squads, acompanhar o desempenho da turma e visualizar alertas sobre alunos que precisam de atenção.

A solução é um MVP **sem backend**: todo o estado é gerido em um Context de React e persistido no `localStorage` do navegador, com uma base de dados de demonstração (*seed*) já populada. Isso permite que a Banca Avaliadora teste o fluxo completo (aluno e professor) sem nenhuma configuração de infraestrutura adicional.

<br/>

## 4. Requisitos de ambiente

| Requisito | Versão / detalhe |
|---|---|
| Sistema operacional | Windows, macOS ou Linux (qualquer um com suporte a Node.js) |
| Node.js | 20 ou superior |
| Gerenciador de pacotes | `npm` (recomendado) ou `pnpm` — o repositório inclui `package-lock.json` |
| Git | Necessário apenas para clonar o repositório |
| Navegador | Qualquer navegador moderno (Chrome, Edge, Firefox, Safari) com `localStorage` habilitado |
| Banco de dados | Não se aplica — não há banco de dados externo |
| Variáveis de ambiente / chaves de API | Não há nenhuma obrigatória para rodar o projeto |
| Conexão com a internet | Necessária apenas para instalar as dependências (`npm install`) e para o carregamento das fontes do Google (`next/font/google`) |

<br/>

## 5. Instruções de instalação e execução

**Passo 1 — Clonar o repositório**

```bash
git clone https://github.com/camyf7/Hackathon.git
cd Hackathon
```

**Passo 2 — Instalar as dependências**

```bash
npm install
```

**Passo 3 — Rodar em modo de desenvolvimento**

```bash
npm run dev
```

**Passo 4 — Acessar a aplicação**

Abrir [http://localhost:3000](http://localhost:3000) no navegador.


Nenhum passo adicional de configuração, migração de banco ou variável de ambiente é necessário. Ao abrir a aplicação pela primeira vez, a base de dados de demonstração é criada automaticamente a partir de `lib/seed.ts` e salva no `localStorage` do navegador.

<br/>

## 6. Credenciais e dados de teste

A aplicação não exige cadastro prévio para nenhum dos dois perfis. Os dados abaixo já vêm populados pelo *seed* do projeto (`lib/seed.ts`) e podem ser usados imediatamente pela Banca Avaliadora.

### 6.1 Acesso como professor

| Campo | Valor |
|---|---|
| URL de login | `/professor/login` |
| E-mail | `professor@trilha.com` |
| Senha | `123456` |
| Nome do professor de demonstração | Prof. Marina Andrade |

A tela de login também permite criar uma nova conta de professor (aba "Cadastro"), caso a Banca prefira testar o fluxo de criação de conta do zero.

### 6.2 Acesso como aluno

O acesso do aluno não usa senha: na tela inicial (`/`), a Banca seleciona um aluno em uma lista já populada. Não é necessário digitar nenhuma credencial.

- **Escolas de demonstração:** EM Prof. Manoel de Barros e EM Tabatinga do Mar
- **Turmas por escola:** 3 turmas em cada escola (ex.: 6º A, 7º B, 9º A / 5º A, 8º A, 1º EM), todas vinculadas ao professor de demonstração
- **Alunos por turma:** 5 ou 6 alunos, com nomes variados (ex.: Ana Beatriz, Lucas Silva, Maria Clara, entre outros) e XP inicial variado, para já demonstrar diferentes níveis, ligas e badges

Para facilitar cenários específicos de avaliação, o *seed* já inclui, propositalmente:

- Um aluno por turma com baixo engajamento (XP e streak baixos, pouco tempo de tela) — aparece nos alertas do professor
- Um aluno por turma com tempo de tela excessivo — também sinalizado nos alertas do professor
- Alunos distribuídos em diferentes faixas de XP, permitindo observar todas as ligas (Ouro, Prata e Bronze) já no primeiro acesso
- Espaço de Demo para simular aumento de Xp

<br/>

## 7. Roteiro de testes sugerido

A tabela abaixo indica um caminho objetivo para validar as principais funcionalidades da solução.

| Nº | Perfil | Ação | Resultado esperado |
|---|---|---|---|
| 1 | Aluno | Selecionar um aluno na tela inicial | Redirecionamento para `/aluno`, com dados de XP, nível e streak já carregados |
| 2 | Aluno | Abrir a aba de trilhas e completar um exercício | Ganho de XP, atualização de progresso na trilha e, se aplicável, celebração com confete |
| 3 | Aluno | Fazer o check-in diário | Incremento do streak e concessão de badge, se atingido um marco (3 ou 7 dias) |
| 4 | Aluno | Abrir a aba de ranking | Exibição da posição do aluno e do squad nas ligas Ouro / Prata / Bronze |
| 5 | Aluno | Abrir a loja de recompensas e resgatar um item | Item entra na fila de aprovação do professor |
| 6 | Professor | Acessar `/professor/login` com as credenciais da seção 6.1 | Redirecionamento para o painel `/professor` |
| 7 | Professor | Abrir a aba de alertas | Listagem dos alunos com baixo engajamento ou tempo de tela excessivo, previamente configurados no *seed* |
| 8 | Professor | Criar uma nova atividade na aba de atividades | Atividade aparece disponível para os alunos da turma selecionada |
| 9 | Professor | Abrir a fila de aprovações e aprovar/negar o resgate feito no passo 5 | Status do resgate atualizado e refletido no perfil do aluno |
| 10 | Professor | Abrir a aba de squads | Visualização e organização dos squads da turma, com XP coletivo somado |

Como toda a persistência ocorre no `localStorage` do próprio navegador, os passos 1 a 10 podem ser executados na mesma máquina, na mesma sessão de navegador, sem necessidade de múltiplos dispositivos ou usuários simultâneos.

<br/>

## 8. Reinício dos dados de teste

Caso a Banca deseje reiniciar o ambiente para um estado limpo (por exemplo, para repetir o roteiro de testes), basta limpar os dados locais do site no navegador:

1. Abrir as ferramentas de desenvolvedor do navegador (F12 ou Ctrl+Shift+I / Cmd+Option+I)
2. Ir até a aba **Application** (Chrome/Edge) ou **Armazenamento** (Firefox)
3. Localizar `localStorage` para `http://localhost:3000`
4. Remover as chaves `trilha-plus-db-v5` e `trilha-plus-session-v4`
5. Recarregar a página

A aplicação recriará automaticamente a base de demonstração a partir de `lib/seed.ts`.

<br/>

## 9. Stack tecnológica

| Camada | Tecnologias |
|---|---|
| Framework e linguagem | Next.js 16.2.6, React 19, TypeScript 5.7 |
| Estilo e UI | Tailwind CSS 4, shadcn/ui, Radix UI, Base UI, lucide-react, next-themes |
| Interação e feedback | Framer Motion, Vaul, Sonner, cmdk |
| Persistência | `localStorage` (nativo do navegador) — não há banco de dados nem API externa |
| Observabilidade | @vercel/analytics, Claude code e Chatgpt |

Detalhamento completo de arquitetura, modelo de dados e estrutura de pastas está disponível no `README.md` do repositório.

<br/>

## 10. Documentação complementar

- `README.md` — visão completa do projeto, arquitetura, modelo de dados e stack detalhada
- `lib/seed.ts` — fonte de verdade dos dados de demonstração (credenciais, alunos, turmas, trilhas, recompensas)
- `netlify.toml` — configuração de build para deploy na Netlify

<br/>

## 11. Observações finais para a Banca Avaliadora

- Não há chaves de API, segredos ou variáveis de ambiente a serem configuradas.
- Não há necessidade de acesso a serviços externos além do npm registry, usado apenas na instalação das dependências.
- Todos os dados de teste (credenciais, alunos, turmas, XP, alertas) são gerados automaticamente e de forma determinística pelo *seed*, garantindo que qualquer avaliador tenha exatamente o mesmo cenário de teste.
- Caso qualquer passo deste roteiro não funcione como descrito, a equipe está disponível em camilly.ferreira@aluno.ifsp.edu.br para suporte durante o período de avaliação.
