"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validação simples para evitar requisições nulas
  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" };
  }

  try {
    // Configura a URL base da sua API PHP (ajuste no .env se necessário, ex: php -S localhost:8000)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/nuvio-back/routes/api.php";
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha: password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.erro || "Credenciais inválidas." };
    }

    // Recebe o token JWT assinado pelo backend PHP
    const token = data.token;

    // Salva nos cookies (HttpOnly, seguro)
    const cookieStore = await cookies();
    cookieStore.set({
      name: "nuvio_admin_token",
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
  cookieStore.delete("nuvio_admin_token");
  redirect("/admin/login");
}
