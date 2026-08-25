"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatarDataBackend } from "@/lib/date-utils";

type ChatProps = { ticketId?: number; publicMode?: boolean };

export function Chat({ ticketId, publicMode = false }: ChatProps) {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const refScroll = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // carregar histórico quando existir endpoint
  }, [ticketId]);

  useEffect(() => {
    // rolar para baixo quando mensagens mudam
    if (refScroll.current) {
      refScroll.current.scrollTop = refScroll.current.scrollHeight;
    }
  }, [mensagens]);

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      if (ticketId) {
        await apiFetch<any>("/respostas", {
          method: "POST",
          body: JSON.stringify({ idTicket: ticketId, idUsuario: null, msgTicket: texto }),
        });
      }

      const nova = { id: Date.now(), texto, autor: publicMode ? (nome || 'Cliente') : 'Você', data: new Date().toISOString() };
      setMensagens((s) => [...s, nova]);
      setTexto("");
    } catch (err) {
      console.warn('Erro enviar mensagem', err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-(--muted) p-4 rounded">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#0f6b2e] text-white flex items-center justify-center font-semibold">S</div>
        <div>
          <div className="font-medium">Suporte</div>
          <div className="text-xs text-(--muted-foreground)">Atendimento ao cliente</div>
        </div>
      </div>

      {publicMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="p-2 rounded border" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu email" className="p-2 rounded border" />
        </div>
      )}

      <div ref={refScroll} className="flex-1 overflow-auto p-3 space-y-3 bg-(--card) rounded">
        {mensagens.length === 0 && <div className="text-sm text-(--muted-foreground)">Sem mensagens — comece a conversar.</div>}
        {mensagens.map((m) => (
          <div key={m.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-(--muted) flex items-center justify-center text-xs">{(m.autor || '').charAt(0)}</div>
            <div>
              <div className="text-sm font-semibold">{m.autor}</div>
              <div className="mt-1 p-2 bg-white rounded shadow-sm max-w-[36rem]">{m.texto || m.msgTicket}</div>
              <div className="text-xs text-(--muted-foreground) mt-1">{formatarDataBackend(m.data)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 rounded border px-3 py-2" />
        <button onClick={enviar} disabled={enviando} className="px-4 py-2 bg-[#0f6b2e] text-white rounded">{enviando ? 'Enviando...' : 'Enviar'}</button>
      </div>
    </div>
  );
}
