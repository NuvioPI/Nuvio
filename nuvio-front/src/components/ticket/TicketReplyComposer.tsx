"use client";

import { useState } from "react";
import { Bold, Image as ImageIcon, Link2, Paperclip, Send } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { VerifiedName } from "@/components/ui/VerifiedBadge";

type TicketReply = {
  idTicket: number;
  titulo: string;
  nomeUsuario?: string | null;
  verificado?: boolean | number | string | null;
  emailUsuario?: string | null;
  statusTicket: string;
};

export function TicketReplyComposer({
  ticket,
  onSent,
}: {
  ticket: TicketReply;
  onSent: () => void;
}) {
  const [assunto, setAssunto] = useState(`Re: ${ticket.titulo} (#${ticket.idTicket})`);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const encerrado = ["Resolvido", "Fechado"].includes(ticket.statusTicket);

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (encerrado || !mensagem.trim()) return;

    setEnviando(true);
    setErro("");
    setSucesso("");

    try {
      await apiFetch(`/tickets/${ticket.idTicket}/responder-email`, {
        method: "POST",
        body: JSON.stringify({
          assunto: assunto.trim(),
          mensagem: mensagem.trim(),
        }),
      });

      setMensagem("");
      setSucesso(`E-mail enviado para ${ticket.emailUsuario || "o solicitante"}.`);
      onSent();
    } catch (cause) {
      setErro(cause instanceof Error ? cause.message : "Não foi possível enviar o e-mail.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="border-t border-(--border) bg-(--card) p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-(--foreground)">Responder por e-mail</p>
          <p className="text-xs text-(--muted-foreground)">
            A resposta será registrada no chamado e enviada ao solicitante.
          </p>
        </div>
        <span className="rounded-full bg-(--primary)/10 px-2.5 py-1 text-xs font-medium text-(--primary)">
          Resposta pública
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm">
          <span className="w-14 shrink-0 text-xs font-medium text-(--muted-foreground)">Para</span>
          <span className="truncate text-(--foreground)">
            {ticket.nomeUsuario ? <VerifiedName name={ticket.nomeUsuario} verified={ticket.verificado} /> : "Solicitante"} &lt;{ticket.emailUsuario || "sem e-mail"}&gt;
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-3 py-2">
          <label htmlFor="assunto-resposta" className="w-14 shrink-0 text-xs font-medium text-(--muted-foreground)">
            Assunto
          </label>
          <input
            id="assunto-resposta"
            value={assunto}
            onChange={(event) => setAssunto(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-(--foreground) outline-none"
            disabled={encerrado || enviando}
          />
        </div>

        <textarea
          value={mensagem}
          onChange={(event) => setMensagem(event.target.value)}
          placeholder="Escreva a resposta para o cliente..."
          className="min-h-32 w-full resize-y rounded-xl border border-(--border) bg-(--background) px-3 py-3 text-sm leading-6 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={encerrado || enviando}
        />
      </div>

      {(erro || sucesso) && (
        <p className={`mt-2 text-xs ${erro ? "text-red-400" : "text-(--primary)"}`}>
          {erro || sucesso}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-(--muted-foreground)">
          <ToolbarButton icon={<Bold size={15} />} label="Negrito" />
          <ToolbarButton icon={<Link2 size={15} />} label="Inserir link" />
          <ToolbarButton icon={<Paperclip size={15} />} label="Anexar arquivo" />
          <ToolbarButton icon={<ImageIcon size={15} />} label="Inserir imagem" />
        </div>

        <button
          type="submit"
          disabled={encerrado || enviando || !mensagem.trim() || !ticket.emailUsuario}
          className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
          {enviando ? "Enviando..." : "Enviar resposta"}
        </button>
      </div>

      {encerrado && (
        <p className="mt-3 text-xs text-(--muted-foreground)">
          Este chamado está {ticket.statusTicket.toLowerCase()} e não aceita novas respostas.
        </p>
      )}
    </form>
  );
}

function ToolbarButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="rounded-lg p-2 transition hover:bg-(--hoverbg) hover:text-(--foreground)"
    >
      {icon}
    </button>
  );
}
