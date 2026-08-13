"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardPlus, FileText, LoaderCircle, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function PublicTicketPage() {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = event.currentTarget;
    try {
      const response = await apiFetch<{ idTicket: number }>("/public/tickets", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      setSuccess(response.idTicket);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível enviar seu chamado.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f9f6] px-5 py-7 text-[#173020] sm:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl"><Link href="/externo" className="inline-flex items-center gap-2 text-sm font-medium text-[#52705c] transition hover:text-[#0f6b2e]"><ArrowLeft size={17} /> Voltar para o portal</Link><div className="mt-7 grid gap-7 lg:grid-cols-[1fr_310px] lg:items-start"><section className="rounded-[28px] border border-[#dbe8de] bg-white p-6 shadow-[0_16px_50px_rgba(24,70,38,.07)] sm:p-9"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ee] text-[#147538]"><ClipboardPlus size={24} /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#2b9050]">Atendimento por protocolo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Abra um chamado</h1><p className="mt-3 max-w-xl leading-7 text-[#63766a]">Conte o que aconteceu com o máximo de detalhes. Nossa equipe vai analisar sua solicitação e responder pelo e-mail informado.</p>{success && <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#eaf8ee] p-4 text-[#176d36]"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><p className="text-sm leading-6"><b>Chamado #{success} aberto com sucesso.</b><br />Você receberá as próximas atualizações por e-mail.</p></div>}{error && <p role="alert" className="mt-7 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<form onSubmit={submit} className="mt-8 grid gap-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Seu nome" name="nome" placeholder="Como podemos chamar você?" autoComplete="name" required /><Field label="Seu e-mail" name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" required /></div><Field label="Assunto" name="titulo" placeholder="Ex.: Não consigo acessar o sistema" required /><label className="grid gap-2 text-sm font-medium">Prioridade<select name="prioridade" defaultValue="Media" className="input"><option value="Baixa">Baixa</option><option value="Media">Média</option><option value="Alta">Alta</option></select></label><label className="grid gap-2 text-sm font-medium">Descreva sua solicitação<textarea required name="descricao" rows={6} placeholder="Inclua detalhes, mensagens de erro e quando o problema começou." className="input resize-y py-3" /></label><button type="submit" disabled={sending} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0f6b2e] px-5 font-semibold text-white transition hover:bg-[#0b5223] disabled:cursor-not-allowed disabled:opacity-60">{sending && <LoaderCircle size={18} className="animate-spin" />}{sending ? "Enviando..." : "Enviar chamado"}</button></form></section><aside className="space-y-4"><div className="rounded-[24px] border border-[#dbe8de] bg-white p-5"><div className="flex items-center gap-2 text-sm font-semibold"><FileText size={17} className="text-[#23864a]" /> O que acontece depois?</div><div className="mt-5 space-y-4 text-sm text-[#607267]"><p><b className="text-[#315640]">1. Protocolo:</b> seu chamado é registrado imediatamente.</p><p><b className="text-[#315640]">2. Análise:</b> a equipe avalia o contexto e a prioridade.</p><p><b className="text-[#315640]">3. Atualização:</b> você acompanha tudo pelo e-mail.</p></div></div><div className="rounded-[24px] bg-[#eaf8ee] p-5 text-sm text-[#376447]"><div className="flex items-center gap-2 font-semibold text-[#1b6f38]"><ShieldCheck size={17} /> Dica para agilizar</div><p className="mt-2 leading-6">Inclua prints, mensagens de erro e o horário em que o problema aconteceu.</p></div></aside></div></div>
    </main>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<input {...props} className="input" /></label>;
}
