'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Banner,
  BracketMatch,
  SiteSettings,
  Team,
  TeamMember,
  Tournament,
  TournamentTemplate,
  Transaction,
  UserProfile,
  VirtualWallet,
  WithdrawalRequest,
  PixKeyType,
} from './types';
import {
  initialBanners,
  initialBrackets,
  initialSiteSettings,
  initialTeams,
  initialTemplates,
  initialTournaments,
  initialTransactions,
  initialUser,
  initialWallet,
  initialWithdrawalRequests,
} from './store';
import { auth, googleProvider, isFirebaseConfigured, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, type User as FirebaseUser } from './firebase';

interface StateContextType {
  banners: Banner[];
  tournaments: Tournament[];
  brackets: Record<string, BracketMatch[]>;
  teams: Team[];
  templates: TournamentTemplate[];
  user: UserProfile;
  isLoggedIn: boolean;
  isLoaded: boolean;
  wallet: VirtualWallet;
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  siteSettings: SiteSettings;
  // Auth
  loginWithGoogle: (customAccount?: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  // Teams Management
  createTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'inviteCode' | 'members'>) => Team;
  addTeamMember: (teamId: string, member: Omit<TeamMember, 'id' | 'joinedAt'>) => { success: boolean; message: string };
  removeTeamMember: (teamId: string, memberId: string) => void;
  deleteTeam: (teamId: string) => void;
  joinTeamByInviteCode: (inviteCode: string, gameNick: string, gameId?: string) => { success: boolean; message: string };
  // Banners CMS
  addBanner: (banner: Omit<Banner, 'id' | 'createdAt'>) => void;
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  // Tournaments CMS
  addTournament: (tourn: Omit<Tournament, 'id' | 'createdAt' | 'registeredTeamsCount'>) => void;
  updateTournament: (id: string, tourn: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  cancelTournament: (tournamentId: string, reason?: string) => { success: boolean; message: string; refundedAmount: number };
  declareTournamentWinner: (tournamentId: string, winnerTeamId: string, winnerTeamName: string) => Promise<{ success: boolean; message: string }>;
  updateMatchScore: (tournamentId: string, matchId: string, scoreA: number, scoreB: number, winnerId?: string, winnerName?: string) => void;
  /** Árbitro/Admin declara o vencedor de uma partida (sem placar numérico) */
  setMatchWinner: (tournamentId: string, matchId: string, winnerId: string, winnerName: string) => void;
  registerTeamInTournament: (tournamentId: string, teamName: string, paymentMethod: 'wallet' | 'pix_direct') => { success: boolean; message: string };
  // Finance & Wallet Ledger
  depositPix: (amount: number, txid: string) => void;
  requestWithdrawal: (amount: number, pixKeyType: PixKeyType, pixKey: string) => { success: boolean; message: string; requiresApproval: boolean };
  approveWithdrawal: (requestId: string) => void;
  rejectWithdrawal: (requestId: string, reason: string) => void;
  // CMS Settings
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  // User Profile
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  // Tournament Templates (Auto-criação)
  updateTemplate: (id: string, fields: Partial<TournamentTemplate>) => void;
  // RBAC — Gerenciamento de usuários (apenas admin)
  allUsers: UserProfile[];
  promoteToReferee: (userId: string) => { success: boolean; message: string };
  demoteToPlayer: (userId: string) => { success: boolean; message: string };
}


const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [brackets, setBrackets] = useState<Record<string, BracketMatch[]>>(initialBrackets);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [templates, setTemplates] = useState<TournamentTemplate[]>(initialTemplates);
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([initialUser]);
  const allUsersRef = useRef<UserProfile[]>([initialUser]);
  // Mantém ref sincronizado para uso dentro de closures sem causar re-renders
  useEffect(() => { allUsersRef.current = allUsers; }, [allUsers]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wallet, setWallet] = useState<VirtualWallet>(initialWallet);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(initialWithdrawalRequests);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSiteSettings);
  const [isLoaded, setIsLoaded] = useState(false);


  // Load from localStorage on mount for persistence
  useEffect(() => {
    try {
      const storedBanners = localStorage.getItem('vision_banners');
      if (storedBanners) setBanners(JSON.parse(storedBanners));

      const storedTournaments = localStorage.getItem('vision_tournaments');
      if (storedTournaments) setTournaments(JSON.parse(storedTournaments));

      const storedTeams = localStorage.getItem('vision_teams');
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      } else {
        setTeams(initialTeams);
      }

      const storedTemplates = localStorage.getItem('vision_templates');
      if (storedTemplates) {
        const parsed: TournamentTemplate[] = JSON.parse(storedTemplates);
        // Merge with initialTemplates to preserve any new templates added in updates
        const merged = initialTemplates.map((t) => {
          const saved = parsed.find((p) => p.id === t.id);
          return saved ? { ...t, ...saved } : t;
        });
        setTemplates(merged);
      }

      const storedWallet = localStorage.getItem('vision_wallet');
      if (storedWallet) {
        const parsed = JSON.parse(storedWallet);
        // Garantir que saldo mock antigo de 450 seja zerado conforme exigido pelo usuário
        if (parsed.availableBalance === 450 || typeof parsed.availableBalance !== 'number') {
          setWallet(initialWallet);
          localStorage.setItem('vision_wallet', JSON.stringify(initialWallet));
        } else {
          setWallet(parsed);
        }
      } else {
        setWallet(initialWallet);
      }

      const storedTransactions = localStorage.getItem('vision_transactions');
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));

      const storedWithdrawals = localStorage.getItem('vision_withdrawals');
      if (storedWithdrawals) setWithdrawalRequests(JSON.parse(storedWithdrawals));

      const storedSettings = localStorage.getItem('vision_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSiteSettings({
          ...initialSiteSettings,
          ...parsed,
          // Força sempre a nova logo e cores da marca
          logoUrl: initialSiteSettings.logoUrl,
          primaryColor: initialSiteSettings.primaryColor,
          secondaryColor: initialSiteSettings.secondaryColor,
          siteName: parsed.siteName === 'VISION eSports' ? 'Vision League' : parsed.siteName || 'Vision League',
          siteDomain: parsed.siteDomain || 'visionleague.gg',
          ownerUsername: parsed.ownerUsername || 'vision.group.adm',
        });
      } else {
        setSiteSettings(initialSiteSettings);
      }

      const storedUser = localStorage.getItem('vision_user');
      const storedLogin = localStorage.getItem('vision_isLoggedIn');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.username === 'ColdzeraBR') {
          setUser(initialUser);
        } else {
          setUser(parsed);
        }
        // Só marca como logado se havia sessão salva
        if (storedLogin === 'true') {
          setIsLoggedIn(true);
        }
      } else {
        setUser(initialUser);
        // Primeira vez: começa deslogado
      }

      // Carrega lista de todos os usuários (para gerenciamento de árbitros pelo Admin)
      const storedAllUsers = localStorage.getItem('vision_all_users');
      if (storedAllUsers) {
        setAllUsers(JSON.parse(storedAllUsers));
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);
  // Captura o resultado do signInWithRedirect (Edge/Safari que bloqueiam popup)
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    getRedirectResult(auth)
      .then((result) => {
        if (!result?.user) return;
        const firebaseUser = result.user;
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Jogador';
        const isOwner =
          firebaseUser.email === 'visionleague7@gmail.com' ||
          firebaseUser.email === (siteSettings.ownerUsername + '@visionleague.gg') ||
          firebaseUser.email === 'adm@visionleague.gg';
        const existingUser = allUsers.find((u) => u.id === firebaseUser.uid);
        const authenticatedUser: UserProfile = {
          id: firebaseUser.uid,
          username: displayName.replace(/\s+/g, '.').toLowerCase(),
          fullName: displayName,
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || '',
          cpf: existingUser?.cpf,
          isAdult: existingUser?.isAdult ?? true,
          termsAccepted: existingUser?.termsAccepted ?? true,
          termsAcceptedAt: existingUser?.termsAcceptedAt ?? new Date().toISOString(),
          rankTier: existingUser?.rankTier || 'Não definido',
          role: isOwner ? 'admin' : (existingUser?.role ?? 'player'),
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        };
        setUser(authenticatedUser);
        setIsLoggedIn(true);
        setAllUsers((prev) => {
          const idx = prev.findIndex((u) => u.id === firebaseUser.uid);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...authenticatedUser };
            return updated;
          }
          return [authenticatedUser, ...prev];
        });
      })
      .catch(() => {
        // Silencia erros — nenhum redirect pendente é normal
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listener de sessão do Firebase Auth
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Jogador';
        const isOwner = firebaseUser.email === 'visionleague7@gmail.com' ||
                        firebaseUser.email === (siteSettings.ownerUsername + '@visionleague.gg') ||
                        firebaseUser.email === 'adm@visionleague.gg';

        // Usa ref para não recriar o listener a cada mudança em allUsers
        const existingUser = allUsersRef.current.find((u) => u.id === firebaseUser.uid);
        const existingRole = existingUser?.role;

        const authenticatedUser: UserProfile = {
          id: firebaseUser.uid,
          username: displayName.replace(/\s+/g, '.').toLowerCase(),
          fullName: displayName,
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || '',
          rankTier: existingUser?.rankTier || 'Não definido',
          role: isOwner ? 'admin' : (existingRole ?? 'player'),
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        };
        setUser(authenticatedUser);
        setIsLoggedIn(true);
        // Atualiza o registro na lista de usuários
        setAllUsers((prev) => {
          const idx = prev.findIndex((u) => u.id === firebaseUser.uid);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...authenticatedUser };
            return updated;
          }
          return [authenticatedUser, ...prev];
        });
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  // allUsers removido das deps — usa allUsersRef para evitar loop infinito
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSettings.ownerUsername]);


  // Save to localStorage when state updates — debounced to avoid blocking the main thread
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('vision_banners', JSON.stringify(banners));
        localStorage.setItem('vision_tournaments', JSON.stringify(tournaments));
        localStorage.setItem('vision_teams', JSON.stringify(teams));
        localStorage.setItem('vision_templates', JSON.stringify(templates));
        localStorage.setItem('vision_wallet', JSON.stringify(wallet));
        localStorage.setItem('vision_transactions', JSON.stringify(transactions));
        localStorage.setItem('vision_withdrawals', JSON.stringify(withdrawalRequests));
        localStorage.setItem('vision_settings', JSON.stringify(siteSettings));
        localStorage.setItem('vision_user', JSON.stringify(user));
        localStorage.setItem('vision_all_users', JSON.stringify(allUsers));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage', e);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [banners, tournaments, teams, templates, wallet, transactions, withdrawalRequests, siteSettings, user, allUsers, isLoaded]);


  // Banners CMS
  const addBanner = (banner: Omit<Banner, 'id' | 'createdAt'>) => {
    const newBanner: Banner = {
      ...banner,
      id: `banner-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBanners((prev) => [newBanner, ...prev]);
  };

  const updateBanner = (id: string, updatedFields: Partial<Banner>) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // Tournaments CMS
  const addTournament = (tourn: Omit<Tournament, 'id' | 'createdAt' | 'registeredTeamsCount'>) => {
    const newTourn: Tournament = {
      ...tourn,
      id: `tourn-${Date.now()}`,
      registeredTeamsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setTournaments((prev) => [newTourn, ...prev]);
  };

  const updateTournament = (id: string, updatedFields: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  };

  const deleteTournament = (id: string) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  // Cancelar Torneio com Reembolso Automático para Carteira Virtual
  const cancelTournament = (
    tournamentId: string,
    reason?: string
  ): { success: boolean; message: string; refundedAmount: number } => {
    const tourn = tournaments.find((t) => t.id === tournamentId);
    if (!tourn) return { success: false, message: 'Torneio não encontrado.', refundedAmount: 0 };

    if (tourn.status === 'cancelled') {
      return { success: false, message: 'Este torneio já se encontra cancelado.', refundedAmount: 0 };
    }

    // 1. Atualiza status do torneio para cancelado
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, status: 'cancelled' } : t))
    );

    // 2. Se o torneio tinha taxa de inscrição paga e times inscritos, devolve o dinheiro
    let refundedAmount = 0;
    if (tourn.entryFee > 0 && tourn.registeredTeamsCount > 0) {
      refundedAmount = tourn.entryFee;
      const newBal = wallet.availableBalance + refundedAmount;
      setWallet((prev) => ({
        ...prev,
        availableBalance: newBal,
        updatedAt: new Date().toISOString(),
      }));

      // Registra transação de estorno contábil no Ledger
      const refundTx: Transaction = {
        id: `tx-refund-${Date.now()}`,
        walletId: wallet.id,
        userId: user.id,
        type: 'withdrawal_refund',
        amount: refundedAmount,
        status: 'completed',
        balanceBefore: wallet.availableBalance,
        balanceAfter: newBal,
        referenceId: tournamentId,
        description: `Reembolso de inscrição: Campeonato cancelado (${tourn.title})${reason ? ` - ${reason}` : ''}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [refundTx, ...prev]);
    }

    return {
      success: true,
      message: `Torneio "${tourn.title}" cancelado. ${
        refundedAmount > 0
          ? `O valor da inscrição de R$ ${refundedAmount.toFixed(2)} foi estornado integralmente para a Carteira Virtual para você se inscrever em outro campeonato!`
          : 'Torneio cancelado com sucesso.'
      }`,
      refundedAmount,
    };
  };

  // Premiação Automática e Declaração de Campeão
  const declareTournamentWinner = async (
    tournamentId: string,
    winnerTeamId: string,
    winnerTeamName: string
  ): Promise<{ success: boolean; message: string }> => {
    const tourn = tournaments.find((t) => t.id === tournamentId);
    if (!tourn) return { success: false, message: 'Torneio não encontrado.' };

    if (tourn.status === 'finished') {
      return { success: false, message: 'Este torneio já foi finalizado anteriormente.' };
    }

    const prize = tourn.firstPlacePrize || tourn.prizePool;

    // 1. Atualizar torneio
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              status: 'finished',
              winnerTeamId,
              winnerTeamName,
            }
          : t
      )
    );

    // 2. Creditar premiação na carteira virtual (Ledger)
    const newBalance = wallet.availableBalance + prize;
    setWallet((prev) => ({
      ...prev,
      availableBalance: newBalance,
      updatedAt: new Date().toISOString(),
    }));

    // 3. Registrar transação no histórico do Ledger
    const prizeTx: Transaction = {
      id: `tx-prize-${Date.now()}`,
      walletId: wallet.id,
      userId: user.id,
      type: 'prize_payout',
      amount: prize,
      status: 'completed',
      balanceBefore: wallet.availableBalance,
      balanceAfter: newBalance,
      referenceId: tournamentId,
      description: `Premiação 1º Lugar: ${tourn.title} (Time: ${winnerTeamName})`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [prizeTx, ...prev]);

    // 4. Auto-criação: se o torneio finalizado tem modo duelo_direto, cria novo a partir do template
    const template = templates.find(
      (t) => t.isActive && t.game === tourn.game && t.competitionMode === tourn.competitionMode
    );
    if (template && tourn.competitionMode === 'duelo_direto') {
      const offsetDays = template.autoStartDaysOffset ?? 2;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + offsetDays);
      const startDateStr = startDate.toISOString().split('T')[0];
      const slug = `${template.game.toLowerCase().replace(/\s+/g, '-')}-duelo-auto-${Date.now()}`;
      const newTourn: Tournament = {
        id: `tourn-auto-${Date.now()}`,
        title: `${template.name} #${Math.floor(Math.random() * 900) + 100}`,
        slug,
        game: template.game,
        tier: 'Vision',
        competitionMode: template.competitionMode,
        rankLimit: template.rankLimit,
        isOpenRank: template.isOpenRank,
        bannerUrl: template.bannerUrl,
        entryFee: template.entryFee,
        prizePool: template.prizePool,
        firstPlacePrize: template.firstPlacePrize,
        platformFeePercent: 10,
        maxTeams: template.maxTeams,
        registeredTeamsCount: 0,
        format: template.format,
        status: 'open',
        rules: template.rules,
        startDate: startDateStr,
        startTime: template.autoStartTime,
        createdAt: new Date().toISOString(),
      };
      setTournaments((prev) => [newTourn, ...prev]);
    }

    return {
      success: true,
      message: `Torneio finalizado com sucesso! Premiação de R$ ${prize.toFixed(2)} creditada automaticamente na carteira do capitão (${winnerTeamName}).`,
    };
  };

  const updateMatchScore = (
    tournamentId: string,
    matchId: string,
    scoreA: number,
    scoreB: number,
    winnerId?: string,
    winnerName?: string
  ) => {
    setBrackets((prev) => {
      const tournMatches = prev[tournamentId] || [];
      const updated = tournMatches.map((m) =>
        m.id === matchId
          ? {
              ...m,
              teamA: m.teamA ? { ...m.teamA, score: scoreA } : undefined,
              teamB: m.teamB ? { ...m.teamB, score: scoreB } : undefined,
              winnerId: winnerId || m.winnerId,
              winnerName: winnerName || m.winnerName,
              status: winnerId ? ('completed' as const) : m.status,
            }
          : m
      );
      return { ...prev, [tournamentId]: updated };
    });
  };

  // Inscrição de time
  const registerTeamInTournament = (
    tournamentId: string,
    teamName: string,
    paymentMethod: 'wallet' | 'pix_direct'
  ): { success: boolean; message: string } => {
    const tourn = tournaments.find((t) => t.id === tournamentId);
    if (!tourn) return { success: false, message: 'Torneio não encontrado.' };

    if (tourn.status !== 'open') {
      return { success: false, message: 'As inscrições para este torneio não estão abertas.' };
    }

    if (tourn.registeredTeamsCount >= tourn.maxTeams) {
      return { success: false, message: 'As vagas para este torneio estão esgotadas.' };
    }

    if (tourn.entryFee > 0 && paymentMethod === 'wallet') {
      if (wallet.availableBalance < tourn.entryFee) {
        return {
          success: false,
          message: `Saldo insuficiente na carteira (Disponível: R$ ${wallet.availableBalance.toFixed(2)}, Taxa: R$ ${tourn.entryFee.toFixed(2)}). Efetue um depósito via PIX.`,
        };
      }

      // Debita saldo da carteira
      const newBal = wallet.availableBalance - tourn.entryFee;
      setWallet((prev) => ({
        ...prev,
        availableBalance: newBal,
        updatedAt: new Date().toISOString(),
      }));

      // Registra Ledger
      const entryTx: Transaction = {
        id: `tx-entry-${Date.now()}`,
        walletId: wallet.id,
        userId: user.id,
        type: 'tournament_entry',
        amount: -tourn.entryFee,
        status: 'completed',
        balanceBefore: wallet.availableBalance,
        balanceAfter: newBal,
        referenceId: tournamentId,
        description: `Inscrição no torneio: ${tourn.title} (Time: ${teamName})`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [entryTx, ...prev]);
    }

    // Incrementa contador de times no torneio
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? { ...t, registeredTeamsCount: t.registeredTeamsCount + 1 }
          : t
      )
    );

    return { success: true, message: `Time "${teamName}" inscrito com sucesso no torneio!` };
  };

  // Pay-In: Depósito PIX
  const depositPix = (amount: number, txid: string) => {
    const newBal = wallet.availableBalance + amount;
    setWallet((prev) => ({
      ...prev,
      availableBalance: newBal,
      updatedAt: new Date().toISOString(),
    }));

    const depTx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      walletId: wallet.id,
      userId: user.id,
      type: 'deposit_pix',
      amount: amount,
      status: 'completed',
      balanceBefore: wallet.availableBalance,
      balanceAfter: newBal,
      referenceId: txid,
      pixE2eId: `E90400888${Date.now()}P001`,
      description: 'Depósito instantâneo via PIX',
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [depTx, ...prev]);
  };

  // Pay-Out: Solicitação de Saque
  const requestWithdrawal = (
    amount: number,
    pixKeyType: PixKeyType,
    pixKey: string
  ): { success: boolean; message: string; requiresApproval: boolean } => {
    if (amount < siteSettings.minWithdrawalAmount) {
      return {
        success: false,
        message: `O valor mínimo para saque é de R$ ${siteSettings.minWithdrawalAmount.toFixed(2)}`,
        requiresApproval: false,
      };
    }

    if (wallet.availableBalance < amount) {
      return {
        success: false,
        message: `Saldo insuficiente para saque. Disponível: R$ ${wallet.availableBalance.toFixed(2)}`,
        requiresApproval: false,
      };
    }

    const requiresApproval = amount >= siteSettings.antiFraudThreshold;

    // Move de saldo disponível para saldo bloqueado
    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      lockedBalance: prev.lockedBalance + amount,
      updatedAt: new Date().toISOString(),
    }));

    const newRequest: WithdrawalRequest = {
      id: `wd-req-${Date.now()}`,
      userId: user.id,
      userName: user.username,
      amount,
      pixKeyType,
      pixKey,
      status: requiresApproval ? 'pending' : 'approved',
      requiresManualApproval: requiresApproval,
      antiFraudFlagged: requiresApproval,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWithdrawalRequests((prev) => [newRequest, ...prev]);

    // Se não precisa de aprovação manual, processa automaticamente
    if (!requiresApproval) {
      setTimeout(() => {
        approveWithdrawal(newRequest.id);
      }, 1000);
    }

    return {
      success: true,
      requiresApproval,
      message: requiresApproval
        ? `Saque de R$ ${amount.toFixed(2)} retido para análise de segurança (Acima do limite automático de R$ ${siteSettings.antiFraudThreshold.toFixed(2)}).`
        : `Saque de R$ ${amount.toFixed(2)} aprovado automaticamente e enviado para processamento PIX.`,
    };
  };

  // Aprovar saque no Admin
  const approveWithdrawal = (requestId: string) => {
    const req = withdrawalRequests.find((r) => r.id === requestId);
    if (!req || req.status === 'completed') return;

    // Remove do saldo bloqueado
    setWallet((prev) => ({
      ...prev,
      lockedBalance: Math.max(0, prev.lockedBalance - req.amount),
      updatedAt: new Date().toISOString(),
    }));

    // Atualiza status do saque
    setWithdrawalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'completed',
              gatewayTransferId: `TRF-${Date.now()}-ASAAS`,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Registra débito definitivo no Ledger
    const wdTx: Transaction = {
      id: `tx-wd-${Date.now()}`,
      walletId: wallet.id,
      userId: req.userId,
      type: 'withdrawal_pix',
      amount: -req.amount,
      status: 'completed',
      balanceBefore: wallet.availableBalance + req.amount,
      balanceAfter: wallet.availableBalance,
      referenceId: req.id,
      pixE2eId: `E90400888${Date.now()}W001`,
      description: `Saque PIX Chave ${req.pixKeyType.toUpperCase()} (${req.pixKey})`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [wdTx, ...prev]);
  };

  // Rejeitar saque no Admin (Estorna para saldo disponível)
  const rejectWithdrawal = (requestId: string, reason: string) => {
    const req = withdrawalRequests.find((r) => r.id === requestId);
    if (!req || req.status === 'completed' || req.status === 'rejected') return;

    // Estorna saldo bloqueado de volta para saldo disponível
    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + req.amount,
      lockedBalance: Math.max(0, prev.lockedBalance - req.amount),
      updatedAt: new Date().toISOString(),
    }));

    setWithdrawalRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              rejectionReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Transação de estorno no Ledger
    const refundTx: Transaction = {
      id: `tx-refund-${Date.now()}`,
      walletId: wallet.id,
      userId: req.userId,
      type: 'withdrawal_refund',
      amount: req.amount,
      status: 'completed',
      balanceBefore: wallet.availableBalance,
      balanceAfter: wallet.availableBalance + req.amount,
      referenceId: req.id,
      description: `Estorno de saque rejeitado: ${reason}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [refundTx, ...prev]);
  };

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings, updatedAt: new Date().toISOString() }));
  };

  const updateTemplate = (id: string, fields: Partial<TournamentTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...fields } : t))
    );
  };

  const loginWithGoogle = async (customAccount?: Partial<UserProfile>): Promise<{ success: boolean; message: string }> => {
    if (isFirebaseConfigured()) {
      // Helper para processar o usuário Firebase autenticado
      const processFirebaseUser = (firebaseUser: FirebaseUser, cpf?: string) => {
        const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Jogador';
        const isOwner =
          firebaseUser.email === 'visionleague7@gmail.com' ||
          firebaseUser.email === (siteSettings.ownerUsername + '@visionleague.gg') ||
          firebaseUser.email === 'adm@visionleague.gg';

        const existingUser = allUsers.find((u) => u.id === firebaseUser.uid);
        const savedRole = existingUser?.role;

        const authenticatedUser: UserProfile = {
          id: firebaseUser.uid,
          username: displayName.replace(/\s+/g, '.').toLowerCase(),
          fullName: displayName,
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || '',
          cpf: cpf ?? existingUser?.cpf,
          isAdult: existingUser?.isAdult ?? true,
          termsAccepted: existingUser?.termsAccepted ?? true,
          termsAcceptedAt: existingUser?.termsAcceptedAt ?? new Date().toISOString(),
          rankTier: existingUser?.rankTier || 'Não definido',
          role: isOwner ? 'admin' : (savedRole ?? 'player'),
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        };

        setUser(authenticatedUser);
        setIsLoggedIn(true);
        setAllUsers((prev) => {
          const idx = prev.findIndex((u) => u.id === firebaseUser.uid);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...authenticatedUser };
            return updated;
          }
          return [authenticatedUser, ...prev];
        });

        return authenticatedUser;
      };

      try {
        // Tenta popup primeiro
        const result = await signInWithPopup(auth, googleProvider);
        processFirebaseUser(result.user, customAccount?.cpf);
        const name = result.user.displayName || result.user.email || 'Jogador';
        return { success: true, message: `Conectado com sucesso como ${name}!` };
      } catch (err: any) {
        const errorCode = err?.code || '';

        // Se popup foi bloqueado (Edge, Safari, etc.) → usa redirect automático
        if (errorCode === 'auth/popup-blocked' || errorCode === 'auth/popup-closed-by-user') {
          try {
            await signInWithRedirect(auth, googleProvider);
            // signInWithRedirect redireciona a página — o retorno é tratado no useEffect abaixo
            return { success: true, message: 'Redirecionando para o Google...' };
          } catch (redirectErr: any) {
            return { success: false, message: 'Falha ao redirecionar para o Google. Tente novamente.' };
          }
        }

        console.error('Erro no login com Google (Firebase):', err);
        let message = 'Falha ao autenticar com o Google. Tente novamente.';
        if (err?.message) message = err.message;
        return { success: false, message };
      }
    }

    const existingUser = allUsers.find((u) => u.email === (customAccount?.email || 'adm@visionleague.gg'));
    const authenticatedUser: UserProfile = {
      id: customAccount?.id || (customAccount?.username === 'vision.group.adm' ? 'user-vision-adm' : `user-google-${Date.now()}`),
      username: customAccount?.username || 'vision.group.adm',
      fullName: customAccount?.fullName || 'Vision Group • Admin Geral',
      email: customAccount?.email || 'adm@visionleague.gg',
      avatarUrl: customAccount?.avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
      rankTier: customAccount?.rankTier || existingUser?.rankTier || 'Fundador / Vision Group',
      role: (customAccount?.role as any) || existingUser?.role || 'admin',
      createdAt: new Date().toISOString(),
    };

    setUser(authenticatedUser);
    setIsLoggedIn(true);
    localStorage.setItem('vision_isLoggedIn', 'true');

    setAllUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === authenticatedUser.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...authenticatedUser };
        return updated;
      }
      return [authenticatedUser, ...prev];
    });

    return { success: true, message: `Conectado com sucesso via Google como ${authenticatedUser.username}!` };
  };


  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('vision_isLoggedIn');
    if (isFirebaseConfigured()) {
      signOut(auth).catch(() => {});
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  // ===== RBAC: Gerenciamento de roles de usuários =====

  /**
   * Árbitro declara o vencedor de uma partida sem placar numérico.
   * Guarda role 'referee' como verificação semântica no front-end; a proteção real fica
   * no RoleGuard que protege a rota /arbitros.
   */
  const setMatchWinner = (
    tournamentId: string,
    matchId: string,
    winnerId: string,
    winnerName: string
  ) => {
    setBrackets((prev) => {
      const tournMatches = prev[tournamentId] || [];
      const updated = tournMatches.map((m) =>
        m.id === matchId
          ? {
              ...m,
              winnerId,
              winnerName,
              status: 'completed' as const,
            }
          : m
      );
      return { ...prev, [tournamentId]: updated };
    });
  };

  /**
   * Admin promove um usuário para árbitro.
   * Apenas chamável por usuários com role 'admin' (verificação no componente de UI + RoleGuard).
   */
  const promoteToReferee = (userId: string): { success: boolean; message: string } => {
    if (user.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem promover usuários.' };
    }
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Usuário não encontrado.' };
    if (target.role === 'admin') {
      return { success: false, message: 'Não é possível alterar o papel de um administrador.' };
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: 'referee' } : u))
    );

    // Atualiza o usuário atual se ele próprio foi promovido (improvável mas possível)
    if (user.id === userId) {
      setUser((prev) => ({ ...prev, role: 'referee' }));
    }

    return { success: true, message: `${target.fullName || target.username} foi promovido(a) a Árbitro com sucesso!` };
  };

  /**
   * Admin rebaixa um árbitro de volta para jogador.
   */
  const demoteToPlayer = (userId: string): { success: boolean; message: string } => {
    if (user.role !== 'admin') {
      return { success: false, message: 'Apenas administradores podem alterar papéis.' };
    }
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Usuário não encontrado.' };
    if (target.role === 'admin') {
      return { success: false, message: 'Não é possível rebaixar um administrador.' };
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: 'player' } : u))
    );

    if (user.id === userId) {
      setUser((prev) => ({ ...prev, role: 'player' }));
    }

    return { success: true, message: `${target.fullName || target.username} voltou ao papel de Jogador.` };
  };



  // Team Management
  const createTeam = (teamData: Omit<Team, 'id' | 'createdAt' | 'inviteCode' | 'members'>): Team => {
    const isDeadlock = teamData.game === 'Deadlock';
    const minMembers = isDeadlock ? 6 : 5;
    const maxMembers = isDeadlock ? 8 : 7;
    const inviteCode = `${teamData.tag || 'TEAM'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      inviteCode,
      minMembers,
      maxMembers,
      members: [
        {
          id: `member-${Date.now()}`,
          name: user.username,
          gameNick: isDeadlock ? (user.steamId || user.username) : (user.riotId || user.username),
          role: 'capitao',
          gameId: isDeadlock ? user.steamId : user.riotId,
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setTeams((prev) => [newTeam, ...prev]);
    return newTeam;
  };

  const addTeamMember = (
    teamId: string,
    member: Omit<TeamMember, 'id' | 'joinedAt'>
  ): { success: boolean; message: string } => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, message: 'Time não encontrado.' };
    if (team.members.length >= team.maxMembers) {
      return { success: false, message: `Limite máximo de ${team.maxMembers} membros atingido para este jogo.` };
    }

    const newMember: TeamMember = {
      ...member,
      id: `member-${Date.now()}`,
      joinedAt: new Date().toISOString(),
    };

    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, members: [...t.members, newMember] } : t))
    );
    return { success: true, message: `Jogador "${member.name}" adicionado à equipe!` };
  };

  const removeTeamMember = (teamId: string, memberId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t
      )
    );
  };

  const deleteTeam = (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  };

  const joinTeamByInviteCode = (
    inviteCode: string,
    gameNick: string,
    gameId?: string
  ): { success: boolean; message: string } => {
    const cleanCode = inviteCode.trim().toUpperCase();
    const targetTeam = teams.find((t) => t.inviteCode.toUpperCase() === cleanCode);
    if (!targetTeam) {
      return { success: false, message: 'Código de convite inválido ou equipe inexistente.' };
    }
    if (targetTeam.members.length >= targetTeam.maxMembers) {
      return { success: false, message: `A equipe ${targetTeam.name} já atingiu a capacidade máxima (${targetTeam.maxMembers} jogadores).` };
    }
    if (targetTeam.members.some((m) => m.name === user.username)) {
      return { success: false, message: 'Você já faz parte desta equipe!' };
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: user.username,
      gameNick: gameNick || user.username,
      role: 'titular',
      gameId: gameId || (targetTeam.game === 'Deadlock' ? user.steamId : user.riotId),
      joinedAt: new Date().toISOString(),
    };

    setTeams((prev) =>
      prev.map((t) => (t.id === targetTeam.id ? { ...t, members: [...t.members, newMember] } : t))
    );

    return { success: true, message: `Parabéns! Você entrou para a equipe ${targetTeam.name}!` };
  };

  return (
    <StateContext.Provider
      value={{
        banners,
        tournaments,
        brackets,
        teams,
        templates,
        user,
        isLoggedIn,
        isLoaded,
        wallet,
        transactions,
        withdrawalRequests,
        siteSettings,
        loginWithGoogle,
        logout,
        createTeam,
        addTeamMember,
        removeTeamMember,
        deleteTeam,
        joinTeamByInviteCode,
        addBanner,
        updateBanner,
        deleteBanner,
        addTournament,
        updateTournament,
        deleteTournament,
        cancelTournament,
        declareTournamentWinner,
        updateMatchScore,
        registerTeamInTournament,
        depositPix,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        updateSiteSettings,
        updateUserProfile,
        updateTemplate,
        // RBAC
        allUsers,
        setMatchWinner,
        promoteToReferee,
        demoteToPlayer,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
}
