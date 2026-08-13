"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, Headphones, LoaderCircle, Send } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Message = { idRespostaTicket: number; msgTicket: string; dataResposta: string; autor: string };

export default function PublicChatPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [text, setText] = useState("");
  const [ticket, setTicket] = useState<number | null>(null); const [messages, setMessages] = useState<Message[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const load = async () => { if (!ticket || !email) return; const data = await apiFetch<{ mensagens: Message[] }>(`/public/chats/${ticket}?email=${encodeURIComponent(email)}`); setMessages(data.mensagens); };
  useEffect(() => { if (!ticket) return; load().catch(() => undefined); const timer = window.setInterval(() => load().catch(() => undefined), 8000); return () => window.clearInterval(timer); }, [ticket, email]);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function send(event: FormEvent) {
    event.preventDefault(); if (!text.trim()) return; setBusy(true); setError("");
    try {
      if (!ticket) {
        const result = await apiFetch<{ idTicket: number }>("/public/tickets", { method: "POST", body: JSON.stringify({ nome: name, email, titulo: "Atendimento via chat", descricao: text, prioridade: "Media" }) });
        setTicket(result.idTicket); setMessages([{ idRespostaTicket: 0, msgTicket: text, dataResposta: new Date().toISOString(), autor: name }]);
      } else {
        await apiFetch(`/public/chats/${ticket}`, { method: "POST", body: JSON.stringify({ email, mensagem: text }) }); await load();
      }
      setText("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar a mensagem."); }
    finally { setBusy(false); }
  }
  const ready = name.trim() && email.trim();
  return <main className="min-h-screen bg-[#f6faf7] px-5 py-8 text-[#173020] sm:px-8"><div className="mx-auto max-w-3xl"><Link href="/externo" className="inline-flex items-center gap-2 text-sm font-medium text-[#52705c] hover:text-[#0f6b2e]"><ArrowLeft size={17} /> Voltar para atendimento</Link><section className="mt-8 overflow-hidden rounded-[30px] border border-[#dbe8de] bg-white shadow-sm"><header className="flex items-center gap-3 border-b border-[#e5eee7] p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0f6b2e] text-white"><Headphones size={21} /></span><div><h1 className="font-semibold">Chat com o suporte</h1><p className="text-sm text-[#5b7463]"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#38ba5f]" />Equipe online</p></div></header>{!ticket && <div className="border-b bg-[#fbfdfb] p-5"><p className="mb-4 text-sm text-[#597062]">Antes de começar, informe seus dados para recebermos seu atendimento.</p><div className="grid gap-3 sm:grid-cols-2"><input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Seu nome" /><input value={email} onChange={e => setEmail(e.target.value)} className="input" type="email" placeholder="Seu e-mail" /></div></div>}<div className="h-[360px] space-y-4 overflow-y-auto bg-[#f9fcfa] p-5">{messages.length === 0 ? <div className="pt-24 text-center text-sm text-[#6a7b70]">Olá! Em que podemos ajudar?</div> : messages.map((message, index) => { const mine = message.autor === name || index === 0 && message.idRespostaTicket === 0; return <div key={`${message.idRespostaTicket}-${index}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${mine ? "rounded-br-sm bg-[#0f6b2e] text-white" : "rounded-bl-sm bg-white text-[#263d2d] shadow-sm"}`}><p>{message.msgTicket}</p><span className={`mt-1 block text-[10px] ${mine ? "text-white/65" : "text-[#7a8d80]"}`}>{mine ? "Você" : message.autor}</span></div></div>})}<div ref={end} /></div>{error && <p className="px-5 pt-3 text-sm text-red-700">{error}</p>}<form onSubmit={send} className="flex gap-3 border-t border-[#e5eee7] p-4"><input value={text} onChange={e => setText(e.target.value)} disabled={!ticket && !ready || busy} className="input flex-1" placeholder={ticket ? "Digite sua mensagem..." : "Informe seus dados para começar"} /><button disabled={busy || !text.trim() || (!ticket && !ready)} className="grid h-11 w-11 place-items-center rounded-xl bg-[#0f6b2e] text-white disabled:opacity-50">{busy ? <LoaderCircle size={19} className="animate-spin" /> : <Send size={18} />}</button></form></section></div></main>;
}
