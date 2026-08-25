"use client";

import { LiveChatWorkspace } from "@/components/ticket/LiveChatWorkspace";
import { PortalHeader } from "@/components/portal/PortalHeader";

export default function PortalChatPage() {
  return (
    <main className="min-h-screen bg-(--background) px-4 py-5 text-(--foreground) sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <PortalHeader showHomeLink />
        <LiveChatWorkspace />
      </div>
    </main>
  );
}
