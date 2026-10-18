import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PixKeyType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function validatePixKey(type: PixKeyType, key: string): { valid: boolean; message?: string } {
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { valid: false, message: "A chave PIX não pode ser vazia" };
  }

  switch (type) {
    case "cpf": {
      const numbers = cleanKey.replace(/\D/g, "");
      if (numbers.length !== 11) {
        return { valid: false, message: "CPF deve conter exatamente 11 dígitos" };
      }
      return { valid: true };
    }
    case "cnpj": {
      const numbers = cleanKey.replace(/\D/g, "");
      if (numbers.length !== 14) {
        return { valid: false, message: "CNPJ deve conter 14 dígitos" };
      }
      return { valid: true };
    }
    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanKey)) {
        return { valid: false, message: "Formato de e-mail inválido" };
      }
      return { valid: true };
    }
    case "phone": {
      const numbers = cleanKey.replace(/\D/g, "");
      if (numbers.length < 10 || numbers.length > 11) {
        return { valid: false, message: "Telefone deve conter DDD + número (10 ou 11 dígitos)" };
      }
      return { valid: true };
    }
    case "random": {
      if (cleanKey.length < 32) {
        return { valid: false, message: "Chave aleatória EVP deve conter formato UUID de 32+ caracteres" };
      }
      return { valid: true };
    }
    default:
      return { valid: true };
  }
}
