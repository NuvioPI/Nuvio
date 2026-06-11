"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SearchBar } from "@/components/header/ui/searchBar";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- COMPONENTES AUXILIARES ---

const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div
    onClick={onChange}
    className={`w-10 h-[22px] rounded-full relative cursor-pointer transition-all duration-300 ${
      checked ? "bg-(--primary) opacity-100" : "bg-(--muted-foreground) opacity-60"
    }`}
  >
    <div
      className={`absolute w-4 h-4 bg-white rounded-full top-[3px] transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] ${
        checked ? "left-[21px]" : "left-[3px]"
      }`}
    />
  </div>
);

const FormRow = ({
  label,
  description,
  children,
  noBorder = false,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-5 py-4 items-center ${
      noBorder ? "" : "border-b border-(--muted)"
    }`}
  >
    <div>
      <label className="block text-sm font-semibold text-(--card-foreground) mb-1">
        {label}
      </label>
      <span className="text-xs text-(--muted-foreground) leading-relaxed block">
        {description}
      </span>
    </div>
    <div className="w-full">{children}</div>
  </div>
);

const inputClasses =
  "w-full px-3.5 py-2.5 rounded-lg border border-(--border) bg-(--background) text-(--foreground) text-sm outline-none focus:border-(--ring) transition-colors";

const TABS = [
  // Itens de navegação de administrador foram removidos para focar na visão do usuário.
  { id: "perfil", icon: "", label: "Perfil" },
  { id: "notificacoes", icon: "", label: "Notificações" },
  { id: "seguranca", icon: "", label: "Segurança" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil"); // A aba 'perfil' agora é a inicial.
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Estados dos formulários/toggles
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [animations, setAnimations] = useState(true);

  // Estados para a aba de notificações
  const [notifyOnNewTicket, setNotifyOnNewTicket] = useState(true);
  const [notifyOnTicketUpdate, setNotifyOnTicketUpdate] = useState(true);
  const [notifyOnTicketClose, setNotifyOnTicketClose] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-10 bg-(--background) text-(--foreground) overflow-y-auto">
      
      {/* --- CABEÇALHO --- */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Configurações</h1>
          <p className="text-(--muted-foreground) text-sm">
            Gerencie as configurações do sistema e personalize sua experiência.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-72">
            <SearchBar />
          </div>
          <button className="w-10 h-10 shrink-0 rounded-full border border-(--border) flex items-center justify-center bg-(--card) relative hover:bg-(--hoverbg) transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-(--foreground)" />
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-(--ring) rounded-full"></div>
          </button>
        </div>
      </header>

      {/* --- CONTEÚDO PRINCIPAL (3 COLUNAS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_340px] gap-8 items-start">
        
        {/* NAVEGAÇÃO LATERAL ESQUERDA */}
        <nav className="flex flex-col gap-1" aria-label="Navegação das configurações">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors text-left w-full cursor-pointer ${
                activeTab === tab.id
                  ? "text-(--primary) font-semibold"
                  : "text-(--muted-foreground) hover:bg-(--muted) font-medium"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-(--hoverbg) rounded-lg"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <span>{tab.icon}</span> {tab.label}
              </div>
            </button>
          ))}
        </nav>

        {/* ÁREA CENTRAL DE CONTEÚDO */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* ABA PERFIL */}
              {activeTab === "perfil" && (
                <>
                  <div className="bg-(--card) border border-(--card-border) rounded-(--radius) p-6 shadow-(--shadow) mb-6">
                    <h2 className="text-base font-semibold mb-1">Perfil</h2>
                    <p className="text-(--muted-foreground) text-[13px] mb-6">
                      Gerencie suas informações pessoais e credenciais.
                    </p>

                    <FormRow label="Nome Completo" description="Como você será identificado na plataforma.">
                      <input type="text" defaultValue="Lucas Oliveira" className={inputClasses} />
                    </FormRow>

                    <FormRow label="E-mail Profissional" description="E-mail utilizado para login e alertas.">
                      <input type="email" defaultValue="lucas@exemplo.com" className={inputClasses} />
                    </FormRow>

                    <FormRow label={isEditingPassword ? "Nova Senha" : "Senha de Acesso"} description={isEditingPassword ? "Digite uma senha forte com no mínimo 8 caracteres." : "Gerencie a senha usada para acessar o sistema."} noBorder>
                      {isEditingPassword ? (
                        <input autoFocus type="password" placeholder="Digite sua nova senha" className={inputClasses} />
                      ) : (
                        <div className="flex items-center justify-between bg-(--muted) px-3 py-2 rounded-lg border border-(--border)">
                          <span className="font-mono tracking-widest">••••••••</span>
                          <button
                            onClick={() => setIsEditingPassword(true)}
                            className="bg-(--card) border border-(--border) text-(--foreground) px-3 py-1.5 rounded-md font-semibold cursor-pointer text-xs transition-colors hover:bg-(--muted)"
                          >
                            Editar
                          </button>
                        </div>
                      )}
                    </FormRow>

                    <div className="flex justify-end mt-6 pt-6 border-t border-(--muted)">
                      <button className="bg-(--primary) text-(--primary-foreground) px-5 py-2.5 rounded-lg font-semibold cursor-pointer text-sm transition-colors hover:bg-(--primary-hover)">
                        {isEditingPassword ? "💾 Atualizar dados" : "💾 Atualizar perfil"}
                      </button>
                    </div>
                  </div>

                  {/* Propriedade da conta */}
                  <div className="bg-(--card) border border-red-500/40 rounded-(--radius) p-6 shadow-(--shadow) mb-6">
                    <h3 className="text-base font-semibold text-red-500 mb-2">Propriedade da conta</h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-0.5 text-(--card-foreground)">Excluir sua conta</label>
                        <span className="text-xs text-(--muted-foreground)">Esta ação é irreversível. Todos os seus dados, tickets e informações serão permanentemente removidos.</span>
                      </div>
                      <button className="bg-red-600/90 text-white px-4 py-2 rounded-md font-semibold cursor-pointer text-[13px] transition-colors hover:bg-red-700 whitespace-nowrap">
                        Excluir conta
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ABA NOTIFICAÇÕES (Placeholder) */}
              {activeTab === "notificacoes" && (
                <div className="bg-(--card) border border-(--card-border) rounded-(--radius) p-6 shadow-(--shadow) mb-6">
                  <h2 className="text-base font-semibold mb-1">Notificações</h2>
                  <p className="text-(--muted-foreground) text-[13px] mb-6">
                    Escolha como e quando você deseja ser notificado.
                  </p>
                  <h3 className="text-sm font-semibold text-(--card-foreground) border-b border-(--muted) pb-2 mb-4">Notificações por E-mail</h3>
                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-center"><div className="pr-4"><label className="block text-sm font-semibold mb-0.5">Novo ticket atribuído a mim</label><span className="text-xs text-(--muted-foreground)">Receber um e-mail quando um novo ticket for sua responsabilidade.</span></div><Switch checked={notifyOnNewTicket} onChange={() => setNotifyOnNewTicket(!notifyOnNewTicket)} /></div>
                    <div className="flex justify-between items-center"><div className="pr-4"><label className="block text-sm font-semibold mb-0.5">Atualização em um ticket que sigo</label><span className="text-xs text-(--muted-foreground)">Receber um e-mail quando houver uma nova resposta ou alteração.</span></div><Switch checked={notifyOnTicketUpdate} onChange={() => setNotifyOnTicketUpdate(!notifyOnTicketUpdate)} /></div>
                    <div className="flex justify-between items-center"><div className="pr-4"><label className="block text-sm font-semibold mb-0.5">Ticket encerrado</label><span className="text-xs text-(--muted-foreground)">Receber um e-mail quando um ticket que você abriu for encerrado.</span></div><Switch checked={notifyOnTicketClose} onChange={() => setNotifyOnTicketClose(!notifyOnTicketClose)} /></div>
                  </div>
                  <div className="flex justify-end mt-6 pt-6 border-t border-(--muted)">
                    <button className="bg-(--primary) text-(--primary-foreground) px-5 py-2.5 rounded-lg font-semibold cursor-pointer text-sm transition-colors hover:bg-(--primary-hover)">💾 Salvar preferências</button>
                  </div>
                </div>
              )}

              {/* ABA SEGURANÇA */}
              {activeTab === "seguranca" && (
                <div className="bg-(--card) border border-(--card-border) rounded-(--radius) p-6 shadow-(--shadow) mb-6">
                  <h2 className="text-base font-semibold mb-1">Segurança</h2>
                  <p className="text-(--muted-foreground) text-[13px] mb-6">Proteja sua conta com ferramentas como a autenticação de dois fatores.</p>

                  <h3 className="text-sm font-semibold text-(--card-foreground) border-b border-(--muted) pb-2 mb-4">Autenticação</h3>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <label className="block text-sm font-semibold mb-0.5">Autenticação de Dois Fatores (2FA)</label>
                      <span className="text-xs text-(--muted-foreground)">Exige um código extra gerado no seu celular ao fazer login.</span>
                    </div>
                    <Switch checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* SIDEBAR DIREITA (WIDGETS) */}
        <aside className="flex flex-col gap-6 lg:col-span-2 xl:col-span-1">
          {/* TEMA */}
          <div className="bg-(--card) border border-(--card-border) rounded-(--radius) p-6 shadow-(--shadow)">
            <h2 className="text-base font-semibold mb-1">Aparência</h2>
            <p className="text-(--muted-foreground) text-[13px] mb-4">Escolha o tema de aparência do sistema.</p>
            
            {mounted && (
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setTheme("light")} className={`border rounded-lg p-3 cursor-pointer flex flex-col gap-3 transition-colors ${theme !== "dark" ? "border-(--ring) bg-(--hoverbg) border-2" : "border-(--border)"}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${theme !== "dark" ? "border-(--ring)" : "border-(--border)"}`}>{theme !== "dark" && <div className="w-2 h-2 bg-(--ring) rounded-full" />}</div> Claro
                  </div>
                  <div className="h-[60px] bg-[#fdfdfd] border-t-8 border-[#e0e0e0] rounded border border-gray-200" />
                </div>
                <div onClick={() => setTheme("dark")} className={`border rounded-lg p-3 cursor-pointer flex flex-col gap-3 transition-colors ${theme === "dark" ? "border-(--ring) bg-(--hoverbg) border-2" : "border-(--border)"}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${theme === "dark" ? "border-(--ring)" : "border-(--border)"}`}>{theme === "dark" && <div className="w-2 h-2 bg-(--ring) rounded-full" />}</div> Escuro
                  </div>
                  <div className="h-[60px] bg-[#1e1e1e] border-t-8 border-[#333] rounded border border-gray-800" />
                </div>
              </div>
            )}
          </div>

          {/* OUTRAS OPÇÕES */}
          <div className="bg-(--card) border border-(--card-border) rounded-(--radius) p-6 shadow-(--shadow)">
            <h2 className="text-base font-semibold mb-4">Outras opções</h2>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center"><div className="pr-4"><label className="block text-sm font-semibold mb-0.5">Modo compacto</label><span className="text-xs text-(--muted-foreground)">Reduz o espaçamento entre elementos.</span></div><Switch checked={compactMode} onChange={() => setCompactMode(!compactMode)} /></div>
              <div className="flex justify-between items-center"><div className="pr-4"><label className="block text-sm font-semibold mb-0.5">Exibir dicas</label><span className="text-xs text-(--muted-foreground)">Mostrar dicas e tutoriais para novos usuários.</span></div><Switch checked={showTips} onChange={() => setShowTips(!showTips)} /></div>
              <div className="flex justify-between items-center"><div className="pr-4"><label className="block text-sm font-semibold mb-0.5">Animações</label><span className="text-xs text-(--muted-foreground)">Habilita animações e transições suaves.</span></div><Switch checked={animations} onChange={() => setAnimations(!animations)} /></div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}