type CardProps = {
  value: number;
  title: string;
  percent: string;
};

export function Card({ value, title, percent }: CardProps) {
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
      <div className="w-8 h-8 md:w-12 md:h-12 bg-(--primary) relative rounded-full shrink-0" />

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