const DEFAULT_API_URL = "http://localhost:8000";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

function tokenAtual(): string | null {
  if (typeof document === "undefined") return null;
  const cookieMatch = document.cookie.match(/(?:^|; )token=([^;]+)/);
  if (cookieMatch?.[1]) {
    return decodeURIComponent(cookieMatch[1]);
  }
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export async function apiFetch<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = tokenAtual();
  const headers = new Headers(opcoes.headers);

  headers.set("Accept", "application/json");
  if (opcoes.body && !(opcoes.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers,
    });

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      if (resposta.status === 401) {
        throw new Error(dados.erro || "Sessão expirada ou não autenticada. Faça login novamente.");
      }
      throw new Error(dados.erro || `Erro na requisição (${resposta.status}).`);
    }

    return dados as T;
  } catch (err: any) {
    if (err.message && err.message.includes("Failed to fetch")) {
      throw new Error("Não foi possível conectar ao servidor backend. Verifique se o PHP está em execução.");
    }
    throw err;
  }
}
