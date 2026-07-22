"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/admin/dashboard");
      }
    });
  }

  return (
    <form action={handleLogin} className="space-y-4">
      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-[#fee2e2] text-[#b91c1c] text-xs font-medium px-3 py-2.5 rounded-lg border border-[#fecaca] animate-in fade-in zoom-in-95">
          {error}
        </div>
      )}

      {/* campo usuário */}
      <div>
        <label className="block text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-[0.4px] mb-1.5">
          Usuário
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="admin@nuvio.com"
          className="w-full h-[42px] rounded-[10px] border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] text-sm px-3.5 outline-none focus:border-[#2fae5a] transition-colors placeholder:text-[var(--muted-foreground)]"
        />
      </div>

      {/* campo senha */}
      <div>
        <label className="block text-[11px] font-medium text-[var(--muted-foreground)] uppercase tracking-[0.4px] mb-1.5">
          Senha
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="w-full h-[42px] rounded-[10px] border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] text-sm px-3.5 pr-10 outline-none focus:border-[#2fae5a] transition-colors placeholder:text-[var(--muted-foreground)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Mostrar senha"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* botão */}
      <button
        type="submit"
        disabled={isPending}
        className="relative w-full h-[44px] bg-[#0f6b2e] hover:bg-[#2fae5a] text-white rounded-[10px] text-sm font-medium transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden"
      >
        <span className={`transition-opacity ${isPending ? 'opacity-0' : 'opacity-100'}`}>
          Entrar no painel
        </span>
        
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      </button>

      {/* rodapé */}
      <div className="pt-5 border-t border-[var(--border)] mt-2">
        <p className="text-[11px] text-[var(--muted-foreground)] text-center leading-relaxed">
          Esta é uma área restrita. Se você não tem acesso, entre em contato com o administrador do sistema.
        </p>
      </div>
    </form>
  );
}
