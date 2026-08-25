import Image from "next/image";

type TipoInterno = string | { nome?: string | null } | null | undefined;

function nomeTipo(tipo: TipoInterno) {
  return typeof tipo === "object" ? tipo?.nome ?? "" : tipo ?? "";
}

export function isPessoaNuvio(tipo: TipoInterno) {
  const perfil = nomeTipo(tipo)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return ["tecnico", "administrador", "gerente"].includes(perfil);
}

export function NuvioBadge({ tipo, size = 15, className = "" }: { tipo: TipoInterno; size?: number; className?: string }) {
  if (!isPessoaNuvio(tipo)) return null;

  return (
    <Image
      src="/icons/shield-trust.svg"
      alt="Pessoa verificada da Nuvio"
      title="Pessoa verificada da Nuvio"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  );
}

export function NuvioName({ name, tipo, className = "" }: { name: string; tipo: TipoInterno; className?: string }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <span className="truncate">{name}</span>
      <NuvioBadge tipo={tipo} />
    </span>
  );
}

