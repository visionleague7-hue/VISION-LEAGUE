import type { Metadata } from 'next';
import './globals.css';
import { StateProvider } from '@/lib/state-context';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Vision League • visionleague.gg • Campeonatos de eSports e Carteira PIX',
  description: 'Plataforma oficial Vision League (visionleague.gg) gerenciada por vision.group.adm. Chaveamentos dinâmicos, premiações automáticas via PIX e painel administrativo CMS completo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-dark-950 text-gray-100 min-h-screen antialiased selection:bg-red-600 selection:text-white">
        <StateProvider>
          <AppShell>{children}</AppShell>
        </StateProvider>
      </body>
    </html>
  );
}
