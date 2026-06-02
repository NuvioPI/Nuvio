import { Plus } from "@/components/animate-ui/icons/plus";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Layers } from "@/components/animate-ui/icons/layers";

export default function Actions() {
  return (
    <div className="flex flex-col bg-(--card) border border-(--card-border) rounded-lg mt-10 gap-4 p-6">
      <h1 className="text-2xl font-semibold text-(--foreground)">Ações Rápidas</h1>

      <AnimateIcon animateOnHover>
        <button className="cursor-pointer bg-(--primary) text-white w-full py-4 rounded-[15px] hover:bg-(--primary-hover) transition-all flex items-center justify-center gap-2">
          <Plus />
          Novo Chamado
        </button>
      </AnimateIcon>

      <AnimateIcon animateOnHover>
        <button className="cursor-pointer bg-(--secondary-button-bg) text-(--secondary-button-foreground) w-full py-4 rounded-[15px] hover:bg-(--secondary-button-hover-bg) transition-all flex items-center justify-center gap-2">
          <Layers />
          Base de Conhecimento
        </button>
      </AnimateIcon>
    </div>
  );
}