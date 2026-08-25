"use client";

import { FormEvent, useEffect, useRef, useMemo, useState } from "react";
import {
  Bold,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Link2,
  List,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Smile,
  Star,
  X,
  Menu,
  ChevronDown,
} from "lucide-react";

/* ─── types ─────────────────────────────────────────────── */
type Message = {
  id: number;
  text: string;
  mine?: boolean;
  time: string;
  date?: string;
  status?: "sent" | "delivered" | "read";
};

type Conversation = {
  id: number;
  name: string;
  initials: string;
  email: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
  color: string;
};

/* ─── data ───────────────────────────────────────────────── */
const conversations: Conversation[] = [
  { id: 1, name: "Mariana Costa",   initials: "MC", email: "mariana.costa@technova.com", preview: "Preciso de ajuda com meu acesso",     time: "2m atrás",  unread: 2, online: true,  color: "#e9b79d" },
  { id: 2, name: "Rafael Oliveira", initials: "RO", email: "rafael.o@email.com",          preview: "Obrigado pelo retorno!",              time: "5m atrás",  online: true,  color: "#8cb4d9" },
  { id: 3, name: "Ana Paula Mendes",initials: "AP", email: "anapaula@empresa.com",         preview: "Enviei o comprovante no chamado",    time: "10m atrás", color: "#d3a6c9" },
  { id: 4, name: "Lucas Martins",   initials: "LM", email: "lucas.m@corp.com",             preview: "O problema continua acontecendo",   time: "1h atrás",  color: "#8fc5af" },
  { id: 5, name: "Beatriz Lima",    initials: "BL", email: "beatriz.lima@mail.com",        preview: "Certo, vou aguardar",               time: "2h atrás",  color: "#dbbd85" },
  { id: 6, name: "Carlos Andrade",  initials: "CA", email: "candrade@empresa.com",         preview: "Quando estará disponível?",         time: "3h atrás",  color: "#a5c8f0" },
  { id: 7, name: "Fernanda Torres", initials: "FT", email: "fernanda.t@corp.com",          preview: "Consegui resolver, obrigada!",      time: "Ontem",     color: "#f0b8c8" },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Olá, Mariana! Sou a Camila, da equipe Nuvio. Como posso ajudar?", time: "15:31", date: "Hoje, 13 de agosto" },
    { id: 2, text: "Oi, Camila! Não estou conseguindo acessar o painel desde hoje cedo.", mine: true, time: "15:32", status: "read" },
    { id: 3, text: "Entendi. Vou verificar seu acesso agora. Você consegue me confirmar o e-mail cadastrado?", time: "15:33" },
    { id: 4, text: "mariana.costa@technova.com", mine: true, time: "15:34", status: "read" },
    { id: 5, text: "Perfeito, encontrei sua conta. Estou atualizando a permissão — pode tentar entrar novamente em alguns segundos?", time: "15:35" },
  ],
  2: [
    { id: 1, text: "Obrigado pelo retorno, Rafael!", time: "10:40", date: "Hoje" },
    { id: 2, text: "Qualquer coisa é só falar!", mine: true, time: "10:42", status: "delivered" },
  ],
};

/* ─── component ─────────────────────────────────────────── */
export function LiveChatWorkspace({ fullscreen = false }: { fullscreen?: boolean } = {}) {
  const [selectedId, setSelectedId]   = useState(1);
  const [search, setSearch]           = useState("");
  const [message, setMessage]         = useState("");
  const [allMessages, setAllMessages] = useState<Record<number, Message[]>>(initialMessages);
  const [mobileList, setMobileList]   = useState(false);
  const [typing, setTyping]           = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected  = conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const messages  = useMemo(() => allMessages[selectedId] ?? [], [allMessages, selectedId]);
  const filtered  = useMemo(
    () => conversations.filter((c) =>
      `${c.name} ${c.preview}`.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    const now = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setAllMessages((prev) => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] ?? []),
        { id: Date.now(), text: message.trim(), mine: true, time: now, status: "sent" },
      ],
    }));
    setMessage("");
    setTyping(true);
    setTimeout(() => setTyping(false), 2500);
  }

  return (
    <div
      className={
        fullscreen
          ? "flex h-full min-h-0 w-full overflow-hidden bg-(--card)"
          : "flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm"
      }
    >

      {/* ── PAINEL 1: lista de conversas ─────────────────── */}
      <aside className={`
        ${mobileList ? "flex" : "hidden"}
        absolute inset-y-0 left-0 z-20 w-[min(88vw,320px)]
        shrink-0 flex-col border-r border-(--border) bg-(--card)
        md:relative md:flex md:w-72
      `}>
        {/* header */}
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-(--foreground)">Todos</span>
            <ChevronDown size={14} className="text-(--muted-foreground)" />
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--hoverbg) cursor-pointer" aria-label="Pesquisar">
              <Search size={16} />
            </button>
            <button className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--hoverbg) cursor-pointer" aria-label="Mais opções">
              <MoreHorizontal size={16} />
            </button>
            <button onClick={() => setMobileList(false)} className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--hoverbg) md:hidden cursor-pointer" aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* busca */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-(--muted-foreground)">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="min-w-0 flex-1 bg-transparent text-sm text-(--foreground) outline-none placeholder:text-(--muted-foreground)"
            />
          </div>
        </div>

        {/* lista */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { setSelectedId(conv.id); setMobileList(false); }}
              className={`flex w-full items-center gap-3 border-b border-(--border)/50 px-4 py-3.5 text-left transition cursor-pointer
                ${selectedId === conv.id ? "bg-(--primary)/8 border-l-2 border-l-(--primary)" : "hover:bg-(--hoverbg)"}`}
            >
              <AvatarDot conv={conv} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-1">
                  <strong className={`truncate text-sm ${selectedId === conv.id ? "text-(--primary)" : "text-(--foreground)"}`}>
                    {conv.name}
                  </strong>
                  <small className="shrink-0 text-[11px] text-(--muted-foreground)">{conv.time}</small>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-1">
                  <span className="truncate text-xs text-(--muted-foreground)">{conv.preview}</span>
                  {conv.unread && selectedId !== conv.id ? (
                    <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-(--primary) px-1 text-[9px] font-bold text-white">
                      {conv.unread}
                    </span>
                  ) : (
                    <CheckCheck size={12} className="shrink-0 text-(--primary)" />
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── PAINEL 3: chat ───────────────────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-(--background)">

        {/* header do chat */}
        <header className="flex items-center justify-between border-b border-(--border) bg-(--card) px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileList(true)}
              className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--hoverbg) md:hidden cursor-pointer"
              aria-label="Abrir lista"
            >
              <Menu size={20} />
            </button>
            <AvatarDot conv={selected} large />
            <div>
              <h2 className="text-sm font-semibold text-(--foreground)">{selected.name}</h2>
              <p className="text-xs text-(--muted-foreground)">{selected.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-(--muted-foreground)">
            <button className="rounded-xl p-2 hover:bg-(--hoverbg) cursor-pointer" aria-label="Pesquisar"><Search size={17} /></button>
            <button className="rounded-xl p-2 hover:bg-(--hoverbg) cursor-pointer" aria-label="Favoritar"><Star size={17} /></button>
            <button className="rounded-xl p-2 hover:bg-(--hoverbg) cursor-pointer" aria-label="Mais opções"><MoreHorizontal size={18} /></button>
          </div>
        </header>

        {/* mensagens */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-1">
          {messages.map((msg, i) => {
            const showDate = msg.date && (i === 0 || messages[i - 1]?.date !== msg.date);
            const showAvatar = !msg.mine && (i === 0 || messages[i - 1]?.mine);
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-(--border)" />
                    <span className="text-xs text-(--muted-foreground)">{msg.date}</span>
                    <div className="h-px flex-1 bg-(--border)" />
                  </div>
                )}
                <div className={`flex items-end gap-2.5 ${msg.mine ? "justify-end" : "justify-start"}`}>
                  {!msg.mine && (
                    <div className={`${showAvatar ? "opacity-100" : "opacity-0"} grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-[10px] font-bold text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/30`}>
                      {selected.initials}
                    </div>
                  )}
                  <div className="max-w-[min(72%,480px)]">
                    {!msg.mine && showAvatar && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{selected.name}</p>
                        <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          Cliente
                        </span>
                      </div>
                    )}
                    {msg.mine && i === 0 || (msg.mine && !messages[i - 1]?.mine) ? (
                      <div className="mb-1 flex items-center justify-end gap-1.5">
                        <span className="rounded-full bg-(--primary)/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-(--primary)">
                          Equipe
                        </span>
                        <p className="text-xs font-semibold text-(--primary)">Camila Nuvio</p>
                      </div>
                    ) : null}
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                      ${msg.mine
                        ? "rounded-br-sm bg-(--primary) text-white"
                        : "rounded-bl-sm border border-(--border) bg-(--card) text-(--foreground)"
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <div className={`mt-1 flex items-center gap-1 text-[10px] text-(--muted-foreground) ${msg.mine ? "justify-end" : "justify-start"}`}>
                      <span>{msg.time}</span>
                      {msg.mine && msg.status === "read" && <CheckCheck size={11} className="text-(--primary)" />}
                      {msg.mine && msg.status === "delivered" && <CheckCheck size={11} />}
                    </div>
                  </div>
                  {msg.mine && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-(--primary) text-[10px] font-bold text-white ring-2 ring-(--primary)/30">
                      CN
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* typing indicator */}
          {typing && (
            <div className="flex items-end gap-2.5 mt-1">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-[10px] font-bold text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/30">
                {selected.initials}
              </div>
              <div className="rounded-2xl rounded-bl-sm border border-(--border) bg-(--card) px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--muted-foreground)" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--muted-foreground) [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--muted-foreground) [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
            </div>
          </div>
        </div>

        {/* input */}
        <div className="border-t border-(--border) bg-(--card) px-5 py-4">
          <form onSubmit={submit}>
            <div className="rounded-2xl border border-(--border) bg-(--background) focus-within:border-(--primary) focus-within:ring-2 focus-within:ring-(--primary)/20 transition">
              <div className="flex items-center gap-2 px-4 py-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escrever uma mensagem..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-(--foreground) outline-none placeholder:text-(--muted-foreground)"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--hoverbg) hover:text-(--foreground) transition cursor-pointer"
                  aria-label="Emoji"
                >
                  <Smile size={18} />
                </button>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-(--primary) text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  aria-label="Enviar"
                >
                  <Send size={15} />
                </button>
              </div>

              {/* toolbar */}
              <div className="flex items-center gap-0.5 border-t border-(--border) px-3 py-2">
                <ToolbarBtn icon={<Bold size={14} />}      label="Negrito" />
                <ToolbarBtn icon={<List size={14} />}      label="Lista" />
                <ToolbarBtn icon={<Link2 size={14} />}     label="Link" />
                <ToolbarBtn icon={<Paperclip size={14} />} label="Anexo" />
                <ToolbarBtn icon={<ImageIcon size={14} />} label="Imagem" />
                <ToolbarBtn icon={<FileText size={14} />}  label="Arquivo" />
              </div>
            </div>
          </form>
        </div>
        <footer className="border-t border-(--border) bg-(--card) px-5 py-1.5 text-center text-[11px] text-(--muted-foreground)">
          Página em teste
        </footer>
      </section>
    </div>
  );
}

/* ─── helpers ────────────────────────────────────────────── */
function AvatarDot({ conv, large = false }: { conv: Conversation; large?: boolean }) {
  return (
    <span className={`relative shrink-0 grid place-items-center rounded-full font-semibold
      ${large ? "h-9 w-9 text-[11px]" : "h-9 w-9 text-[11px]"}`}
      style={{ backgroundColor: conv.color, color: "#3d251b" }}
    >
      {conv.initials}
      {conv.online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-(--card) bg-emerald-500" />
      )}
    </span>
  );
}

function ToolbarBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--hoverbg) hover:text-(--foreground) transition cursor-pointer"
    >
      {icon}
    </button>
  );
}
