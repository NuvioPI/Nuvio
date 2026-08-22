export { API_URL } from "./api-url";
import { API_URL } from "./api-url";

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
  } catch (err: unknown) {
    const mensagemErro = err instanceof Error ? err.message : String(err);
    if (
      err instanceof TypeError ||
      /Failed to fetch|NetworkError|Load failed/i.test(mensagemErro)
    ) {
      throw new Error(
        `Não foi possível acessar o backend em ${API_URL}. Verifique o serviço do backend no Render e a configuração de CORS.`
      );
    }
    throw err;
  }
}
