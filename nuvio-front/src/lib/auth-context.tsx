'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: number;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => void;
  carregando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(nome: string, valor: string, horas: number) {
  const data = new Date();
  data.setTime(data.getTime() + horas * 60 * 60 * 1000);
  document.cookie = `${nome}=${valor}; expires=${data.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(nome: string) {
  const match = document.cookie.match(new RegExp('(^| )' + nome + '=([^;]+)'));
  return match ? match[2] : null;
}

function removerCookie(nome: string) {
  document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const tokenSalvo = getCookie('token');
    const usuarioSalvo = localStorage.getItem('usuario'); // dados não sensíveis, ok no localStorage

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  async function login(email: string, senha: string) {
    try {
      const res = await fetch(`${API_URL}/loginAdmin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok || !data.sucesso) {
        return { sucesso: false, erro: data.erro || 'Erro ao fazer login' };
      }

      setCookie('token', data.token, 8); // 8h, igual expiração do JWT no back
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setToken(data.token);
      setUsuario(data.usuario);

      return { sucesso: true };
    } catch (err) {
      return { sucesso: false, erro: 'Não foi possível conectar ao servidor' };
    }
  }

  function logout() {
    removerCookie('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    router.push('/admin/login');
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return context;
}