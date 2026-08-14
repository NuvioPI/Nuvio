"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LiveChatWorkspace } from "@/components/ticket/LiveChatWorkspace";

export default function PortalChatPage() {
  return (
    <main className="min-h-screen bg-[#f5f9f6] px-4 py-5 text-[#173020] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/portal" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#52705c] transition hover:text-[#0f6b2e]"><ArrowLeft size={17} /> Voltar para o portal</Link>
        <LiveChatWorkspace />
      </div>
    </main>
  );
}
