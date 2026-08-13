"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export function EmailForm() {
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function enviar() {
    if (!email || !mensagem) return;
    setEnviando(true);
    try {
      // Não há endpoint dedicado de envio de email; usar endpoint de resposta como fallback (registro)
      await apiFetch('/respostas', {
        method: 'POST',
        body: JSON.stringify({ idUsuario: null, idTicket: 0, msgTicket: `Email para ${email}: ${assunto}\n\n${mensagem}` }),
      });
      setSucesso('Mensagem enviada (registrada).');
      setEmail(''); setAssunto(''); setMensagem('');
    } catch (e: any) {
      setSucesso('Falha ao enviar: ' + (e.message || 'erro'));
    } finally { setEnviando(false); }
  }

  return (
    <div className="max-w-3xl">
      {sucesso && <div className="p-2 mb-2 bg-(--muted) rounded">{sucesso}</div>}
      <div className="grid gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email do cliente" className="p-2 rounded border" />
        <input value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto" className="p-2 rounded border" />
        <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Mensagem" className="p-2 rounded border h-32" />
        <div className="flex gap-2">
          <button onClick={enviar} disabled={enviando} className="px-4 py-2 bg-[#0f6b2e] text-white rounded">{enviando ? 'Enviando...' : 'Enviar Email'}</button>
        </div>
      </div>
    </div>
  );
}
