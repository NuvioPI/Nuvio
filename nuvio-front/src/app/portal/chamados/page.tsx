"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, FileText, LogOut, MessageSquareText, Plus, Search, Send, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Ticket = { idTicket: number; titulo: string; descricao: string; statusTicket: string; prioridade: string; dataAbertura: string; nomeCategoria?: string };
type Message = { idRespostaTicket: number; msgTicket: string; dataResposta: string; nomeUsuario?: string; autor?: string };

const statusStyles: Record<string, string> = { Aberto: "bg-sky-50 text-sky-700", "Em atendimento": "bg-amber-50 text-amber-700", Resolvido: "bg-emerald-50 text-emerald-700", Fechado: "bg-slate-100 text-slate-600" };

export default function PortalChamadosPage() {
  const { usuario, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newOpen, setNewOpen] = useState(() => typeof window !== "undefined" && Boolean(new URLSearchParams(window.location.search).get("novo")));
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Media");
  const [newDescription, setNewDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState("");

  async function loadTickets(selectFirst = false) {
    try {
      const data = await apiFetch<{ tickets: Ticket[] }>("/portal/tickets");
      setTickets(data.tickets);
      if (selectFirst && data.tickets[0]) setSelectedId(data.tickets[0].idTicket);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar seus chamados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = window.setTimeout(() => loadTickets(true), 0);
    return () => window.clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      const clear = window.setTimeout(() => setMessages([]), 0);
      return () => window.clearTimeout(clear);
    }
    let cancelled = false;
    apiFetch<{ mensagens: Message[] }>(`/portal/tickets/${selectedId}/mensagens`).then((data) => { if (!cancelled) setMessages(data.mensagens); }).catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.titulo} ${ticket.nomeCategoria ?? ""} #${ticket.idTicket}`.toLowerCase().includes(search.toLowerCase())), [tickets, search]);
  const selected = tickets.find((ticket) => ticket.idTicket === selectedId) ?? null;
  const countOpen = tickets.filter((ticket) => ["Aberto", "Em atendimento"].includes(ticket.statusTicket)).length;
  const countResolved = tickets.filter((ticket) => ["Resolvido", "Fechado"].includes(ticket.statusTicket)).length;

  async function createTicket(event: FormEvent) {
    event.preventDefault();
    setSending(true); setError("");
    try {
      const data = await apiFetch<{ idTicket: number }>("/portal/tickets", { method: "POST", body: JSON.stringify({ titulo: newTitle, prioridade: newPriority, descricao: newDescription }) });
      setNewOpen(false); setNewTitle(""); setNewDescription(""); setNewPriority("Media"); await loadTickets(); setSelectedId(data.idTicket);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível abrir o chamado."); }
    finally { setSending(false); }
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault(); if (!selectedId || !reply.trim()) return;
    setSending(true);
    try { await apiFetch(`/portal/tickets/${selectedId}/mensagens`, { method: "POST", body: JSON.stringify({ mensagem: reply }) }); setReply(""); const data = await apiFetch<{ mensagens: Message[] }>(`/portal/tickets/${selectedId}/mensagens`); setMessages(data.mensagens); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar a mensagem."); }
    finally { setSending(false); }
  }

  return <main className="min-h-screen bg-[#f5f9f6] text-[#173020]"><header className="border-b border-[#dce8df] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><Link href="/portal" className="flex items-center gap-3 text-[#0f6b2e]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f6b2e] font-bold text-white">N</span><span className="text-lg font-bold tracking-tight">nuvio</span></Link><div className="flex items-center gap-4"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{usuario?.nome || "Cliente"}</p><p className="text-xs text-[#718177]">Área do cliente</p></div><button onClick={() => logout("/portal/login")} className="inline-flex items-center gap-2 rounded-xl border border-[#dce8df] px-3 py-2 text-sm font-medium text-[#587062] transition hover:border-[#a7cfb0] hover:text-[#0f6b2e]"><LogOut size={16} /> <span className="hidden sm:inline">Sair</span></button></div></div></header><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10"><Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-[#52705c] hover:text-[#0f6b2e]"><ArrowLeft size={17} /> Portal de atendimento</Link><div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2b9050]">Minha central</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Olá, {usuario?.nome?.split(" ")[0] || "cliente"}.</h1><p className="mt-2 text-[#687a6d]">Acompanhe seus chamados e converse com a equipe.</p></div><button onClick={() => setNewOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f6b2e] px-4 font-semibold text-white shadow-lg shadow-[#0f6b2e]/15 transition hover:bg-[#0b5223]"><Plus size={18} /> Novo chamado</button></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><Stat icon={<FileText size={20} />} label="Total de chamados" value={tickets.length} /><Stat icon={<Clock3 size={20} />} label="Em andamento" value={countOpen} tone="green" /><Stat icon={<CheckCircle2 size={20} />} label="Resolvidos" value={countResolved} tone="slate" /></div><div className="mt-8 grid gap-6 lg:grid-cols-[.94fr_1.06fr]"><section className="rounded-[26px] border border-[#dbe8de] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#e7eee8] p-5"><div><h2 className="font-semibold">Seus chamados</h2><p className="mt-1 text-xs text-[#718177]">{tickets.length} registros encontrados</p></div><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829286]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar" className="w-32 rounded-lg border border-[#dce8df] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#6fbb81] sm:w-44" /></div></div><div className="max-h-[570px] overflow-y-auto p-3">{loading ? <p className="p-8 text-center text-sm text-[#718177]">Carregando chamados...</p> : error && !tickets.length ? <p className="p-8 text-center text-sm text-red-700">{error}</p> : filtered.length === 0 ? <div className="p-8 text-center"><FileText className="mx-auto text-[#a1b3a5]" size={27} /><p className="mt-3 text-sm font-medium">Você ainda não tem chamados</p><p className="mt-1 text-xs text-[#718177]">Abra um chamado para começar o acompanhamento.</p></div> : filtered.map((ticket) => <button key={ticket.idTicket} onClick={() => setSelectedId(ticket.idTicket)} className={`w-full rounded-2xl p-4 text-left transition ${selectedId === ticket.idTicket ? "bg-[#eaf8ee] ring-1 ring-[#b7ddc0]" : "hover:bg-[#f7faf7]"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{ticket.titulo}</p><p className="mt-1 text-xs text-[#718177]">#{ticket.idTicket} · {ticket.nomeCategoria || "Atendimento"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[ticket.statusTicket] || "bg-slate-100 text-slate-600"}`}>{ticket.statusTicket}</span></div><div className="mt-3 flex items-center justify-between text-xs text-[#718177]"><span>Prioridade {ticket.prioridade}</span><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(ticket.dataAbertura))}</span></div></button>)}</div></section><section className="flex min-h-[520px] flex-col rounded-[26px] border border-[#dbe8de] bg-white shadow-sm"><div className="border-b border-[#e7eee8] p-5">{selected ? <><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2b9050]">Protocolo #{selected.idTicket}</p><h2 className="mt-1 text-xl font-semibold">{selected.titulo}</h2></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[selected.statusTicket] || "bg-slate-100 text-slate-600"}`}>{selected.statusTicket}</span></div><p className="mt-3 text-sm leading-6 text-[#687a6d]">{selected.descricao}</p></> : <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf8ee] text-[#258346]"><MessageSquareText size={20} /></span><div><h2 className="font-semibold">Acompanhamento</h2><p className="mt-1 text-xs text-[#718177]">Selecione um chamado para ver as mensagens.</p></div></div>}</div>{selected ? <><div className="flex-1 space-y-4 overflow-y-auto bg-[#fbfdfb] p-5">{messages.length === 0 ? <p className="py-16 text-center text-sm text-[#718177]">Nenhuma atualização ainda.</p> : messages.map((message) => <div key={message.idRespostaTicket} className="rounded-2xl border border-[#e5eee7] bg-white p-4"><p className="whitespace-pre-wrap text-sm leading-6">{message.msgTicket}</p><p className="mt-2 text-[11px] text-[#829286]">{message.nomeUsuario || message.autor || "Equipe Nuvio"} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(message.dataResposta))}</p></div>)}</div><form onSubmit={sendReply} className="flex gap-3 border-t border-[#e7eee8] p-4"><input value={reply} onChange={(event) => setReply(event.target.value)} disabled={selected.statusTicket === "Fechado" || sending} className="input flex-1" placeholder={selected.statusTicket === "Fechado" ? "Este chamado está fechado" : "Adicionar uma mensagem..."} /><button disabled={!reply.trim() || sending || selected.statusTicket === "Fechado"} className="grid h-11 w-11 place-items-center rounded-xl bg-[#0f6b2e] text-white disabled:opacity-50"><Send size={17} /></button></form></> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[#718177]"><MessageSquareText size={30} className="text-[#a1b3a5]" /><p className="mt-3 text-sm">O histórico do chamado aparecerá aqui.</p></div>}</section></div></div>{newOpen && <NewTicketModal title={newTitle} priority={newPriority} description={newDescription} loading={sending} setTitle={setNewTitle} setPriority={setNewPriority} setDescription={setNewDescription} onClose={() => setNewOpen(false)} onSubmit={createTicket} />}</main>;
}

function Stat({ icon, label, value, tone = "green" }: { icon: React.ReactNode; label: string; value: number; tone?: "green" | "slate" }) { return <div className="rounded-2xl border border-[#dbe8de] bg-white p-5 shadow-sm"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tone === "slate" ? "bg-slate-100 text-slate-600" : "bg-[#eaf8ee] text-[#23864a]"}`}>{icon}</div><p className="mt-4 text-sm text-[#718177]">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p></div>; }

function NewTicketModal({ title, priority, description, loading, setTitle, setPriority, setDescription, onClose, onSubmit }: { title: string; priority: string; description: string; loading: boolean; setTitle: (value: string) => void; setPriority: (value: string) => void; setDescription: (value: string) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173020]/35 p-5 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[26px] border border-[#dbe8de] bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2b9050]">Novo atendimento</p><h2 className="mt-2 text-2xl font-semibold">Abrir chamado</h2></div><button onClick={onClose} className="rounded-lg p-2 text-[#718177] hover:bg-[#f0f6f1]" aria-label="Fechar"><X size={19} /></button></div><form onSubmit={onSubmit} className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-medium">Assunto<input required value={title} onChange={(event) => setTitle(event.target.value)} className="input" placeholder="Ex.: Não consigo acessar o sistema" /></label><label className="grid gap-2 text-sm font-medium">Prioridade<select value={priority} onChange={(event) => setPriority(event.target.value)} className="input"><option value="Baixa">Baixa</option><option value="Media">Média</option><option value="Alta">Alta</option></select></label><label className="grid gap-2 text-sm font-medium">Descrição<textarea required value={description} onChange={(event) => setDescription(event.target.value)} className="input min-h-32 resize-y" placeholder="Explique o que aconteceu..." /></label><button disabled={loading} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f6b2e] font-semibold text-white disabled:opacity-60">{loading ? "Abrindo chamado..." : "Criar chamado"}</button></form></div></div>; }
