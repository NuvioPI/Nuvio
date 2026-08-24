"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validação simples para evitar requisições nulas
  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" };
  }

    try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha: password }),
    });

    const respostaTexto = await response.text();
    let data: {
      erro?: string;
      requestId?: string;
      token?: string;
      usuario?: { tipo?: { nome?: string } | string };
    } = {};

    try {
      data = respostaTexto ? JSON.parse(respostaTexto) : {};
    } catch {
      return {
        error: response.ok
          ? "O servidor retornou uma resposta inválida."
          : `O backend retornou erro ${response.status} sem uma resposta JSON válida.`,
      };
    }

    if (!response.ok || !data.token || !data.usuario) {
      const referencia = data.requestId ? ` Referência: ${data.requestId}.` : "";
      return { error: `${data.erro || "Credenciais inválidas."}${referencia}` };
    }

    const tipoNome = typeof data.usuario.tipo === "object" && data.usuario.tipo !== null
      ? data.usuario.tipo.nome
      : data.usuario.tipo;

    if (tipoNome !== "Administrador") {
      return { error: "Acesso restrito a administradores." };
    }

    // Recebe o token JWT assinado pelo backend PHP
    const token = data.token;

    // Salva nos cookies (HttpOnly, seguro)
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
      sameSite: "lax",
    });

    // Se o login for bem sucedido, redireciona
    return { success: true };
  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Erro de conexão com o servidor. Tente novamente." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/admin/login");
}
