export function isTicketNovo(dataAbertura: string) {
  const data = new Date(dataAbertura.includes("T") ? dataAbertura : dataAbertura.replace(" ", "T"));
  const idade = Date.now() - data.getTime();

  return Number.isFinite(data.getTime()) && idade >= 0 && idade <= 24 * 60 * 60 * 1000;
}

export function NewTicketBadge({ dataAbertura }: { dataAbertura: string }) {
  if (!isTicketNovo(dataAbertura)) return null;

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Novo
    </span>
  );
}

