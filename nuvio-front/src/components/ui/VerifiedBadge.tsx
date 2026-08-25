import Image from "next/image";

export type VerificationValue = boolean | number | string | null | undefined;

export function isVerified(value: VerificationValue) {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function VerifiedBadge({ verified, size = 15, className = "" }: { verified: VerificationValue; size?: number; className?: string }) {
  if (!isVerified(verified)) return null;

  return (
    <Image
      src="/icons/shield-trust.svg"
      alt="Usuário verificado"
      title="Usuário verificado"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  );
}

export function VerifiedName({ name, verified, className = "" }: { name: string; verified: VerificationValue; className?: string }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <span className="truncate">{name}</span>
      <VerifiedBadge verified={verified} />
    </span>
  );
}

