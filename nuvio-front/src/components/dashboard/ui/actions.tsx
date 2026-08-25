import Link from "next/link";
import { Plus } from "@/components/animate-ui/icons/plus";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Layers } from "@/components/animate-ui/icons/layers";

export default function Actions() {
  return (
    <div className="flex flex-col bg-(--card) border border-(--card-border) rounded-lg mt-10 gap-4 p-6">
      <h1 className="text-2xl font-semibold text-(--foreground)">Ações Rápidas</h1>

      <AnimateIcon animateOnHover>
        <Link href="/tickets/new" className="cursor-pointer bg-(--primary) text-white w-full py-4 rounded-[15px] hover:bg-(--primary-hover) transition-all flex items-center justify-center gap-2">
          <Plus />
          Novo Chamado
        </Link>
      </AnimateIcon>

      <AnimateIcon animateOnHover>
        <Link href="/knowledge-base" className="cursor-pointer bg-(--secondary-button-bg) text-(--secondary-button-foreground) w-full py-4 rounded-[15px] hover:bg-(--secondary-button-hover-bg) transition-all flex items-center justify-center gap-2">
          <Layers />
          Base de Conhecimento
        </Link>
      </AnimateIcon>
    </div>
  );
}
