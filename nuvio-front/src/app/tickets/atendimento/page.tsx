"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/ticket/Chat").then(m => m.Chat), { ssr: false });
const EmailForm = dynamic(() => import("@/components/ticket/EmailForm").then(m => m.EmailForm), { ssr: false });

export default function AtendimentoPage() {
  const [tab, setTab] = useState<'chat'|'email'>('chat');

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Atender Chamados</h1>

        <div className="inline-flex rounded bg-(--muted) p-1 mb-4">
          <button onClick={() => setTab('chat')} className={`px-4 py-2 ${tab==='chat' ? 'bg-(--card) rounded' : ''}`}>Chat Ao Vivo</button>
          <button onClick={() => setTab('email')} className={`px-4 py-2 ${tab==='email' ? 'bg-(--card) rounded' : ''}`}>Email</button>
        </div>

        <div className="bg-(--card) p-4 rounded border border-(--card-border) min-h-[420px]">
          {tab === 'chat' ? (
            <div className="h-[420px]"><Chat /></div>
          ) : (
            <EmailForm />
          )}
        </div>
      </div>
    </main>
  );
}
