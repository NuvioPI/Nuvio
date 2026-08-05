const DEFAULT_API_URL = "http://localhost:8000";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

function tokenAtual() {
  if (typeof document === "undefined") return null;
  return document.cookie.match(/(?:^|; )token=([^;]+)/)?.[1] ?? null;
}

export async function apiFetch<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = tokenAtual();
  const headers = new Headers(opcoes.headers);

  headers.set("Accept", "application/json");
  if (opcoes.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers,
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível concluir a solicitação.");
  }

  return dados as T;
}
