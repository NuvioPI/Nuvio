"use client";

import { EmailForm } from "@/components/ticket/EmailForm";

export default function HelpEmailPage() {
  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Email do Help Desk</h1>

        <div className="bg-(--card) p-4 rounded border border-(--card-border)">
          <EmailForm />
        </div>
      </div>
    </main>
  );
}
