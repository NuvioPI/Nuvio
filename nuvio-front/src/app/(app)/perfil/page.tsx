"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  Calendar,
  KeyRound,
  Check,
  Copy,
  Edit3,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Eye,
  EyeOff,
  UploadCloud,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { apiFetch, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface PerfilUsuario {
  id: number;
  idtipoUsuario: number;
  nome: string;
  email: string;
  cargo?: string | null;
  setor?: string | null;
  telefone?: string | null;
  fotoPerfil?: string | null;
  dataCadastro?: string | null;
  tipo?: string | { id: number; nome: string } | null;
}

interface TicketItem {
  idTicket: number;
  titulo: string;
  statusTicket: string;
  prioridade: string;
  dataAbertura: string;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
  "/balls.jpeg",
];

export default function PerfilPage() {
  const { usuario: usuarioContext, atualizarUsuario } = useAuth();
  
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<"visao-geral" | "editar" | "seguranca">("visao-geral");

  // Formulário de Edição
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCargo, setFormCargo] = useState("");
  const [formSetor, setFormSetor] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formFoto, setFormFoto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Formulário de Senha
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [senhaSucesso, setSenhaSucesso] = useState<string | null>(null);
  const [senhaErro, setSenhaErro] = useState<string | null>(null);

  // Tickets do Usuário
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null);

  // Input de arquivo para o bucket
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregarPerfil = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const res = await apiFetch<{ usuario: PerfilUsuario }>("/auth/verificar", { method: "GET" });
      const u = res.usuario || (res as any);
      
      if (u) {
        setUsuario(u);
        setFormNome(u.nome || "");
        setFormEmail(u.email || "");
        setFormCargo(u.cargo || "");
        setFormSetor(u.setor || "");
        setFormTelefone(u.telefone || "");
        setFormFoto(u.fotoPerfil || "");
      }

      try {
        const ticketRes = await apiFetch<{ tickets: TicketItem[] }>("/tickets", { method: "GET" });
        if (ticketRes?.tickets) {
          setTickets(ticketRes.tickets);
        }
      } catch {
        // Tickets opcionais
      }
    } catch (e: any) {
      if (usuarioContext) {
        setUsuario(usuarioContext as any);
        setFormNome(usuarioContext.nome || "");
        setFormEmail(usuarioContext.email || "");
        setFormCargo(usuarioContext.cargo || "");
        setFormSetor(usuarioContext.setor || "");
        setFormTelefone(usuarioContext.telefone || "");
        setFormFoto(usuarioContext.fotoPerfil || "");
      } else {
        setErro(e.message || "Não foi possível carregar os dados do perfil.");
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  const copiarTexto = (texto: string, campo: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoCampo(campo);
    setTimeout(() => setCopiadoCampo(null), 2000);
  };

  // Upload direto para o Bucket de Imagens
  const handleUploadFotoArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica de tamanho (2MB — armazenado como Base64 no banco)
    if (file.size > 2 * 1024 * 1024) {
      setMensagemErro("A imagem selecionada é maior que 2MB.");
      return;
    }

    setUploadandoFoto(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await apiFetch<{
        sucesso: boolean;
        url: string;
        caminho: string;
        mensagem: string;
      }>("/upload/foto", {
        method: "POST",
        body: formData,
      });

      if (res.sucesso) {
        setFormFoto(res.caminho);
        setUsuario((prev) => (prev ? { ...prev, fotoPerfil: res.caminho } : null));
        atualizarUsuario({ fotoPerfil: res.caminho });
        setMensagemSucesso("Foto enviada para o bucket com sucesso!");
        setTimeout(() => setMensagemSucesso(null), 4000);
      }
    } catch (err: any) {
      setMensagemErro(err.message || "Falha ao enviar a imagem para o bucket.");
    } finally {
      setUploadandoFoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      const res = await apiFetch<{ mensagem: string; usuario: PerfilUsuario }>("/auth/perfil", {
        method: "PUT",
        body: JSON.stringify({
          nome: formNome,
          email: formEmail,
          cargo: formCargo,
          setor: formSetor,
          telefone: formTelefone,
          fotoPerfil: formFoto,
        }),
      });

      setMensagemSucesso(res.mensagem || "Perfil atualizado com sucesso!");
      if (res.usuario) {
        setUsuario(res.usuario);
        atualizarUsuario({
          nome: res.usuario.nome,
          email: res.usuario.email,
          cargo: res.usuario.cargo,
          setor: res.usuario.setor,
          telefone: res.usuario.telefone,
          fotoPerfil: res.usuario.fotoPerfil,
        });
      }
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err: any) {
      setMensagemErro(err.message || "Erro ao atualizar informações.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhaSucesso(null);
    setSenhaErro(null);

    if (!senhaNova || senhaNova.length < 6) {
      setSenhaErro("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (senhaNova !== senhaConfirmacao) {
      setSenhaErro("As senhas digitadas não coincidem.");
      return;
    }

    setSalvandoSenha(true);

    try {
      await apiFetch("/auth/perfil", {
        method: "PUT",
        body: JSON.stringify({
          nome: usuario?.nome || formNome,
          email: usuario?.email || formEmail,
          senha: senhaNova,
        }),
      });

      setSenhaSucesso("Senha alterada com sucesso!");
      setSenhaNova("");
      setSenhaConfirmacao("");
      setTimeout(() => setSenhaSucesso(null), 4000);
    } catch (err: any) {
      setSenhaErro(err.message || "Erro ao alterar a senha.");
    } finally {
      setSalvandoSenha(false);
    }
  };

  const tipoNome = useMemo(() => {
    if (!usuario?.tipo) return "Usuário";
    if (typeof usuario.tipo === "object") return usuario.tipo.nome;
    return usuario.tipo;
  }, [usuario]);

  const fotoResolvida = useMemo(() => {
    const f = usuario?.fotoPerfil || formFoto;
    if (!f) return "/balls.jpeg";
    if (f.startsWith("http") || f.startsWith("data:")) return f;
    const path = f.startsWith("/") ? f : `/${f}`;
    return `${API_URL}${path}`;
  }, [usuario?.fotoPerfil, formFoto]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const abertos = tickets.filter((t) => t.statusTicket === "Aberto").length;
    const emAtendimento = tickets.filter((t) => t.statusTicket === "Em atendimento").length;
    const resolvidos = tickets.filter((t) => t.statusTicket === "Resolvido" || t.statusTicket === "Fechado").length;
    return { total, abertos, emAtendimento, resolvidos };
  }, [tickets]);

  const dataFormatada = useMemo(() => {
    if (!usuario?.dataCadastro) return "Membro recente";
    try {
      const data = new Date(usuario.dataCadastro);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Data indisponível";
    }
  }, [usuario?.dataCadastro]);

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-(--border) border-t-(--primary) animate-spin" />
        </div>
        <p className="text-sm font-medium text-(--muted-foreground) animate-pulse">
          Carregando informações do perfil...
        </p>
      </div>
    );
  }

  if (erro && !usuario) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-bold text-(--foreground)">Erro ao carregar perfil</h2>
        <p className="mt-2 text-sm text-(--muted-foreground)">{erro}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={carregarPerfil}
            className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition hover:opacity-90 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:bg-(--hoverbg)"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* INPUT OCULTO DE UPLOAD PARA O BUCKET */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadFotoArquivo}
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="hidden"
      />

      {/* HERO BANNER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl border border-(--card-border) bg-(--card) shadow-sm"
      >
        {/* BANNER GRADIENT DECORATIVO */}
        <div className="relative h-44 w-full bg-gradient-to-r from-emerald-900/40 via-emerald-700/20 to-teal-900/30 overflow-hidden">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-(--primary)/20 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-teal-500/15 blur-2xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/20" />
        </div>

        {/* PROFILE HEADER INFO */}
        <div className="relative px-6 pb-6 pt-4 sm:px-8">
          {/* Avatar sobe sobre o banner, texto fica abaixo */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* AVATAR — puxa só ele pra cima */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative group -mt-16">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full ring-4 ring-(--card) shadow-xl overflow-hidden bg-(--muted)">
                  {fotoResolvida.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoResolvida}
                      alt={usuario?.nome || "Foto de Perfil"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src={fotoResolvida}
                      alt={usuario?.nome || "Foto de Perfil"}
                      fill
                      sizes="128px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}
                  {uploadandoFoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs text-white">
                      <Loader2 className="h-7 w-7 animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadandoFoto}
                  title="Fazer upload de nova foto"
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-(--primary) text-white shadow-lg ring-2 ring-(--card) transition hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* NOME E INFOS — ficam abaixo do banner, ao lado do avatar */}
              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--foreground)">
                    {usuario?.nome}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${
                      tipoNome === "Administrador"
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        : tipoNome === "Técnico"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    {tipoNome}
                  </span>
                </div>

                <p className="text-sm text-(--muted-foreground) flex items-center justify-center sm:justify-start gap-2">
                  <span>{usuario?.cargo || "Colaborador"}</span>
                  {usuario?.setor && (
                    <>
                      <span>•</span>
                      <span>{usuario?.setor}</span>
                    </>
                  )}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-(--muted-foreground)">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-(--primary)" />
                    {dataFormatada}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Bucket Conectado
                  </span>
                </div>
              </div>
            </div>

            {/* AÇÕES RÁPIDAS NO HEADER — removidas: câmera no avatar já faz upload, abas já navegam para editar */}
          </div>

          {/* NAVEGAÇÃO DE ABAS */}
          <div className="mt-8 flex items-center gap-2 border-b border-(--border) overflow-x-auto">
            <button
              onClick={() => setAbaAtiva("visao-geral")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                abaAtiva === "visao-geral"
                  ? "border-(--primary) text-(--primary)"
                  : "border-transparent text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              <User className="h-4 w-4" />
              Visão Geral
            </button>
            <button
              onClick={() => setAbaAtiva("editar")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                abaAtiva === "editar"
                  ? "border-(--primary) text-(--primary)"
                  : "border-transparent text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              <Edit3 className="h-4 w-4" />
              Editar Informações
            </button>
            <button
              onClick={() => setAbaAtiva("seguranca")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                abaAtiva === "seguranca"
                  ? "border-(--primary) text-(--primary)"
                  : "border-transparent text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              <KeyRound className="h-4 w-4" />
              Segurança & Senha
            </button>
          </div>
        </div>
      </motion.div>

      {/* FEEDBACK TOASTS */}
      <AnimatePresence>
        {mensagemSucesso && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            <p className="text-sm font-medium">{mensagemSucesso}</p>
          </motion.div>
        )}
        {mensagemErro && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-300"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-medium">{mensagemErro}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      {abaAtiva === "visao-geral" && (
        <motion.div
          key="visao-geral"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* INFORMAÇÕES PESSOAIS & CONTATO */}
          <div className="rounded-3xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-(--border) pb-4">
              <div>
                <h2 className="text-base font-semibold text-(--foreground)">Informações Pessoais & Contato</h2>
                <p className="text-xs text-(--muted-foreground)">Dados cadastrais registrados no Nuvio</p>
              </div>
              <button
                onClick={() => setAbaAtiva("editar")}
                className="text-xs font-medium text-(--primary) hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" /> Editar
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-(--muted-foreground)">
                  <User className="h-3.5 w-3.5 text-(--primary)" /> Nome Completo
                </div>
                <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.nome || "—"}</p>
              </div>

              <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-(--primary)" /> E-mail
                  </span>
                  <button type="button" onClick={() => usuario?.email && copiarTexto(usuario.email, "email")} className="cursor-pointer hover:text-(--foreground)">
                    {copiadoCampo === "email" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="mt-1 text-sm font-semibold text-(--foreground) truncate">{usuario?.email || "—"}</p>
              </div>

              <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-(--primary)" /> Telefone
                  </span>
                  {usuario?.telefone && (
                    <button type="button" onClick={() => copiarTexto(usuario.telefone!, "tel")} className="cursor-pointer hover:text-(--foreground)">
                      {copiadoCampo === "tel" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.telefone || "Não informado"}</p>
              </div>

              <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-(--muted-foreground)">
                  <Briefcase className="h-3.5 w-3.5 text-(--primary)" /> Cargo
                </div>
                <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.cargo || "Não definido"}</p>
              </div>

              <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-(--muted-foreground)">
                  <Building2 className="h-3.5 w-3.5 text-(--primary)" /> Setor
                </div>
                <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.setor || "Não definido"}</p>
              </div>

              <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                <div className="flex items-center gap-1.5 text-xs text-(--muted-foreground)">
                  <ShieldCheck className="h-3.5 w-3.5 text-(--primary)" /> Nível de Acesso
                </div>
                <p className="mt-1 text-sm font-semibold text-(--foreground)">ID #{usuario?.id} • {tipoNome}</p>
              </div>
            </div>
          </div>

          {/* ATALHOS RÁPIDOS */}
          <div className="rounded-3xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-(--foreground)">Atalhos Rápidos</h3>
            <div className="mt-3 space-y-2">
              <Link
                href="/portal"
                className="flex items-center justify-between p-3 rounded-2xl bg-(--muted)/40 hover:bg-(--hoverbg) border border-transparent hover:border-(--border) transition text-xs font-medium text-(--foreground)"
              >
                <span>Portal do Cliente</span>
                <ArrowUpRight className="h-4 w-4 text-(--muted-foreground)" />
              </Link>
              <Link
                href="/tickets"
                className="flex items-center justify-between p-3 rounded-2xl bg-(--muted)/40 hover:bg-(--hoverbg) border border-transparent hover:border-(--border) transition text-xs font-medium text-(--foreground)"
              >
                <span>Central de Chamados</span>
                <ArrowUpRight className="h-4 w-4 text-(--muted-foreground)" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
          {/* COLUNA ESQUERDA (2 colunas no desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* CARDS DE ESTATÍSTICAS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="rounded-2xl border border-(--card-border) bg-(--card) p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-(--muted-foreground)">Total</span>
                  <Ticket className="h-4 w-4 text-(--primary)" />
                </div>
                <p className="mt-2 text-2xl font-bold text-(--foreground)">{stats.total}</p>
                <p className="text-[11px] text-(--muted-foreground)">Chamados gerais</p>
              </div>

              <div className="rounded-2xl border border-(--card-border) bg-(--card) p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-(--muted-foreground)">Abertos</span>
                  <AlertCircle className="h-4 w-4 text-sky-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">{stats.abertos}</p>
                <p className="text-[11px] text-(--muted-foreground)">Em fila</p>
              </div>

              <div className="rounded-2xl border border-(--card-border) bg-(--card) p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-(--muted-foreground)">Em Progresso</span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.emAtendimento}</p>
                <p className="text-[11px] text-(--muted-foreground)">Em atendimento</p>
              </div>

              <div className="rounded-2xl border border-(--card-border) bg-(--card) p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-(--muted-foreground)">Resolvidos</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.resolvidos}</p>
                <p className="text-[11px] text-(--muted-foreground)">Finalizados</p>
              </div>
            </div>

            {/* CARTÃO DE DADOS DO USUÁRIO */}
            <div className="rounded-3xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-(--border) pb-4">
                <div>
                  <h2 className="text-base font-semibold text-(--foreground)">Informações Pessoais & Contato</h2>
                  <p className="text-xs text-(--muted-foreground)">Dados cadastrais registrados no Nuvio</p>
                </div>
                <button
                  onClick={() => setAbaAtiva("editar")}
                  className="text-xs font-medium text-(--primary) hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Editar
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                  <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-(--primary)" /> Nome Completo
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.nome || "—"}</p>
                </div>

                {/* Email */}
                <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                  <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-(--primary)" /> E-mail Corporativo
                    </span>
                    <button
                      type="button"
                      onClick={() => usuario?.email && copiarTexto(usuario.email, "email")}
                      title="Copiar e-mail"
                      className="text-xs text-(--muted-foreground) hover:text-(--foreground) cursor-pointer"
                    >
                      {copiadoCampo === "email" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-(--foreground) truncate">{usuario?.email || "—"}</p>
                </div>

                {/* Telefone */}
                <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                  <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-(--primary)" /> Telefone / WhatsApp
                    </span>
                    {usuario?.telefone && (
                      <button
                        type="button"
                        onClick={() => copiarTexto(usuario.telefone!, "tel")}
                        title="Copiar telefone"
                        className="text-xs text-(--muted-foreground) hover:text-(--foreground) cursor-pointer"
                      >
                        {copiadoCampo === "tel" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.telefone || "Não informado"}</p>
                </div>

                {/* Cargo */}
                <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                  <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-(--primary)" /> Cargo / Função
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.cargo || "Não definido"}</p>
                </div>

                {/* Setor */}
                <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                  <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-(--primary)" /> Departamento / Setor
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">{usuario?.setor || "Não definido"}</p>
                </div>

                {/* ID & Perfil */}
                <div className="rounded-2xl border border-(--border)/60 bg-(--muted)/40 p-4">
                  <div className="flex items-center justify-between text-xs text-(--muted-foreground)">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-(--primary)" /> Identificador & Nível
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">
                    ID #{usuario?.id} • {tipoNome}
                  </p>
                </div>
              </div>
            </div>

            {/* ATIVIDADE RECENTE / TICKETS */}
            <div className="rounded-3xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-(--border) pb-4">
                <div>
                  <h2 className="text-base font-semibold text-(--foreground)">Chamados Recentes</h2>
                  <p className="text-xs text-(--muted-foreground)">Histórico recente de tickets associados</p>
                </div>
                <Link
                  href="/tickets"
                  className="text-xs font-medium text-(--primary) hover:underline flex items-center gap-1"
                >
                  Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-(--border)">
                {tickets.length > 0 ? (
                  tickets.slice(0, 4).map((ticket) => (
                    <div key={ticket.idTicket} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-(--foreground) truncate">{ticket.titulo}</p>
                        <p className="text-xs text-(--muted-foreground) mt-0.5">
                          Ticket #{ticket.idTicket} • Prioridade {ticket.prioridade}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          ticket.statusTicket === "Aberto"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                            : ticket.statusTicket === "Em atendimento"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {ticket.statusTicket}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-(--muted-foreground)">
                    Nenhum chamado recente localizado.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA (1 coluna) */}
          <div className="space-y-6">

            {/* CARD DE STATUS DA CONTA */}
            <div className="rounded-3xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-(--foreground) flex items-center gap-2">
                <Shield className="h-4 w-4 text-(--primary)" />
                Privilégios & Acesso
              </h3>
              <p className="mt-1 text-xs text-(--muted-foreground)">
                Permissões concedidas ao seu perfil no sistema Nuvio.
              </p>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-(--foreground)">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Abertura e acompanhamento de tickets</span>
                </div>

                {tipoNome === "Administrador" && (
                  <>
                    <div className="flex items-center gap-2.5 text-xs text-(--foreground)">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Gestão completa de usuários & equipes</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-(--foreground)">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Configuração de SLA & Categorias</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-(--foreground)">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Relatórios analíticos e métricas avançadas</span>
                    </div>
                  </>
                )}

                {tipoNome === "Técnico" && (
                  <>
                    <div className="flex items-center gap-2.5 text-xs text-(--foreground)">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Triagem, atendimento e resolução de chamados</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-(--foreground)">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>Interação no Chat ao Vivo e E-mail</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-(--border)">
                <Link
                  href="/settings"
                  className="flex items-center justify-between text-xs font-medium text-(--muted-foreground) hover:text-(--foreground) transition"
                >
                  <span>Preferências do Sistema</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* CARD DE ATALHOS RÁPIDOS */}
            <div className="rounded-3xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-(--foreground)">Atalhos Rápidos</h3>
              <div className="mt-3 space-y-2">
                <Link
                  href="/portal"
                  className="flex items-center justify-between p-3 rounded-2xl bg-(--muted)/40 hover:bg-(--hoverbg) border border-transparent hover:border-(--border) transition text-xs font-medium text-(--foreground)"
                >
                  <span>Portal do Cliente</span>
                  <ArrowUpRight className="h-4 w-4 text-(--muted-foreground)" />
                </Link>
                <Link
                  href="/tickets"
                  className="flex items-center justify-between p-3 rounded-2xl bg-(--muted)/40 hover:bg-(--hoverbg) border border-transparent hover:border-(--border) transition text-xs font-medium text-(--foreground)"
                >
                  <span>Central de Chamados</span>
                  <ArrowUpRight className="h-4 w-4 text-(--muted-foreground)" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ABA DE EDIÇÃO */}
      {abaAtiva === "editar" && (
        <motion.div
          key="editar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-(--card-border) bg-(--card) p-6 sm:p-8 shadow-sm"
        >
          <div className="border-b border-(--border) pb-5">
            <h2 className="text-lg font-bold text-(--foreground)">Editar Informações do Perfil</h2>
            <p className="text-xs text-(--muted-foreground) mt-1">
              Atualize sua foto de exibição, nome, contato e setor corporativo.
            </p>
          </div>

          <form onSubmit={handleSalvarPerfil} className="mt-6 space-y-6">
            {/* SELEÇÃO DE AVATAR / UPLOAD PARA BUCKET */}
            <div>
              <label className="block text-xs font-semibold text-(--foreground) mb-2">
                Foto de Perfil & Bucket
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-(--muted)/30 border border-(--border)">
                <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-(--primary) bg-(--muted) shrink-0">
                  {fotoResolvida.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoResolvida}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={fotoResolvida}
                      alt="Preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                  {uploadandoFoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadandoFoto}
                      className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-3.5 py-2 text-xs font-medium text-(--primary-foreground) transition hover:bg-(--primary-hover) cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      {uploadandoFoto ? "Enviando imagem..." : "Upload do Computador"}
                    </button>
                    <input
                      type="text"
                      placeholder="Ou cole a URL da sua foto (ex: https://...)"
                      value={formFoto}
                      onChange={(e) => setFormFoto(e.target.value)}
                      className="flex-1 min-w-[200px] rounded-xl border border-(--border) bg-(--background) px-3.5 py-2 text-xs text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] text-(--muted-foreground) mb-1.5">Ou escolha um avatar pré-definido:</p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormFoto(url)}
                          className={`relative h-9 w-9 shrink-0 rounded-full overflow-hidden ring-2 transition cursor-pointer ${
                            formFoto === url ? "ring-(--primary) scale-110" : "ring-transparent hover:opacity-80"
                          }`}
                        >
                          <Image src={url} alt={`Avatar ${idx + 1}`} fill sizes="36px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CAMPOS EM GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-(--foreground) mb-1.5">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-(--muted-foreground)" />
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="w-full rounded-xl border border-(--border) bg-(--background) pl-10 pr-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-(--foreground) mb-1.5">
                  E-mail Corporativo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-(--muted-foreground)" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-(--border) bg-(--background) pl-10 pr-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                    placeholder="seu.email@empresa.com"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-semibold text-(--foreground) mb-1.5">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-(--muted-foreground)" />
                  <input
                    type="text"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    className="w-full rounded-xl border border-(--border) bg-(--background) pl-10 pr-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-xs font-semibold text-(--foreground) mb-1.5">
                  Cargo / Função
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-2.5 h-4 w-4 text-(--muted-foreground)" />
                  <input
                    type="text"
                    value={formCargo}
                    onChange={(e) => setFormCargo(e.target.value)}
                    className="w-full rounded-xl border border-(--border) bg-(--background) pl-10 pr-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                    placeholder="Ex: Analista de Suporte"
                  />
                </div>
              </div>

              {/* Setor */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-(--foreground) mb-1.5">
                  Departamento / Setor
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-2.5 h-4 w-4 text-(--muted-foreground)" />
                  <input
                    type="text"
                    value={formSetor}
                    onChange={(e) => setFormSetor(e.target.value)}
                    className="w-full rounded-xl border border-(--border) bg-(--background) pl-10 pr-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                    placeholder="Ex: Tecnologia da Informação"
                  />
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border)">
              <button
                type="button"
                onClick={() => setAbaAtiva("visao-geral")}
                className="rounded-xl border border-(--border) bg-(--card) px-4 py-2.5 text-sm font-medium text-(--foreground) hover:bg-(--hoverbg) transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando || uploadandoFoto}
                className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-(--primary-foreground) shadow transition hover:bg-(--primary-hover) disabled:opacity-50 cursor-pointer"
              >
                {salvando ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ABA DE SEGURANÇA */}
      {abaAtiva === "seguranca" && (
        <motion.div
          key="seguranca"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-(--card-border) bg-(--card) p-6 sm:p-8 shadow-sm"
        >
          <div className="border-b border-(--border) pb-5">
            <h2 className="text-lg font-bold text-(--foreground)">Segurança & Alteração de Senha</h2>
            <p className="text-xs text-(--muted-foreground) mt-1">
              Mantenha sua conta protegida utilizando uma senha forte e segura.
            </p>
          </div>

          <AnimatePresence>
            {senhaSucesso && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-sm font-medium">{senhaSucesso}</p>
              </motion.div>
            )}
            {senhaErro && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-300"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="text-sm font-medium">{senhaErro}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAlterarSenha} className="mt-6 space-y-5 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-(--foreground) mb-1.5">
                Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-(--muted-foreground)" />
                <input
                  type={verSenha ? "text" : "password"}
                  required
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-(--border) bg-(--background) pl-10 pr-10 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(!verSenha)}
                  className="absolute right-3 top-2.5 text-(--muted-foreground) hover:text-(--foreground) cursor-pointer"
                >
                  {verSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--foreground) mb-1.5">
                Confirmar Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-(--muted-foreground)" />
                <input
                  type={verSenha ? "text" : "password"}
                  required
                  value={senhaConfirmacao}
                  onChange={(e) => setSenhaConfirmacao(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-xl border border-(--border) bg-(--background) pl-10 pr-10 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--ring) focus:ring-2 focus:ring-(--ring)/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={salvandoSenha}
                className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-medium text-(--primary-foreground) shadow transition hover:bg-(--primary-hover) disabled:opacity-50 cursor-pointer"
              >
                {salvandoSenha ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Atualizando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Atualizar Senha
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
