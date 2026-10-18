'use client';

/**
 * AdminAuthGate — Proteção do Painel Admin via RBAC
 * Apenas usuários com role 'admin' ou 'moderator' podem acessar.
 * O antigo sistema de senha mestra foi substituído pelo controle de role.
 */
import React from 'react';
import RoleGuard from '@/components/auth/RoleGuard';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  return (
    <RoleGuard allowedRoles={['admin', 'moderator']} redirectTo="/">
      {children}
    </RoleGuard>
  );
}
