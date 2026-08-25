import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import UserManagementPanel from "@/components/admin/UserManagementPanel";

export default function AdminUsersPage() {
  return (
    <main className="space-y-5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs text-(--muted-foreground) transition hover:text-(--foreground)">
            <ArrowLeft size={14} /> Voltar ao dashboard
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--primary)/10 text-(--primary)">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[.6px] text-(--muted-foreground)">Painel administrativo</p>
              <h1 className="mt-1 text-xl font-medium text-(--foreground)">Usuários e permissões</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-(--muted-foreground)">Gerencie contas, verificações, perfis de acesso e remoções em uma página exclusiva para administradores.</p>
        </div>
      </div>

      <UserManagementPanel showFullRegistrationLink={false} />
    </main>
  );
}
