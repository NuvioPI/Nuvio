"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function Chat({ ticketId }: { ticketId?: number }) {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // placeholder: no backend real de chat exposto, usamos respostas como fallback
    async function carregar() {
      // se quiser, buscar histórico via API quando disponível
    }
    carregar();
  }, [ticketId]);

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      // fallback: criar uma resposta de ticket (útil para registro)
      if (ticketId) {
        await apiFetch<any>("/respostas", {
          method: "POST",
          body: JSON.stringify({ idTicket: ticketId, idUsuario: null, msgTicket: texto }),
        });
      }
      const nova = { id: Date.now(), texto, autor: 'Você', data: new Date().toISOString() };
      setMensagens((s) => [...s, nova]);
      setTexto("");
    } catch (err) {
      console.warn('Erro enviar mensagem', err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-(--muted) rounded"> 
        {mensagens.length === 0 && <div className="text-sm text-(--muted-foreground)">Nenhuma mensagem ainda.</div>}
        {mensagens.map((m) => (
          <div key={m.id} className="p-2 rounded bg-(--card)">
            <div className="text-sm font-medium">{m.autor}</div>
            <div className="text-sm">{m.texto || m.msgTicket}</div>
            <div className="text-xs text-(--muted-foreground)">{new Date(m.data).toLocaleString()}</div>
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
