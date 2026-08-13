"use client";

import { EmailForm } from "@/components/ticket/EmailForm";

export default function PublicEmailPage() {
  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Enviar Email ao Help Desk</h1>
        <div className="bg-(--card) p-4 rounded border">
          <EmailForm publicMode={true} />
        </div>
      </div>
    </main>
  );
}
