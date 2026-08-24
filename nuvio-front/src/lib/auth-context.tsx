'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo?: string | null;
  setor?: string | null;
  telefone?: string | null;
  fotoPerfil?: string | null;
  dataCadastro?: string | null;
  tipo?: {
    id: number;
    nome: string;
  } | string | null;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (
    email: string,
    senha: string,
    opcoes?: { somenteAdministrador?: boolean }
  ) => Promise<{ sucesso: boolean; erro?: string; usuario?: Usuario }>;
  logout: (destino?: string) => void;
  atualizarUsuario: (novosDados: Partial<Usuario>) => void;
  carregando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(nome: string, valor: string, horas: number) {
  const data = new Date();
  data.setTime(data.getTime() + horas * 60 * 60 * 1000);
  document.cookie = `${nome}=${valor}; expires=${data.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(nome: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + nome + '=([^;]+)'));
  return match ? match[2] : null;
}

function removerCookie(nome: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const tokenSalvo = getCookie('token') || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
    const usuarioSalvo = typeof localStorage !== 'undefined' ? localStorage.getItem('usuario') : null;

    async function validarSessao() {
      if (!tokenSalvo) {
        setCarregando(false);
        return;
      }

      try {
        const resposta = await fetch(`${API_URL}/auth/verificar`, {
          headers: { Authorization: `Bearer ${tokenSalvo}` },
          cache: 'no-store',
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || !dados.usuario) {
          throw new Error('Sessão inválida');
        }

        setToken(tokenSalvo);
        setUsuario(dados.usuario);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('usuario', JSON.stringify(dados.usuario));
        }
      } catch {
        removerCookie('token');
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
        }
        setToken(null);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    }

    void validarSessao();
  }, []);

  async function login(
    email: string,
    senha: string,
    opcoes: { somenteAdministrador?: boolean } = {}
  ) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      let data: { sucesso?: boolean; erro?: string; token?: string; usuario?: Usuario } = {};
      try {
        data = await res.json();
      } catch {
        return {
          sucesso: false,
          erro: `Resposta inválida do servidor (${res.status}). Verifique se o backend PHP está rodando.`,
        };
      }

      if (!res.ok || !data.token || !data.usuario) {
        return { sucesso: false, erro: data.erro || 'Erro ao fazer login' };
      }

      const tipoNome = typeof data.usuario.tipo === 'object' && data.usuario.tipo !== null
        ? data.usuario.tipo.nome
        : data.usuario.tipo;
      if (opcoes.somenteAdministrador && tipoNome !== 'Administrador') {
        return { sucesso: false, erro: 'Acesso restrito a administradores.' };
      }

      setCookie('token', data.token!, 8);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('token', data.token!);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }
      setToken(data.token!);
      setUsuario(data.usuario!);

      return { sucesso: true, usuario: data.usuario };
    } catch (err) {
      return { sucesso: false, erro: 'Não foi possível conectar ao servidor' };
    }
  }

  function logout(destino = '/login') {
    removerCookie('token');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    setToken(null);
    setUsuario(null);
    router.push(destino);
  }

  function atualizarUsuario(novosDados: Partial<Usuario>) {
    setUsuario((atual) => {
      if (!atual) return null;
      const atualizado = { ...atual, ...novosDados };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('usuario', JSON.stringify(atualizado));
      }
      return atualizado;
    });
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, atualizarUsuario, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return context;
}
