"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardPlus, LoaderCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function PublicTicketPage() {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await apiFetch<{ idTicket: number }>("/public/tickets", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data)),
      });
      setSuccess(response.idTicket);
      event.currentTarget.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar seu chamado."); }
    finally { setSending(false); }
  }

  return (
    <main className="min-h-screen bg-[#f6faf7] px-5 py-8 text-[#173020] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/externo" className="inline-flex items-center gap-2 text-sm font-medium text-[#52705c] hover:text-[#0f6b2e]"><ArrowLeft size={17} /> Voltar para atendimento</Link>
        <div className="mt-8 rounded-[30px] border border-[#dbe8de] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ee] text-[#147538]"><ClipboardPlus size={24} /></div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Abrir um chamado</h1>
          <p className="mt-2 text-[#63766a]">Conte o que aconteceu. Enviaremos o número do protocolo para seu e-mail.</p>
          {success && <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#eaf8ee] p-4 text-[#176d36]"><CheckCircle2 className="mt-0.5 shrink-0" size={20} /><p><b>Chamado #{success} aberto!</b><br />Nossa equipe recebeu sua solicitação.</p></div>}
          {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={submit} className="mt-8 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Seu nome" name="nome" placeholder="Como podemos chamar você?" required /><Field label="Seu e-mail" name="email" type="email" placeholder="voce@empresa.com" required /></div>
            <Field label="Assunto" name="titulo" placeholder="Ex.: Não consigo acessar o sistema" required />
            <label className="grid gap-2 text-sm font-medium">Prioridade<select name="prioridade" defaultValue="Media" className="input"><option value="Baixa">Baixa</option><option value="Media">Média</option><option value="Alta">Alta</option></select></label>
            <label className="grid gap-2 text-sm font-medium">Descreva sua solicitação<textarea required name="descricao" rows={6} placeholder="Inclua detalhes, mensagens de erro e quando o problema começou." className="input resize-y py-3" /></label>
            <button disabled={sending} className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0f6b2e] px-5 font-semibold text-white transition hover:bg-[#0b5223] disabled:opacity-60">{sending && <LoaderCircle size={18} className="animate-spin" />}{sending ? "Enviando..." : "Abrir chamado"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<input {...props} className="input" /></label>;
}
