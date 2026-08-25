"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";

type IconComponent = React.ComponentType<{ className?: string }>;

type SettingsSection = "perfil" | "notificacoes" | "seguranca" | "aparencia";

const Bell: IconComponent = ({ className }) => <span className={className} aria-hidden="true">🔔</span>;
const Check: IconComponent = ({ className }) => <span className={className} aria-hidden="true">✔</span>;
const ChevronRight: IconComponent = ({ className }) => <span className={className} aria-hidden="true">›</span>;
const KeyRound: IconComponent = ({ className }) => <span className={className} aria-hidden="true">🔑</span>;
const Laptop: IconComponent = ({ className }) => <span className={className} aria-hidden="true">💻</span>;
const LockKeyhole: IconComponent = ({ className }) => <span className={className} aria-hidden="true">🔒</span>;
const Mail: IconComponent = ({ className }) => <span className={className} aria-hidden="true">✉️</span>;
const Monitor: IconComponent = ({ className }) => <span className={className} aria-hidden="true">🖥️</span>;
const Moon: IconComponent = ({ className }) => <span className={className} aria-hidden="true">🌙</span>;
const ShieldCheck: IconComponent = ({ className }) => <span className={className} aria-hidden="true">🛡️</span>;
const Sun: IconComponent = ({ className }) => <span className={className} aria-hidden="true">☀️</span>;
const UserRound: IconComponent = ({ className }) => <span className={className} aria-hidden="true">👤</span>;

const sections = [
  { id: "perfil" as const, label: "Perfil", icon: UserRound },
  { id: "notificacoes" as const, label: "Notificações", icon: Bell },
  { id: "seguranca" as const, label: "Segurança", icon: ShieldCheck },
  { id: "aparencia" as const, label: "Aparência", icon: Monitor },
];

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors ${enabled ? "bg-(--primary)" : "bg-(--border)"}`}
    >
      <span className={`absolute left-0 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 py-5 md:grid-cols-[minmax(180px,0.8fr)_minmax(260px,1.2fr)] md:gap-8">
      <div>
        <p className="text-sm font-medium text-(--foreground)">{label}</p>
        <p className="mt-1 text-xs leading-5 text-(--muted-foreground)">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-(--card-border) bg-(--card) shadow-(--shadow)">
      <div className="border-b border-(--border) px-5 py-5 sm:px-6">
        <h2 className="font-semibold text-(--card-foreground)">{title}</h2>
        <p className="mt-1 text-sm text-(--muted-foreground)">{description}</p>
      </div>
      <div className="px-5 sm:px-6">{children}</div>
    </section>
  );
}

const inputClass = "w-full rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState<SettingsSection>("perfil");
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({ email: true, desktop: true, updates: false, twoFactor: false, compact: false });

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };
  const flip = (key: keyof typeof preferences) => setPreferences((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="mx-auto w-full max-w-7xl px-1 py-2 sm:px-2 sm:py-5">
      <div className="mb-8">
        <p className="text-sm font-medium text-(--primary)">Sua conta</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-(--foreground)">Configurações</h1>
        <p className="mt-2 text-sm text-(--muted-foreground)">Personalize sua experiência e mantenha sua conta protegida.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="Seções das configurações">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition ${active === id ? "bg-(--primary) text-(--primary-foreground) shadow-sm" : "text-(--muted-foreground) hover:bg-(--hoverbg) hover:text-(--foreground)"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-5">
          {active === "perfil" && <>
            <Card title="Informações do perfil" description="Estes dados aparecem na identificação dos seus chamados.">
              <Field label="Nome completo" hint="Use o nome pelo qual você é reconhecido na equipe."><input className={inputClass} defaultValue="Lucas Oliveira" /></Field>
              <div className="border-t border-(--border)"><Field label="E-mail profissional" hint="Usado para acessar a plataforma e receber alertas."><input className={inputClass} type="email" defaultValue="lucas@exemplo.com" /></Field></div>
              <div className="flex items-center justify-end border-t border-(--border) py-4"><button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition hover:bg-(--primary-hover)">{saved ? <Check className="h-4 w-4" /> : null}{saved ? "Alterações salvas" : "Salvar alterações"}</button></div>
            </Card>
            <Card title="Senha" description="Use uma senha longa e exclusiva para proteger sua conta.">
              <Field label="Senha atual" hint="Atualize sua senha periodicamente."><button className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-medium transition hover:bg-(--muted)"><KeyRound className="h-4 w-4" />Alterar senha <ChevronRight className="h-4 w-4" /></button></Field>
            </Card>
          </>}

          {active === "notificacoes" && <Card title="Preferências de notificação" description="Defina quais avisos você deseja receber.">
            <PreferenceRow icon={Mail} title="E-mails sobre chamados" text="Receba atualizações quando houver movimentação nos seus chamados." enabled={preferences.email} onChange={() => flip("email")} />
            <PreferenceRow icon={Bell} title="Notificações no sistema" text="Exiba avisos importantes diretamente na plataforma." enabled={preferences.desktop} onChange={() => flip("desktop")} />
            <PreferenceRow icon={ShieldCheck} title="Novidades da plataforma" text="Fique por dentro de novos recursos e melhorias." enabled={preferences.updates} onChange={() => flip("updates")} last />
          </Card>}

          {active === "seguranca" && <>
            <Card title="Proteção da conta" description="Adicione uma camada extra de segurança ao seu acesso.">
              <PreferenceRow icon={LockKeyhole} title="Autenticação em dois fatores" text="Exige um código de confirmação ao entrar na sua conta." enabled={preferences.twoFactor} onChange={() => flip("twoFactor")} last />
            </Card>
            <Card title="Sessões ativas" description="Dispositivos que acessaram sua conta recentemente.">
              <div className="flex items-center justify-between gap-4 py-5"><div className="flex items-center gap-3"><span className="rounded-xl bg-(--hoverbg) p-2.5 text-(--primary)"><Laptop className="h-5 w-5" /></span><div><p className="text-sm font-medium">Este dispositivo</p><p className="mt-0.5 text-xs text-(--muted-foreground)">Windows · São Paulo, Brasil · Agora</p></div></div><span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">Atual</span></div>
            </Card>
          </>}

          {active === "aparencia" && <Card title="Aparência" description="Escolha como a plataforma deve ser exibida para você.">
            <div className="grid gap-3 py-5 sm:grid-cols-2"><ThemeOption label="Claro" icon={Sun} active={theme !== "dark"} onClick={() => setTheme("light")} /><ThemeOption label="Escuro" icon={Moon} active={theme === "dark"} onClick={() => setTheme("dark")} /></div>
            <div className="border-t border-(--border)"><PreferenceRow icon={Monitor} title="Modo compacto" text="Reduz o espaçamento entre os elementos da interface." enabled={preferences.compact} onChange={() => flip("compact")} last /></div>
          </Card>}
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({ icon: Icon, title, text, enabled, onChange, last = false }: { icon: typeof Bell; title: string; text: string; enabled: boolean; onChange: () => void; last?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 py-5 ${last ? "" : "border-b border-(--border)"}`}><div className="flex min-w-0 items-center gap-3"><span className="rounded-xl bg-(--hoverbg) p-2.5 text-(--primary)"><Icon className="h-5 w-5" /></span><div><p className="text-sm font-medium">{title}</p><p className="mt-0.5 max-w-lg text-xs leading-5 text-(--muted-foreground)">{text}</p></div></div><Toggle enabled={enabled} onChange={onChange} label={title} /></div>;
}

function ThemeOption({ label, icon: Icon, active, onClick }: { label: string; icon: typeof Sun; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${active ? "border-(--primary) bg-(--hoverbg) ring-1 ring-(--primary)" : "border-(--border) hover:bg-(--muted)"}`}><span className="rounded-lg bg-(--card) p-2 text-(--primary) shadow-sm"><Icon className="h-4 w-4" /></span><span className="text-sm font-medium">{label}</span>{active && <Check className="ml-auto h-4 w-4 text-(--primary)" />}</button>;
}
