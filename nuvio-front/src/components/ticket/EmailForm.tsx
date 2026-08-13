"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type EmailFormProps = { publicMode?: boolean };

export function EmailForm({ publicMode = false }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function enviar() {
    if (!email || !mensagem) return;
    setEnviando(true);
    try {
      await apiFetch('/respostas', {
        method: 'POST',
        body: JSON.stringify({ idUsuario: null, idTicket: 0, msgTicket: `Email para ${email}: ${assunto}\n\n${mensagem}` }),
      });
      setSucesso('Mensagem enviada (registrada).');
      setEmail(''); setAssunto(''); setMensagem(''); setNome('');
    } catch (e: any) {
      setSucesso('Falha ao enviar: ' + (e.message || 'erro'));
    } finally { setEnviando(false); }
  }

  return (
    <div className="max-w-3xl bg-(--card) p-4 rounded">
      {sucesso && <div className="p-2 mb-2 bg-(--muted) rounded">{sucesso}</div>}
      <div className="grid gap-2">
        {publicMode && (
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="p-2 rounded border" />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email do cliente" className="p-2 rounded border" />
        <input value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto" className="p-2 rounded border" />
        <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Mensagem" className="p-2 rounded border h-40" />
        <div className="flex gap-2 justify-end">
          <button onClick={enviar} disabled={enviando} className="px-4 py-2 bg-[#0f6b2e] text-white rounded">{enviando ? 'Enviando...' : 'Enviar'}</button>
        </div>
      </div>
    </div>
  );
}
