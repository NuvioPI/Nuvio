"use client";

import { Chat } from "@/components/ticket/Chat";

export default function LiveChatPage() {
  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Chat Ao Vivo</h1>

        <div className="bg-(--card) p-4 rounded border border-(--card-border) min-h-[420px]">
          <div className="h-[420px]"><Chat /></div>
        </div>
      </div>
    </main>
  );
}
