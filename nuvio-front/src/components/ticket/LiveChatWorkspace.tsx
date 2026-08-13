"use client";

import { FormEvent, useMemo, useState } from "react";
import { Archive, Bell, Check, LifeBuoy, Menu, MoreHorizontal, Paperclip, Search, Send, Smile, Video, X } from "lucide-react";

type Message = { id: number; text: string; mine?: boolean; time: string };
type Conversation = { id: number; name: string; initials: string; preview: string; time: string; unread?: number; online?: boolean; color: string };

const conversations: Conversation[] = [
  { id: 1, name: "Mariana Costa", initials: "MC", preview: "Preciso de ajuda com meu acesso", time: "Agora", unread: 2, online: true, color: "#e9b79d" },
  { id: 2, name: "Rafael Oliveira", initials: "RO", preview: "Obrigado pelo retorno!", time: "10:42", online: true, color: "#8cb4d9" },
  { id: 3, name: "Ana Paula Mendes", initials: "AP", preview: "Enviei o comprovante no chamado", time: "09:18", color: "#d3a6c9" },
  { id: 4, name: "Lucas Martins", initials: "LM", preview: "O problema continua acontecendo", time: "Ontem", color: "#8fc5af" },
  { id: 5, name: "Beatriz Lima", initials: "BL", preview: "Certo, vou aguardar", time: "Ontem", color: "#dbbd85" },
];

const initialMessages: Message[] = [
  { id: 1, text: "Olá, Mariana! Sou a Camila, da equipe Nuvio. Como posso ajudar?", time: "15:31" },
  { id: 2, text: "Oi, Camila! Não estou conseguindo acessar o painel desde hoje cedo.", mine: true, time: "15:32" },
  { id: 3, text: "Entendi. Vou verificar seu acesso agora. Você consegue me confirmar o e-mail cadastrado?", time: "15:33" },
  { id: 4, text: "mariana.costa@technova.com", mine: true, time: "15:34" },
  { id: 5, text: "Perfeito, encontrei sua conta. Estou atualizando a permissão — pode tentar entrar novamente em alguns segundos?", time: "15:35" },
];

export function LiveChatWorkspace() {
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [mobileList, setMobileList] = useState(false);
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const filtered = useMemo(() => conversations.filter((conversation) => `${conversation.name} ${conversation.preview}`.toLowerCase().includes(search.toLowerCase())), [search]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setMessages((current) => [...current, { id: Date.now(), text: message.trim(), mine: true, time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()) }]);
    setMessage("");
  }

  return (
    <div className="relative min-h-[calc(100vh-3rem)] overflow-hidden rounded-[28px] bg-[#0a1b12] p-3 text-white shadow-[0_20px_70px_rgba(10,63,31,.2)] sm:p-5 lg:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#72d98b33_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="relative flex min-h-[calc(100vh-7rem)] overflow-hidden rounded-[22px] border border-white/10 bg-[#10251a]">
        <aside className="hidden w-[68px] shrink-0 flex-col items-center justify-between border-r border-white/10 bg-[#0b1c13] py-5 md:flex"><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#2fae5a] text-lg font-bold shadow-lg shadow-[#2fae5a]/20">N</span><div className="flex flex-col items-center gap-5 text-white/45"><RailButton icon={<LifeBuoy size={19} />} active /><RailButton icon={<Bell size={19} />} /><RailButton icon={<Archive size={19} />} /></div><span className="grid h-9 w-9 place-items-center rounded-full bg-[#d9ad84] text-xs font-bold text-[#3d251b]">CA</span></aside>
        <aside className={`${mobileList ? "flex" : "hidden"} absolute inset-y-0 left-0 z-20 w-[min(88vw,300px)] flex-col border-r border-white/10 bg-[#12291c] md:relative md:flex md:w-[280px]`}><div className="flex items-center justify-between px-5 pb-4 pt-6"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#78d992]">Atendimento</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Conversas</h1></div><button onClick={() => setMobileList(false)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 md:hidden" aria-label="Fechar conversas"><X size={18} /></button></div><div className="px-4"><div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0d2117] px-3 py-2.5 text-white/45"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" /></div></div><div className="mt-6 flex items-center justify-between px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white/40"><span>Em atendimento</span><span className="rounded-full bg-[#2fae5a]/20 px-2 py-1 text-[#8ae8a0]">{filtered.length}</span></div><div className="mt-2 flex-1 overflow-y-auto px-3 pb-4">{filtered.map((conversation) => <button key={conversation.id} onClick={() => { setSelectedId(conversation.id); setMobileList(false); }} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedId === conversation.id ? "bg-[#2fae5a] text-white shadow-lg shadow-[#2fae5a]/15" : "text-white/75 hover:bg-white/5"}`}><Avatar conversation={conversation} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm font-semibold">{conversation.name}</strong><small className={`${selectedId === conversation.id ? "text-white/70" : "text-white/35"}`}>{conversation.time}</small></span><span className={`mt-1 block truncate text-xs ${selectedId === conversation.id ? "text-white/75" : "text-white/40"}`}>{conversation.preview}</span></span>{conversation.unread && selectedId !== conversation.id ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#68dd82] px-1 text-[10px] font-bold text-[#0c3119]">{conversation.unread}</span> : null}</button>)}</div><div className="border-t border-white/10 px-4 py-4"><div className="flex items-center gap-2 text-xs text-white/45"><span className="h-2 w-2 rounded-full bg-[#73e891]" /> 4 agentes online</div></div></aside>
        <section className="flex min-w-0 flex-1 flex-col bg-[#173020] [background-image:radial-gradient(ellipse_at_top_right,#2fae5a17,transparent_48%)]"><header className="flex items-center justify-between border-b border-white/10 bg-[#183a24]/90 px-4 py-4 backdrop-blur sm:px-7"><div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileList(true)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 md:hidden" aria-label="Abrir conversas"><Menu size={20} /></button><Avatar conversation={selected} large /><div className="min-w-0"><h2 className="truncate font-semibold">{selected.name}</h2><p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50"><span className="h-2 w-2 rounded-full bg-[#73e891]" /> Online agora</p></div></div><div className="flex items-center gap-1 text-white/50"><button className="rounded-xl p-2.5 hover:bg-white/10" aria-label="Iniciar chamada"><Video size={18} /></button><button className="rounded-xl p-2.5 hover:bg-white/10" aria-label="Mais opções"><MoreHorizontal size={19} /></button></div></header><div className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-xs text-white/40 sm:px-7"><span>Hoje, 13 de agosto</span><span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#73e891]" /> SLA dentro do prazo</span></div><div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8">{messages.map((item) => <div key={item.id} className={`flex items-end gap-2.5 ${item.mine ? "justify-end" : "justify-start"}`}>{!item.mine && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#2fae5a] text-[10px] font-bold text-white">CN</div>}<div className={`max-w-[min(78%,520px)] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-lg ${item.mine ? "rounded-br-md bg-[#bdeec8] text-[#183a24]" : "rounded-bl-md border border-white/5 bg-[#23472d] text-white/85"}`}><p>{item.text}</p><span className={`mt-1.5 block text-[10px] ${item.mine ? "text-[#427053]" : "text-white/35"}`}>{item.time}{item.mine ? " · Enviado" : ""}</span></div>{item.mine && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9ad84] text-[10px] font-bold text-[#3d251b]">MC</div>}</div>)}<div className="flex items-center gap-2 text-xs text-white/35"><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#73e891]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#73e891] [animation-delay:120ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#73e891] [animation-delay:240ms]" /></span> Camila está digitando...</div></div><form onSubmit={submit} className="border-t border-white/10 bg-[#12291c]/90 p-4 backdrop-blur sm:px-7 sm:py-5"><div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d2117] p-2"><button type="button" className="rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white" aria-label="Adicionar anexo"><Paperclip size={19} /></button><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escrever uma mensagem..." className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/30" /><button type="button" className="hidden rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white sm:block" aria-label="Adicionar emoji"><Smile size={19} /></button><button type="submit" disabled={!message.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2fae5a] text-white transition hover:bg-[#3dc96a] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enviar mensagem"><Send size={17} /></button></div><p className="mt-2 hidden text-[10px] text-white/25 sm:block">Enter para enviar · Atendimento protegido pela Nuvio</p></form></section>
      </div>
    </div>
  );
}

function RailButton({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) { return <button className={`grid h-10 w-10 place-items-center rounded-xl transition ${active ? "bg-[#2fae5a] text-white shadow-lg shadow-[#2fae5a]/20" : "hover:bg-white/10"}`}>{icon}</button>; }

function Avatar({ conversation, large = false }: { conversation: Conversation; large?: boolean }) { return <span className={`relative grid shrink-0 place-items-center rounded-full font-semibold text-[#173020] ${large ? "h-11 w-11 text-xs" : "h-10 w-10 text-[11px]"}`} style={{ backgroundColor: conversation.color }}>{conversation.initials}<span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#12291c] ${conversation.online ? "bg-[#73e891]" : "bg-white/30"}`} /></span>; }
