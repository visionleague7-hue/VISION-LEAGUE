# 🏆 VISION eSports Platform & CMS

Plataforma Full-Stack de Campeonatos Competitivos de eSports (Valorant, League of Legends, CS2) com **Painel Administrativo (CMS)**, **Carteira Virtual (Ledger Duplo)** e **Pagamentos Automatizados via PIX (Pay-In & Pay-Out)**.

---

## 🚀 Sumário dos Recursos

### 1. Front-end Público do Jogador
- **Home Page**:
  - Hero Banner rotativo dinâmico (com slider, controles, pause-on-hover e chamadas editáveis pelo CMS).
  - Ticker de métricas da plataforma em tempo real.
  - Lista de campeonatos com badges coloridas (`Inscrições Abertas`, `Em Andamento`, `Finalizado`) e filtros por status e jogo.
  - Seção **Hall da Fama / Últimos Campeões** com troféus e premiações pagas.
  - Seção de Parceiros e Patrocinadores Oficiais (Razer, Red Bull, Alienware, SteelSeries, Twitch).
- **Página do Campeonato (`/tournaments/[id]`)**:
  - Informações completas (premiação dividida por 1º, 2º e 3º colocado, taxa, formato e regulamento).
  - **Tabela de Chaves (Brackets / Grids de Eliminação) dinâmica** (Quartas, Semis, Grande Final, placar ao vivo e status).
  - Lista de times inscritos com lineups e capitães.
  - Modal **"Inscrever Meu Time"**: suporte a pagamento via **Saldo da Carteira Virtual** ou **PIX Imediato** (com QR Code na tela).
- **Área do Jogador / Carteira Virtual (`/dashboard/wallet` & `/profile`)**:
  - Saldo Disponível e Saldo Bloqueado em Saque.
  - **Extrato do Ledger**: histórico auditável de depósitos, inscrições, premiações e saques.
  - Modal de **Depósito PIX**: geração de QR Code e Copia e Cola instantâneo.
  - Modal de **Solicitação de Saque PIX**: validação de chave (CPF, E-mail, Celular, EVP) e trava de segurança antifraude.
  - Perfil do jogador com Riot ID, Steam ID, Elo e time atual.
- **Central de Notícias (`/news`)**: blog de anúncios e regulamentos.

---

### 2. Painel Administrativo do Proprietário (Admin CMS - `/admin`)
- **Dashboard Geral**:
  - KPIs de GMV (volume total), comissões da plataforma (Rake 10%), saques pagos e torneios ativos.
  - Alerta de solicitações de saque com trava de segurança antifraude pendentes.
- **Gerenciador de Banners e Mídia (`/admin/banners`)**:
  - Upload de imagens diretamente pela interface (arrastar arquivos ou colar links de imagem) sem alterar código.
  - Edição de títulos, subtítulos, badges, botões e links de destino.
  - Ativar/desativar e ordenar banners.
- **Gerenciador de Campeonatos (`/admin/tournaments`)**:
  - Criar, editar e excluir torneios (jogo, taxa, prêmio, vagas, formato de eliminação simples/dupla).
  - Atualizar chaveamentos e placares.
  - **Declarar Vencedor & Premiação Automática**: credita o prêmio do 1º colocado diretamente na carteira do capitão e registra a transação no ledger com 1 clique!
- **Controle Financeiro & Saques (`/admin/finance`)**:
  - Visualização de todas as movimentações financeiras.
  - Relatório de saques (Pendentes, Liquidados, Rejeitados).
  - **Aprovar Saque via API PIX** e **Rejeitar com Estorno Automático** do saldo bloqueado para disponível.
- **Personalização do Site (`/admin/settings`)**:
  - Troca da paleta de cores Dark Mode (Ciano Neon / Roxo Neon ou presets customizados).
  - Edição do nome da plataforma, banner de aviso superior, bio do rodapé e links de redes sociais.
  - Configuração do teto da trava antifraude (ex: saques acima de R$ 500 exigem aprovação manual).

---

### 3. Módulo Financeiro & Arquitetura de Pagamentos PIX
- **Ledger Duplo / Auditável**:
  - Toda movimentação financeira gera um registro imutável com `balance_before` e `balance_after`.
  - Tratamento atômico de saldo com trava de concorrência (`SELECT ... FOR UPDATE` no PostgreSQL).
- **Gateway de Pagamento Brasileiro (Asaas & Efí Bank)**:
  - **Pay-In**: Geração de payload PIX EMV com tempo de expiração e QR Code renderizado no front-end.
  - **Webhook**: Verificação de assinatura/token de segurança, idempotência (evita créditos duplicados) e liberação em tempo real.
  - **Pay-Out**: Transferência automatizada para chave PIX via API do gateway com regras antifraude.

---

## 🛠️ Tecnologias Utilizadas
- **Front-end**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Design & Ícones**: Lucide React, Badges e Paleta Gamer Neon Cyber
- **QR Code**: `qrcode.react` (renderização SVG nativa sem dependências externas lentas)
- **Banco de Dados**: PostgreSQL / Supabase com schema SQL completo (`supabase/schema.sql`)
- **Gateway de Pagamento**: Integração pronta para Asaas e Efí Bank (Gerencianet)

---

## 📋 Como Executar o Projeto Passo a Passo

### Pré-requisitos
- Node.js versão 18 ou superior instalado.
- NPM ou Yarn.

### 1. Clonar ou Acessar a Pasta do Projeto
```bash
cd c:\projetos\visionleague
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local`:
```bash
copy .env.example .env.local
```
*(As variáveis padrão já vêm preparadas para testes locais imediatos com simulações de PIX).*

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Abra o navegador em [http://localhost:3000](http://localhost:3000).

---

## 📂 Estrutura de Pastas do Projeto

```
vision-esports-platform/
├── supabase/
│   └── schema.sql                    # Schema PostgreSQL completo: Ledger, RLS, Triggers e Stored Procedures
├── src/
│   ├── app/
│   │   ├── globals.css               # Estilos Dark Mode gamer, neon cyan e purple
│   │   ├── layout.tsx                # Layout principal com Providers e Navbars
│   │   ├── page.tsx                  # Home Page (Hero Banner, Campeonatos, Campeões, Patrocinadores)
│   │   ├── tournaments/
│   │   │   ├── page.tsx              # Lista pública de campeonatos com filtros
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Detalhes do campeonato, chaves dinâmicas e inscrição
│   │   ├── dashboard/
│   │   │   ├── wallet/page.tsx       # Carteira Virtual, Saldo, Extrato Ledger e Modais PIX
│   │   │   └── profile/page.tsx      # Perfil de Jogador com Riot ID, Elo e Clã
│   │   ├── news/
│   │   │   └── page.tsx              # Central de Notícias e Regulamentos
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Layout com Sidebar do Dono CMS
│   │   │   ├── page.tsx              # Dashboard Geral de Métricas e GMV
│   │   │   ├── banners/page.tsx      # Gerenciador de Banners e Upload de Mídia
│   │   │   ├── tournaments/page.tsx  # Gerenciador de Torneios e Premiação Automática
│   │   │   ├── finance/page.tsx      # Controle Financeiro e Aprovação de Saques Antifraude
│   │   │   └── settings/page.tsx     # CMS de Personalização Visual (Cores Neon, Textos, Redes)
│   │   └── api/
│   │       ├── pix/
│   │       │   ├── deposit/route.ts  # Endpoint Pay-in PIX (Gera QR Code & Copia e Cola)
│   │       │   ├── withdraw/route.ts # Endpoint Pay-out com validação antifraude
│   │       │   └── webhook/route.ts  # Webhook com validação de token e idempotência
│   │       └── upload/route.ts       # Endpoint para upload de imagens de banners e logos
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Header com saldo da carteira em tempo real
│   │   │   ├── Footer.tsx            # Rodapé institucional e links sociais
│   │   │   └── AnnouncementBar.tsx   # Barra de anúncios do topo
│   │   ├── home/
│   │   │   ├── HeroBannerSlider.tsx  # Carrossel rotativo interativo com autoplay
│   │   │   ├── TournamentListSection.tsx # Lista com badges de status e progresso de vagas
│   │   │   ├── ChampionsHallSection.tsx  # Hall da Fama dos últimos vencedores
│   │   │   └── SponsorsSection.tsx   # Seção de patrocinadores gamers
│   │   ├── tournament/
│   │   │   ├── BracketViewer.tsx     # Chaves de eliminação dinâmicas
│   │   │   └── RegisterModal.tsx     # Inscrição via Carteira Virtual ou PIX imediato
│   │   ├── wallet/
│   │   │   ├── DepositModal.tsx      # Modal de Depósito com QR Code SVG
│   │   │   └── WithdrawModal.tsx     # Modal de Saque com seleção de chaves e trava de segurança
│   │   └── admin/
│   │       ├── AdminSidebar.tsx      # Navegação do CMS com contador de pendências
│   │       └── ImageUploader.tsx     # Upload de imagem com drag & drop e preview em tempo real
│   └── lib/
│       ├── types.ts                  # Definições TypeScript
│       ├── store.ts                  # Mock seed inicial para execução imediata
│       ├── state-context.tsx         # Contexto reativo com persistência LocalStorage
│       ├── pix-gateway.ts            # Serviço de integração com Asaas e Efí Bank
│       ├── supabase.ts               # Cliente Supabase
│       └── utils.ts                  # Utilitários de moeda BRL, datas e validação de chaves PIX
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```
