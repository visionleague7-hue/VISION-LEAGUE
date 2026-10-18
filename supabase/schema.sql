-- =========================================================================
-- VISION eSports Platform - Database Schema & Ledger Architecture (Supabase / PostgreSQL)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    riot_id TEXT,
    steam_id TEXT,
    rank_tier TEXT DEFAULT 'Unranked',
    current_team TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
    role TEXT DEFAULT 'player' CHECK (role IN ('player', 'referee', 'admin', 'moderator')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VIRTUAL WALLET (LEDGER BASE)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0.00),
    locked_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (locked_balance >= 0.00),
    currency VARCHAR(3) DEFAULT 'BRL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FINANCIAL TRANSACTIONS (AUDITABLE LEDGER)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (
        type IN (
            'deposit_pix',           -- Pay-in via PIX
            'tournament_entry',       -- Taxa de inscrição
            'prize_payout',           -- Premiação recebida
            'withdrawal_pix',         -- Pay-out via PIX
            'withdrawal_refund',      -- Estorno de saque rejeitado
            'platform_rake'           -- Taxa de serviço da plataforma
        )
    ),
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    reference_id TEXT,                -- ID de torneio, ID de saque ou txid PIX
    pix_e2e_id TEXT,                  -- End-to-end ID do Banco Central
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WITHDRAWAL REQUESTS (SAQUES PIX & ANTI-FRAUDE)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 5.00),
    pix_key_type VARCHAR(15) NOT NULL CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
    pix_key TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
    requires_manual_approval BOOLEAN DEFAULT FALSE,
    anti_fraud_flagged BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    gateway_transfer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) UNIQUE NOT NULL,
    game VARCHAR(50) NOT NULL CHECK (game IN ('Valorant', 'League of Legends', 'CS2', 'Rainbow Six', 'Outros')),
    banner_url TEXT NOT NULL,
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    prize_pool NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    first_place_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    second_place_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    third_place_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    platform_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 10.00, -- 10% rake
    max_teams INT NOT NULL DEFAULT 16,
    format VARCHAR(40) NOT NULL DEFAULT 'single_elimination' CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ongoing', 'finished', 'cancelled')),
    rules TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    winner_team_id UUID,
    winner_team_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(80) NOT NULL,
    tag VARCHAR(10) NOT NULL,
    logo_url TEXT,
    captain_id UUID NOT NULL REFERENCES public.profiles(id),
    members JSONB DEFAULT '[]'::jsonb, -- Array de membros e Riot IDs
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TOURNAMENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    captain_id UUID NOT NULL REFERENCES public.profiles(id),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('wallet', 'pix_direct', 'free')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    pix_charge_id TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, team_id)
);

-- 8. BRACKET MATCHES (DYNAMIC ELIMINATION GRID)
CREATE TABLE IF NOT EXISTS public.bracket_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round_number INT NOT NULL,            -- 1 = Quartas, 2 = Semis, 3 = Final
    round_name VARCHAR(50) NOT NULL,       -- "Quartas de Final", "Semifinal", "Grande Final"
    match_index INT NOT NULL,              -- Índice no round (1, 2, 3...)
    team_a_id UUID REFERENCES public.teams(id),
    team_a_name TEXT,
    team_a_score INT DEFAULT 0,
    team_b_id UUID REFERENCES public.teams(id),
    team_b_name TEXT,
    team_b_score INT DEFAULT 0,
    winner_team_id UUID REFERENCES public.teams(id),
    winner_name TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
    scheduled_time TIMESTAMPTZ,
    next_match_id UUID REFERENCES public.bracket_matches(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CMS - BANNERS & MEDIA
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(120) NOT NULL,
    subtitle VARCHAR(255),
    image_url TEXT NOT NULL,
    badge_text VARCHAR(50) DEFAULT 'DESTAQUE',
    cta_text VARCHAR(50) DEFAULT 'INSCREVA-SE AGORA',
    cta_link VARCHAR(255) DEFAULT '/tournaments',
    target_page VARCHAR(30) DEFAULT 'home',
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CMS - SITE CUSTOMIZATION & SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(30) PRIMARY KEY DEFAULT 'default',
    site_name VARCHAR(60) DEFAULT 'VISION eSports',
    logo_url TEXT DEFAULT '/images/vision-logo.png',
    primary_color VARCHAR(20) DEFAULT '#00f0ff',   -- Neon Cyan
    secondary_color VARCHAR(20) DEFAULT '#9d4edd', -- Neon Purple
    dark_mode_default BOOLEAN DEFAULT TRUE,
    header_announcement TEXT DEFAULT '⚡ Temporada 2026 Aberta! Mais de R$ 50.000 em premiações instantâneas via PIX.',
    footer_bio TEXT DEFAULT 'A maior e mais segura plataforma de campeonatos competitivos do Brasil. Pagamentos automatizados via PIX, suporte 24/7 e chaveamentos profissionais.',
    discord_url TEXT DEFAULT 'https://discord.gg/visionesports',
    twitch_url TEXT DEFAULT 'https://twitch.tv/visionleague',
    twitter_url TEXT DEFAULT 'https://x.com/visionesports',
    instagram_url TEXT DEFAULT 'https://instagram.com/visionesports',
    min_withdrawal_amount NUMERIC(10, 2) DEFAULT 10.00,
    anti_fraud_threshold NUMERIC(10, 2) DEFAULT 500.00, -- Acima de R$ 500 exige aprovação manual
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NEWS & ARTICLES
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Campeonatos',
    author_name VARCHAR(100) DEFAULT 'Redação VISION',
    views INT DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ATOMIC STORED PROCEDURES (LEDGER & FINANCIAL SAFETY)
-- =========================================================================

-- Trigger to auto-create wallet on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, available_balance, locked_balance)
    VALUES (NEW.id, 0.00, 0.00)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists and create trigger
DROP TRIGGER IF EXISTS on_profile_created_create_wallet ON public.profiles;
CREATE TRIGGER on_profile_created_create_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 1. DEPOSIT CREDIT (WEBHOOK PAY-IN PIX)
CREATE OR REPLACE FUNCTION public.credit_pix_deposit(
    p_user_id UUID,
    p_amount NUMERIC(12, 2),
    p_pix_txid TEXT,
    p_pix_e2e_id TEXT,
    p_description TEXT DEFAULT 'Depósito Instantâneo via PIX'
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_new_balance NUMERIC(12, 2);
    v_tx_id UUID;
BEGIN
    -- Concurrency safe lock on user wallet
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Carteira do usuário não encontrada';
    END IF;

    -- Check for idempotency (avoid double credits)
    IF EXISTS (SELECT 1 FROM public.transactions WHERE reference_id = p_pix_txid AND status = 'completed') THEN
        RETURN jsonb_build_object('success', true, 'message', 'Depósito já processado anteriormente (Idempotente)');
    END IF;

    v_new_balance := v_wallet.available_balance + p_amount;

    -- Update balance
    UPDATE public.wallets
    SET available_balance = v_new_balance, updated_at = NOW()
    WHERE id = v_wallet.id;

    -- Record in Ledger
    INSERT INTO public.transactions (
        wallet_id, user_id, type, amount, status,
        balance_before, balance_after, reference_id, pix_e2e_id, description
    ) VALUES (
        v_wallet.id, p_user_id, 'deposit_pix', p_amount, 'completed',
        v_wallet.available_balance, v_new_balance, p_pix_txid, p_pix_e2e_id, p_description
    ) RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TOURNAMENT REGISTRATION VIA WALLET (DEBIT)
CREATE OR REPLACE FUNCTION public.register_tournament_wallet(
    p_user_id UUID,
    p_team_id UUID,
    p_tournament_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_tournament RECORD;
    v_new_balance NUMERIC(12, 2);
    v_tx_id UUID;
BEGIN
    -- Lock tournament
    SELECT * INTO v_tournament FROM public.tournaments WHERE id = p_tournament_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Torneio não encontrado';
    END IF;

    IF v_tournament.status != 'open' THEN
        RAISE EXCEPTION 'As inscrições para este torneio não estão abertas';
    END IF;

    -- Check if team is already registered
    IF EXISTS (SELECT 1 FROM public.tournament_registrations WHERE tournament_id = p_tournament_id AND team_id = p_team_id) THEN
        RAISE EXCEPTION 'Seu time já está inscrito neste campeonato';
    END IF;

    -- Lock wallet
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Carteira não encontrada';
    END IF;

    -- Free tournament check
    IF v_tournament.entry_fee > 0 THEN
        IF v_wallet.available_balance < v_tournament.entry_fee THEN
            RAISE EXCEPTION 'Saldo insuficiente na carteira virtual. Saldo atual: R$ %, Necessário: R$ %',
                v_wallet.available_balance, v_tournament.entry_fee;
        END IF;

        v_new_balance := v_wallet.available_balance - v_tournament.entry_fee;

        UPDATE public.wallets
        SET available_balance = v_new_balance, updated_at = NOW()
        WHERE id = v_wallet.id;

        INSERT INTO public.transactions (
            wallet_id, user_id, type, amount, status,
            balance_before, balance_after, reference_id, description
        ) VALUES (
            v_wallet.id, p_user_id, 'tournament_entry', -v_tournament.entry_fee, 'completed',
            v_wallet.available_balance, v_new_balance, p_tournament_id::text,
            'Inscrição no torneio: ' || v_tournament.title
        ) RETURNING id INTO v_tx_id;
    END IF;

    -- Register team
    INSERT INTO public.tournament_registrations (
        tournament_id, team_id, captain_id, payment_method, payment_status
    ) VALUES (
        p_tournament_id, p_team_id, p_user_id,
        CASE WHEN v_tournament.entry_fee > 0 THEN 'wallet' ELSE 'free' END,
        'paid'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Inscrição realizada com sucesso!',
        'tournament_id', p_tournament_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. AUTOMATIC PRIZE PAYOUT (ADMIN DECLARES WINNER)
CREATE OR REPLACE FUNCTION public.declare_tournament_winner_and_payout(
    p_tournament_id UUID,
    p_winner_team_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_tourn RECORD;
    v_team RECORD;
    v_captain_wallet RECORD;
    v_first_prize NUMERIC(12, 2);
    v_new_balance NUMERIC(12, 2);
    v_tx_id UUID;
BEGIN
    SELECT * INTO v_tourn FROM public.tournaments WHERE id = p_tournament_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Torneio não encontrado';
    END IF;

    IF v_tourn.status = 'finished' THEN
        RAISE EXCEPTION 'Este torneio já foi finalizado e a premiação distribuída';
    END IF;

    SELECT * INTO v_team FROM public.teams WHERE id = p_winner_team_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Time vencedor não encontrado';
    END IF;

    v_first_prize := COALESCE(v_tourn.first_place_prize, v_tourn.prize_pool);

    -- Credit prize to Captain's wallet
    SELECT * INTO v_captain_wallet FROM public.wallets WHERE user_id = v_team.captain_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Carteira do capitão do time vencedor não encontrada';
    END IF;

    v_new_balance := v_captain_wallet.available_balance + v_first_prize;

    UPDATE public.wallets
    SET available_balance = v_new_balance, updated_at = NOW()
    WHERE id = v_captain_wallet.id;

    -- Ledger transaction
    INSERT INTO public.transactions (
        wallet_id, user_id, type, amount, status,
        balance_before, balance_after, reference_id, description
    ) VALUES (
        v_captain_wallet.id, v_team.captain_id, 'prize_payout', v_first_prize, 'completed',
        v_captain_wallet.available_balance, v_new_balance, p_tournament_id::text,
        'Premiação 1º Lugar: ' || v_tourn.title || ' (Time: ' || v_team.name || ')'
    ) RETURNING id INTO v_tx_id;

    -- Update tournament status
    UPDATE public.tournaments
    SET status = 'finished',
        winner_team_id = p_winner_team_id,
        winner_team_name = v_team.name,
        updated_at = NOW()
    WHERE id = p_tournament_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Torneio finalizado com sucesso! Premiação de R$ ' || v_first_prize || ' creditada na carteira do capitão.',
        'transaction_id', v_tx_id,
        'winner_team', v_team.name,
        'prize_amount', v_first_prize
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. WITHDRAWAL REQUEST (PAY-OUT VIA PIX WITH ANTI-FRAUD LOCK)
CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC(12, 2),
    p_pix_key_type VARCHAR(15),
    p_pix_key TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_settings RECORD;
    v_req_id UUID;
    v_requires_approval BOOLEAN := FALSE;
    v_min_amount NUMERIC(12, 2) := 10.00;
    v_anti_fraud_threshold NUMERIC(12, 2) := 500.00;
BEGIN
    SELECT * INTO v_settings FROM public.site_settings WHERE id = 'default';
    IF FOUND THEN
        v_min_amount := COALESCE(v_settings.min_withdrawal_amount, 10.00);
        v_anti_fraud_threshold := COALESCE(v_settings.anti_fraud_threshold, 500.00);
    END IF;

    IF p_amount < v_min_amount THEN
        RAISE EXCEPTION 'O valor mínimo para saque é de R$ %', v_min_amount;
    END IF;

    -- Concurrency check on wallet
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Carteira não encontrada';
    END IF;

    IF v_wallet.available_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo disponível insuficiente para saque. Disponível: R$ %', v_wallet.available_balance;
    END IF;

    -- Check anti-fraud rule
    IF p_amount >= v_anti_fraud_threshold THEN
        v_requires_approval := TRUE;
    END IF;

    -- Move from available to locked
    UPDATE public.wallets
    SET available_balance = available_balance - p_amount,
        locked_balance = locked_balance + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet.id;

    -- Create withdrawal request
    INSERT INTO public.withdrawal_requests (
        user_id, amount, pix_key_type, pix_key, status,
        requires_manual_approval, anti_fraud_flagged
    ) VALUES (
        p_user_id, p_amount, p_pix_key_type, p_pix_key,
        CASE WHEN v_requires_approval THEN 'pending' ELSE 'approved' END,
        v_requires_approval,
        v_requires_approval
    ) RETURNING id INTO v_req_id;

    RETURN jsonb_build_object(
        'success', true,
        'request_id', v_req_id,
        'amount', p_amount,
        'requires_manual_approval', v_requires_approval,
        'message', CASE 
            WHEN v_requires_approval THEN 'Saque em análise de segurança pela equipe administrativa (Valor acima de R$ ' || v_anti_fraud_threshold || ')'
            ELSE 'Saque aprovado e enviado para processamento PIX imediato'
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REJEITAR SAQUE COM ESTORNO AUTOMÁTICO (ROLLBACK SEGURO NO BANCO)
CREATE OR REPLACE FUNCTION public.reject_withdrawal_atomic(
    p_request_id UUID,
    p_reason TEXT DEFAULT 'Rejeição / Falha no processamento Asaas'
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_req FROM public.withdrawal_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitação de saque não encontrada';
    END IF;

    IF v_req.status = 'rejected' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Saque já estornado anteriormente');
    END IF;

    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_req.user_id FOR UPDATE;

    -- Devolve o valor do saldo_bloqueado para o saldo_disponivel
    UPDATE public.wallets
    SET available_balance = available_balance + v_req.amount,
        locked_balance = GREATEST(0.00, locked_balance - v_req.amount),
        updated_at = NOW()
    WHERE id = v_wallet.id;

    -- Atualiza status da solicitação
    UPDATE public.withdrawal_requests
    SET status = 'rejected',
        rejection_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Registra transação de estorno no Ledger
    INSERT INTO public.transactions (
        wallet_id, user_id, type, amount, status,
        balance_before, balance_after, reference_id, description
    ) VALUES (
        v_wallet.id, v_req.user_id, 'withdrawal_refund', v_req.amount, 'completed',
        v_wallet.available_balance, v_wallet.available_balance + v_req.amount,
        p_request_id::text, 'Estorno de Saque: ' || p_reason
    );

    RETURN jsonb_build_object('success', true, 'message', 'Saldo estornado com sucesso para a carteira do jogador');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- RBAC — ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Habilitar RLS nas tabelas críticas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bracket_matches ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- PROFILES: Apenas admin pode alterar o campo `role` de outro usuário
-- -------------------------------------------------------------------------

-- Qualquer usuário autenticado pode ver perfis (leitura pública)
CREATE POLICY "Perfis visíveis para todos os usuários autenticados"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Usuário pode atualizar seu próprio perfil (exceto o campo role)
CREATE POLICY "Usuário pode editar seu próprio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  -- Impede que o usuário altere seu próprio role via API direta
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Apenas admin pode alterar o role de qualquer usuário
CREATE POLICY "Admin pode alterar role de qualquer usuário"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- -------------------------------------------------------------------------
-- BRACKET_MATCHES: Apenas referee e admin podem atualizar resultados
-- -------------------------------------------------------------------------

-- Qualquer um pode ler as partidas
CREATE POLICY "Partidas visíveis para todos"
ON public.bracket_matches
FOR SELECT
TO authenticated
USING (true);

-- Apenas referee ou admin podem declarar vencedores
CREATE POLICY "Apenas árbitros e admins podem homologar resultados"
ON public.bracket_matches
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('referee', 'admin', 'moderator')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('referee', 'admin', 'moderator')
);

-- -------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR: Promover usuário para árbitro (apenas admin pode chamar)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.promote_to_referee(p_target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_caller_role TEXT;
  v_target_role TEXT;
BEGIN
  -- Verificar role do chamador
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem promover usuários a árbitros';
  END IF;

  -- Verificar role do alvo
  SELECT role INTO v_target_role FROM public.profiles WHERE id = p_target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário alvo não encontrado';
  END IF;
  IF v_target_role = 'admin' THEN
    RAISE EXCEPTION 'Não é possível alterar o papel de um administrador';
  END IF;

  UPDATE public.profiles
  SET role = 'referee', updated_at = NOW()
  WHERE id = p_target_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Usuário promovido a árbitro com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------------------
-- FUNÇÃO AUXILIAR: Rebaixar árbitro para jogador (apenas admin pode chamar)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.demote_to_player(p_target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_caller_role TEXT;
  v_target_role TEXT;
BEGIN
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar papéis de usuários';
  END IF;

  SELECT role INTO v_target_role FROM public.profiles WHERE id = p_target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário alvo não encontrado';
  END IF;
  IF v_target_role = 'admin' THEN
    RAISE EXCEPTION 'Não é possível rebaixar um administrador';
  END IF;

  UPDATE public.profiles
  SET role = 'player', updated_at = NOW()
  WHERE id = p_target_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Usuário rebaixado para jogador com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
