"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, KeyRound, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function PortalLoginPage() {
  const router = useRouter();
  const { login, usuario, carregando } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [destino] = useState(() => {
    if (typeof window === "undefined") return "chamado";
    return new URLSearchParams(window.location.search).get("dest") === "email" ? "email" : "chamado";
  });

  useEffect(() => {
    if (!carregando && usuario) router.replace(`/portal/chamados?novo=${destino}`);
  }, [carregando, destino, router, usuario]);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    const resultado = await login(email, senha);
    setEnviando(false);
    if (!resultado.sucesso) {
      setErro(resultado.erro || "Não foi possível entrar. Confira seus dados.");
      return;
    }
    router.replace(`/portal/chamados?novo=${destino}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f9f6] px-5 py-7 text-[#173020] sm:px-8 lg:py-10">
      <div className="mx-auto max-w-5xl"><Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-[#52705c] transition hover:text-[#0f6b2e]"><ArrowLeft size={17} /> Voltar para o portal</Link><div className="mx-auto mt-12 max-w-md rounded-[28px] border border-[#dbe8de] bg-white p-7 shadow-[0_16px_50px_rgba(24,70,38,.07)] sm:p-9"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ee] text-[#147538]"><KeyRound size={23} /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#2b9050]">Área do cliente</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Entre para continuar</h1><p className="mt-3 leading-6 text-[#63766a]">Acesse sua conta para abrir chamados e acompanhar seus atendimentos.</p><form onSubmit={entrar} className="mt-8 grid gap-4"><label className="grid gap-2 text-sm font-medium">E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" placeholder="voce@empresa.com" autoComplete="email" /></label><label className="grid gap-2 text-sm font-medium">Senha<input required type="password" value={senha} onChange={(event) => setSenha(event.target.value)} className="input" placeholder="Digite sua senha" autoComplete="current-password" /></label>{erro && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700">{erro}</p>}<button type="submit" disabled={enviando} className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0f6b2e] font-semibold text-white transition hover:bg-[#0b5223] disabled:cursor-not-allowed disabled:opacity-60">{enviando && <LoaderCircle size={18} className="animate-spin" />}{enviando ? "Entrando..." : "Entrar no portal"}</button></form><div className="mt-7 border-t border-[#e6eee8] pt-5"><p className="flex items-center gap-2 text-sm font-semibold text-[#315640]"><UserRound size={16} className="text-[#2b9050]" /> Ainda não tem acesso?</p><p className="mt-2 text-sm leading-6 text-[#6a7b70]">Peça ao administrador da sua empresa para criar seu usuário. Por segurança, o cadastro é liberado somente pela equipe responsável.</p></div></div><p className="mt-6 flex justify-center gap-2 text-xs text-[#718177]"><LockKeyhole size={14} /> Login protegido pela Nuvio</p></div>
    </main>
  );
}
