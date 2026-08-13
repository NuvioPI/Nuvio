"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Headphones, Info, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Message = { idRespostaTicket: number; msgTicket: string; dataResposta: string; autor: string };

export default function PublicChatPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [ticket, setTicket] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    if (!ticket || !email) return;
    const data = await apiFetch<{ mensagens: Message[] }>(`/public/chats/${ticket}?email=${encodeURIComponent(email)}`);
    setMessages(data.mensagens);
  }

  useEffect(() => {
    if (!ticket) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await apiFetch<{ mensagens: Message[] }>(`/public/chats/${ticket}?email=${encodeURIComponent(email)}`);
        if (!cancelled) setMessages(data.mensagens);
      } catch {
        // A indisponibilidade momentânea não interrompe a conversa.
      }
    };
    const initial = window.setTimeout(poll, 0);
    const timer = window.setInterval(poll, 8000);
    return () => { cancelled = true; window.clearTimeout(initial); window.clearInterval(timer); };
  }, [ticket, email]);

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      if (!ticket) {
        const result = await apiFetch<{ idTicket: number }>("/public/tickets", {
          method: "POST",
          body: JSON.stringify({ nome: name, email, titulo: "Atendimento via chat", descricao: text, prioridade: "Media", canal: "chat" }),
        });
        setTicket(result.idTicket);
        setMessages([{ idRespostaTicket: 0, msgTicket: text, dataResposta: new Date().toISOString(), autor: name }]);
      } else {
        await apiFetch(`/public/chats/${ticket}`, { method: "POST", body: JSON.stringify({ email, mensagem: text }) });
        await loadMessages();
      }
      setText("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível enviar a mensagem.");
    } finally {
      setBusy(false);
    }
  }

  const ready = name.trim() && email.trim();

  return (
    <main className="min-h-screen bg-[#f5f9f6] px-5 py-7 text-[#173020] sm:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/externo" className="inline-flex items-center gap-2 text-sm font-medium text-[#52705c] transition hover:text-[#0f6b2e]"><ArrowLeft size={17} /> Voltar para o portal</Link>
        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_310px] lg:items-start">
          <section className="overflow-hidden rounded-[28px] border border-[#dbe8de] bg-white shadow-[0_16px_50px_rgba(24,70,38,.07)]">
            <header className="flex items-center justify-between border-b border-[#e6eee8] px-5 py-4 sm:px-7 sm:py-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0f6b2e] text-white"><Headphones size={21} /></span><div><h1 className="font-semibold">Chat com o suporte</h1><p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#5d7464]"><span className="h-2 w-2 rounded-full bg-[#38ba5f]" /> Equipe online</p></div></div>{ticket && <span className="rounded-full bg-[#eaf8ee] px-3 py-1.5 text-xs font-semibold text-[#20783e]">Protocolo #{ticket}</span>}</header>
            {!ticket && <div className="border-b border-[#e6eee8] bg-[#fbfdfb] px-5 py-5 sm:px-7"><p className="mb-4 text-sm leading-6 text-[#597062]">Para começar, informe seus dados. Assim conseguimos identificar seu atendimento.</p><div className="grid gap-3 sm:grid-cols-2"><input value={name} onChange={(event) => setName(event.target.value)} className="input" placeholder="Seu nome" autoComplete="name" /><input value={email} onChange={(event) => setEmail(event.target.value)} className="input" type="email" placeholder="Seu e-mail" autoComplete="email" /></div></div>}
            <div aria-live="polite" className="h-[390px] space-y-4 overflow-y-auto bg-[#f9fcfa] p-5 sm:p-7">{messages.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf8ee] text-[#1e8241]"><Headphones size={22} /></span><p className="mt-4 text-sm font-medium text-[#496453]">Olá! Em que podemos ajudar?</p><p className="mt-1 text-xs text-[#7b8b80]">Nossa equipe está pronta para conversar.</p></div> : messages.map((message, index) => { const mine = message.autor === name || (index === 0 && message.idRespostaTicket === 0); return <div key={`${message.idRespostaTicket}-${index}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${mine ? "rounded-br-sm bg-[#0f6b2e] text-white" : "rounded-bl-sm bg-white text-[#263d2d] shadow-sm"}`}><p className="whitespace-pre-wrap leading-6">{message.msgTicket}</p><span className={`mt-1.5 block text-[10px] ${mine ? "text-white/60" : "text-[#7a8d80]"}`}>{mine ? "Você" : message.autor}</span></div></div>})}<div ref={end} /></div>
            {error && <p role="alert" className="px-5 pt-3 text-sm text-red-700 sm:px-7">{error}</p>}
            <form onSubmit={send} className="flex gap-3 border-t border-[#e6eee8] p-4 sm:p-5"><input value={text} onChange={(event) => setText(event.target.value)} disabled={Boolean(!ticket && !ready) || busy} className="input flex-1" placeholder={ticket ? "Digite sua mensagem..." : "Preencha seus dados para começar"} /><button type="submit" aria-label="Enviar mensagem" disabled={busy || !text.trim() || Boolean(!ticket && !ready)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0f6b2e] text-white transition hover:bg-[#0b5223] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle size={19} className="animate-spin" /> : <Send size={18} />}</button></form>
          </section>
          <aside className="space-y-4"><div className="rounded-[24px] border border-[#dbe8de] bg-white p-5"><p className="flex items-center gap-2 text-sm font-semibold"><Info size={17} className="text-[#23864a]" /> Como funciona</p><ol className="mt-5 space-y-4 text-sm text-[#607267]"><li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eaf8ee] text-xs font-bold text-[#23864a]">1</span><span>Informe seu nome e e-mail.</span></li><li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eaf8ee] text-xs font-bold text-[#23864a]">2</span><span>Conte o que aconteceu para nossa equipe.</span></li><li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#eaf8ee] text-xs font-bold text-[#23864a]">3</span><span>Guarde o protocolo para acompanhar o caso.</span></li></ol></div><div className="rounded-[24px] bg-[#eaf8ee] p-5 text-sm text-[#376447]"><div className="flex items-center gap-2 font-semibold text-[#1b6f38]"><ShieldCheck size={17} /> Seus dados estão protegidos</div><p className="mt-2 leading-6">Usamos seu e-mail apenas para manter você informado sobre o atendimento.</p><div className="mt-4 flex items-center gap-2 text-xs text-[#5a8064]"><CheckCircle2 size={15} /> Atendimento seguro</div></div></aside>
        </div>
      </div>
    </main>
  );
}
