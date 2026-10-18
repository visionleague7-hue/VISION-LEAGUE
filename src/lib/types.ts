export type GameType = 'Valorant' | 'League of Legends' | 'Deadlock';

export type TournamentTier = 'Amador' | 'Vision' | 'Profissional';

export type CompetitionMode = 'bracket' | 'duelo_direto'; // Chaves vs Equipe x Equipe (Duelo Direto)

export type TournamentStatus = 'open' | 'ongoing' | 'finished' | 'cancelled';

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin';

export type TransactionType =
  | 'deposit_pix'
  | 'tournament_entry'
  | 'prize_payout'
  | 'withdrawal_pix'
  | 'withdrawal_refund'
  | 'platform_rake';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type WithdrawalStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  cpf?: string; // CPF para comprovação de maioridade (+18) e chave PIX
  isAdult?: boolean;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  riotId?: string; // Riot ID (Nick#TAG) para Valorant e LoL
  steamId?: string; // Steam ID ou Friend Code (Deadlock)
  steamFriendCode?: string; // Friend Code da Steam para convite em lobby do Deadlock
  rankTier: string;
  currentTeam?: string;
  avatarUrl: string;
  role: 'player' | 'referee' | 'admin' | 'moderator';
  createdAt: string;
}

export interface VirtualWallet {
  id: string;
  userId: string;
  availableBalance: number; // Saldo disponível para inscrições e saques
  lockedBalance: number;    // Saldo bloqueado em solicitações de saque pendentes
  currency: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  pixE2eId?: string;
  description: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  pixKeyType: PixKeyType;
  pixKey: string;
  status: WithdrawalStatus;
  requiresManualApproval: boolean;
  antiFraudFlagged: boolean;
  rejectionReason?: string;
  gatewayTransferId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  title: string;
  slug: string;
  game: GameType;
  tier?: TournamentTier; // 'Amador' | 'Vision' | 'Profissional'
  competitionMode?: CompetitionMode; // 'bracket' (Chaves) ou 'duelo_direto' (Equipe x Equipe)
  rankLimit?: string;    // 'Até Platina', 'Diamante+', 'Open (Sem Limite)' (Para Deadlock é SEMPRE Open)
  isOpenRank?: boolean;   // True para Deadlock e torneios sem restrição de Elo
  bannerUrl: string;
  entryFee: number;
  prizePool: number;
  firstPlacePrize: number;
  secondPlacePrize?: number;
  thirdPlacePrize?: number;
  platformFeePercent: number;
  maxTeams: number;
  registeredTeamsCount: number;
  format: TournamentFormat;
  status: TournamentStatus;
  rules: string;
  startDate: string;
  startTime?: string; // Horário exato (ex: '19:00')
  winnerTeamId?: string;
  winnerTeamName?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  gameNick: string;
  role: 'capitao' | 'titular' | 'reserva';
  gameId?: string; // Riot ID ou Steam ID
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  game: GameType; // 'Valorant' | 'League of Legends' | 'Deadlock'
  logoUrl?: string;
  captainId: string;
  captainName: string;
  inviteCode: string;
  minMembers: number; // 5 para LoL/Valorant, 6 para Deadlock
  maxMembers: number; // 7 para LoL/Valorant (5+2 reservas), 8 para Deadlock (6+2 reservas)
  members: TeamMember[];
  createdAt: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  captainId: string;
  paymentMethod: 'wallet' | 'pix_direct' | 'free';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  registeredAt: string;
}

export interface BracketMatch {
  id: string;
  tournamentId: string;
  roundNumber: number; // 1 = Quartas, 2 = Semifinais, 3 = Final
  roundName: string;
  matchIndex: number;
  teamA?: {
    id: string;
    name: string;
    score: number;
    logo?: string;
  };
  teamB?: {
    id: string;
    name: string;
    score: number;
    logo?: string;
  };
  winnerId?: string;
  winnerName?: string;
  status: 'scheduled' | 'live' | 'completed';
  scheduledTime?: string;
  nextMatchId?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badgeText: string;
  ctaText: string;
  ctaLink: string;
  targetPage: 'home' | 'tournaments';
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDomain: string;
  ownerUsername: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  headerAnnouncement: string;
  footerBio: string;
  discordUrl: string;
  twitchUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  minDepositAmount: number;
  minWithdrawalAmount: number;
  antiFraudThreshold: number;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  authorName: string;
  publishedAt: string;
}

export interface PixChargeResponse {
  txid: string;
  copiaECola: string;
  qrCodeBase64?: string;
  amount: number;
  expiresInSeconds: number;
  expiresAt: string;
  status: 'pending' | 'paid' | 'expired';
}

/** Template para criação automática de torneios (Duelos Diretos de baixo valor) */
export interface TournamentTemplate {
  id: string;
  name: string;
  game: GameType;
  competitionMode: CompetitionMode;
  entryFee: number;          // Sempre pequeno: R$5–R$20
  prizePool: number;
  firstPlacePrize: number;
  maxTeams: number;
  format: TournamentFormat;
  rankLimit: string;
  isOpenRank: boolean;
  rules: string;
  bannerUrl: string;
  autoStartTime: string;      // Horário de início ex: "20:00"
  autoStartDaysOffset: number; // Dias após criação para começar
  isActive: boolean;          // Se este template gera torneios automaticamente
}
