"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/ui/card";
import Table, { TicketResumo } from "@/components/dashboard/ui/table";
import Recents from "@/components/dashboard/ui/recents";
import Actions from "@/components/dashboard/ui/actions";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { NuvioBadge } from "@/components/ui/NuvioBadge";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [tickets, setTickets] = useState<TicketResumo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    apiFetch<{ tickets: TicketResumo[] }>("/tickets")
      .then((dados) => setTickets(dados.tickets))
      .catch(() => setTickets([]))
      .finally(() => setCarregando(false));
  }, []);

  const quantidade = (status: string) => tickets.filter((ticket) => ticket.statusTicket === status).length;

  return (
    <div className="min-h-screen p-4 md:p-10 bg-(--background)">
      <section className="mb-2"><h1 className="text-3xl md:text-5xl text-(--foreground)">Dashboard</h1>
        <p className="flex items-center gap-2 text-xl italic text-zinc-500 md:text-3xl">Bem-vindo de volta, <span className="inline-flex items-center gap-1.5"><span>{usuario?.nome ?? ""}</span><NuvioBadge tipo={usuario?.tipo} /></span>!</p></section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2"><section className="mt-6 md:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card value={quantidade("Aberto")} title="Abertos" percent="" />
          <Card value={quantidade("Em atendimento")} title="Em atendimento" percent="" />
          <Card value={quantidade("Resolvido")} title="Resolvidos" percent="" />
          <Card value={quantidade("Fechado")} title="Fechados" percent="" />
        </section><Table tickets={tickets.slice(0, 5)} carregando={carregando} /></div>
        <section className="flex flex-col"><Recents tickets={tickets} /><Actions /></section>
      </div>
    </div>
  );
}
