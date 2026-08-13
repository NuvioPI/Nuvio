"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const dados = await apiFetch<any>("/auth/verificar", { method: "GET" });
        // AuthController::me() devolve o usuário diretamente
        setUsuario(dados);
      } catch (e: any) {
        setErro(e.message || "Erro ao buscar perfil");
      }
    })();
  }, []);

  if (erro) return <div className="p-6">Erro: {erro}</div>;
  if (!usuario) return <div className="p-6">Carregando perfil...</div>;

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto bg-(--card) p-6 rounded-xl border border-(--card-border)">
        <div className="flex items-center gap-4">
          <Image
            src={usuario.fotoPerfil ?? "/balls.jpeg"}
            alt={usuario.nome}
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-semibold">{usuario.nome}</h1>
            <p className="text-sm text-(--muted-foreground)">{usuario.email}</p>
            {usuario.cargo && <div className="text-sm">{usuario.cargo} — {usuario.setor}</div>}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-(--muted) rounded">
            <strong>Telefone</strong>
            <div>{usuario.telefone ?? '—'}</div>
          </div>
          <div className="p-4 bg-(--muted) rounded">
            <strong>Cadastro</strong>
            <div>{usuario.dataCadastro ? new Date(usuario.dataCadastro).toLocaleString() : '—'}</div>
          </div>
        </div>

        <div className="mt-6">
          <a href="/perfil/editar" className="inline-block px-4 py-2 bg-[#0f6b2e] text-white rounded">Editar Perfil</a>
        </div>
      </div>
    </main>
  );
}
