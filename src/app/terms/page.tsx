import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para a Início</span>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900 to-dark-850 border border-dark-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        <div className="flex items-center gap-3 text-red-400 text-xs font-black uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" />
          <span>Regulamento & Compliance Jurídico</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Termos de Uso e Serviço — Plataforma VISION
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-2">
          <strong>Última atualização:</strong> Outubro de 2026 • Plataforma Oficial de Competições de eSports (visionleague.gg)
        </p>
      </div>

      {/* Conteúdo Completo dos Termos */}
      <div className="bg-dark-900 rounded-3xl border border-dark-800 p-6 sm:p-10 space-y-8 text-sm text-gray-300 leading-relaxed">
        <div className="p-4 bg-dark-850 rounded-2xl border border-dark-750 text-gray-300">
          Bem-vindo à <strong>VISION</strong>! Ao se cadastrar, acessar ou utilizar nossa plataforma de campeonatos de eSports, você concorda expressamente com os presentes Termos de Uso e Serviço. Caso não concorde com qualquer uma das condições dispostas, você não deverá utilizar a plataforma.
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            1. DEFINIÇÕES E NATUREZA DO SERVIÇO
          </h2>
          <p><strong>1.1.</strong> A <strong>VISION</strong> é uma plataforma online de organização, intermediação e gestão de campeonatos, torneios e ligas de esportes eletrônicos (eSports).</p>
          <p><strong>1.2.</strong> A VISION não é afiliada, patrocinada ou endossada pela Riot Games (Valorant, League of Legends) ou Valve Corporation (Deadlock, CS2). Todos os direitos autorais e marcas registradas pertencem aos seus respectivos desenvolvedores.</p>
          <p><strong>1.3.</strong> A plataforma atua estritamente na oferta de serviços de entretenimento e competição de habilidade (<em>games of skill</em>), não constituindo apostas, jogos de azar ou loterias.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            2. CADASTRO E ELEGIBILIDADE
          </h2>
          <p><strong>2.1. Idade Mínima:</strong> O uso da plataforma é permitido para pessoas com idade igual ou superior a 14 anos. Usuários menores de 18 anos declaram estar autorizados por seus pais ou responsáveis legais para disputas competitivas.</p>
          <p><strong>2.2. Veracidade das Informações:</strong> O usuário é o único responsável pela veracidade dos dados cadastrados (Nome, CPF, E-mail, Chave PIX e IDs de Jogos).</p>
          <p><strong>2.3. IDs de Jogos:</strong> Para participar dos torneios, o usuário deve cadastrar corretamente suas contas de jogo oficiais (Riot ID + Tag para Valorant/LoL, Steam ID / Friend Code para Deadlock). Inscrições com IDs incorretos ou de terceiros resultarão na desqualificação da equipe.</p>
          <p><strong>2.4. Conta Única:</strong> É estritamente proibida a criação de múltiplas contas por um mesmo indivíduo.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            3. INSCRIÇÕES, CARTEIRA VIRTUAL E PAGAMENTOS
          </h2>
          <p><strong>3.1. Processamento Financeiro:</strong> Todos os depósitos, pagamentos de taxas de inscrição e saques são processados via PIX através da intermediadora financeira parceira (<strong>Asaas Gestão Financeira</strong>).</p>
          <p><strong>3.2. Taxas de Inscrição:</strong> As inscrições em torneios pagos são debitadas do saldo da Carteira Virtual do usuário na plataforma ou pagas diretamente via QR Code PIX gerado no momento do checkout.</p>
          <p><strong>3.3. Reembolsos e Desistências:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>A taxa de inscrição <strong>não será reembolsada</strong> caso o time desista do torneio após a publicação e confirmação da chave de confrontos (<em>brackets</em>).</li>
            <li><strong>Caso um torneio seja cancelado exclusivamente pela administração da VISION, o valor da inscrição será integralmente estornado para a Carteira Virtual do usuário</strong> para que ele possa se inscrever em outro campeonato sem qualquer prejuízo.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            4. PREMIAÇÕES E SAQUES
          </h2>
          <p><strong>4.1. Creditamento:</strong> Ao término do torneio e após a validação oficial dos resultados pela equipe de arbitragem, a premiação correspondente será creditada na Carteira Virtual da equipe/jogador vitorioso.</p>
          <p><strong>4.2. Solicitação de Saque:</strong> O usuário pode solicitar a transferência do seu saldo disponível na Carteira Virtual para sua conta bancária a qualquer momento, informando uma Chave PIX válida (Valor mínimo para saque: R$ 10,00; Valor mínimo para depósito: R$ 10,00).</p>
          <p><strong>4.3. Titularidade do Saque:</strong> Por motivos de segurança antifraude, a chave PIX de destino do saque deve estar vinculada ao mesmo titular/CPF cadastrado na plataforma VISION.</p>
          <p><strong>4.4. Prazos:</strong> Os saques automatizados via API são processados de forma instantânea ou em até 24 (vinte e quatro) horas úteis em casos de checagem preventiva de fraude.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            5. REGRAS DE JOGO, ARBITRAGEM E CONDUTA
          </h2>
          <p><strong>5.1. Espírito Esportivo e Fair Play:</strong> É terminantemente proibido o uso de <em>cheats</em>, <em>hacks</em>, <em>exploits</em>, programas de terceiros não autorizados, <em>toxicidade</em> ou atitudes antidesportivas.</p>
          <p><strong>5.2. Smurfing e Incompatibilidade de Elo:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Em campeonatos com restrição de Elo (Rank) declarada (ex: League of Legends e Valorant), o uso de contas secundárias para burlar os limites do torneio (<em>smurfing</em>) resultará na desclassificação imediata do time e banimento dos envolvidos.</li>
            <li><strong>O torneio de Deadlock é operado em formato aberto (Livre/Open), sem restrição de rank.</strong></li>
          </ul>
          <p><strong>5.3. Validação de Resultados:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Nas partidas validadas por API (ex: League of Legends), os dados enviados pelos servidores oficiais do jogo prevalecem como resultado definitivo.</li>
            <li>Nas partidas sem API direta (ex: Valorant e Deadlock), os capitães são obrigados a enviar o <em>print screen</em> (captura de tela) do placar final na página da partida dentro do prazo estipulado.</li>
          </ul>
          <p><strong>5.4. Soberania da Arbitragem:</strong> A equipe de arbitragem (<em>Match Admins</em>) da VISION possui palavra final sobre qualquer contestação, disputas de placar ou punições dentro do torneio.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            6. PROPRIEDADE INTELECTUAL E DIREITOS DE IMAGEM
          </h2>
          <p><strong>6.1.</strong> Ao se inscrever em um torneio da VISION, o usuário concede à plataforma o direito gratuito e não exclusivo de transmitir, narrar, gravar e divulgar as partidas, apelidos de jogo (Nicks), logos de equipes e imagens de jogo nas redes sociais e canais de transmissão (Twitch, YouTube, TikTok, etc.).</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            7. LIMITAÇÃO DE RESPONSABILIDADE
          </h2>
          <p><strong>7.1. A VISION não se responsabiliza por:</strong></p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Problemas de conexão, <em>lag</em>, quedas de energia ou falhas nos equipamentos dos jogadores durante as partidas.</li>
            <li>Indisponibilidade temporária ou atualizações nos servidores oficiais dos jogos (Riot Games, Valve/Steam).</li>
            <li>Dados incorretos inseridos pelo próprio usuário no momento da solicitação do PIX de saque.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            8. PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)
          </h2>
          <p><strong>8.1.</strong> A VISION trata os dados pessoais dos usuários em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
          <p><strong>8.2.</strong> Os dados coletados (CPF, E-mail, IDs de jogo e Histórico Financeiro) são utilizados exclusivamente para operacionalização das partidas, prevenção contra fraudes e execução dos pagamentos e saques via Asaas.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            9. ALTERAÇÕES DOS TERMOS
          </h2>
          <p><strong>9.1.</strong> A VISION reserva-se o direito de modificar os presentes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a sua publicação na plataforma.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wide text-glow-red">
            10. FORO E LEGISLAÇÃO APLICÁVEL
          </h2>
          <p><strong>10.1.</strong> Estes Termos são regidos e interpretados segundo as leis da República Federativa do Brasil. Fica eleito o foro da comarca da sede da empresa administradora para dirimir quaisquer dúvidas ou controvérsias relativas a este documento.</p>
        </section>
      </div>
    </div>
  );
}
