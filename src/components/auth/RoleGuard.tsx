'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAppState } from '@/lib/state-context';
import type { UserProfile } from '@/lib/types';

type AllowedRole = 'referee' | 'admin' | 'moderator';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Roles que têm permissão de acesso. Admin sempre tem acesso. */
  allowedRoles: AllowedRole[];
  /** Para onde redirecionar quem não tem permissão */
  redirectTo?: string;
}

function hasAccess(role: UserProfile['role'], allowedRoles: AllowedRole[]): boolean {
  if (role === 'admin') return true; // Admin sempre tem acesso total
  return allowedRoles.includes(role as AllowedRole);
}

export default function RoleGuard({ children, allowedRoles, redirectTo = '/' }: RoleGuardProps) {
  const { user, isLoggedIn } = useAppState();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que o estado de autenticação foi carregado
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(hasAccess(user.role, allowedRoles));
      }
      setIsChecking(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [isLoggedIn, user.role, allowedRoles]);

  if (isChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    const isNotLoggedIn = !isLoggedIn;
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-900 border border-dark-750 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-600/40 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Acesso Negado
            </h1>
            <p className="text-xs text-gray-400">
              {isNotLoggedIn
                ? 'Você precisa estar logado para acessar esta área.'
                : 'Você não tem permissão para acessar esta página. Apenas usuários com o nível de acesso adequado podem continuar.'}
            </p>
          </div>

          <div className="p-3 bg-dark-950/70 rounded-xl border border-dark-800 text-[11px] text-gray-400 text-left flex items-start gap-2">
            <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              {isNotLoggedIn ? (
                <>Faça login para continuar.</>
              ) : (
                <>
                  Sua conta possui o nível{' '}
                  <code className="bg-dark-800 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                    {user.role}
                  </code>
                  . Esta área requer:{' '}
                  {allowedRoles.map((r) => (
                    <code
                      key={r}
                      className="bg-dark-800 px-1.5 py-0.5 rounded text-gray-300 font-mono mr-1"
                    >
                      {r}
                    </code>
                  ))}
                  ou{' '}
                  <code className="bg-dark-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                    admin
                  </code>
                  .
                </>
              )}
            </span>
          </div>

          <div className="pt-2 border-t border-dark-800">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retornar para o site principal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
