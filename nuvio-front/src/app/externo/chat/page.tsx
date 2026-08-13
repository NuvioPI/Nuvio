"use client";

import { Chat } from "@/components/ticket/Chat";

export default function PublicChatPage() {
  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Chat com o Help Desk</h1>
        <div className="bg-(--card) p-4 rounded border">
          <div className="h-[560px]"><Chat publicMode={true} /></div>
        </div>
      </div>
    </main>
  );
}
