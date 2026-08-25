import { AlertCircle, CheckCircle2, Clock3, LockKeyhole, type LucideIcon } from "lucide-react";

type CardProps = {
  value: number;
  title: string;
  percent: string;
};

const icons: Record<string, LucideIcon> = {
  Abertos: AlertCircle,
  "Em atendimento": Clock3,
  Resolvidos: CheckCircle2,
  Fechados: LockKeyhole,
};

export function Card({ value, title, percent }: CardProps) {
  const Icon = icons[title] ?? AlertCircle;

  return (
    <div className="
      bg-(--card)
      border border-(--card-border)
      rounded-lg
      p-4 md:p-6
      flex items-center gap-3 md:gap-4
      cursor-pointer
      hover:scale-[1.02]
      hover:border-(--primary)
      transition-all duration-200
    ">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary) md:h-12 md:w-12">
        <Icon className="h-4 w-4 text-white md:h-6 md:w-6" strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="flex flex-col min-w-0">
        <h1 className="text-2xl md:text-4xl font-bold text-(--card-foreground) leading-tight">
          {value}
        </h1>
        <p className="text-sm md:text-lg text-zinc-500 truncate">{title}</p>
        <p className="text-xs md:text-sm text-zinc-500">
          <span className="text-green-900 font-semibold">{percent}</span> vs ontem
        </p>
      </div>
    </div>
  );
}
