"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { apiFetch, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { NuvioBadge } from "@/components/ui/NuvioBadge";

type Status = "online" | "ausente" | "ocupado" | "offline";

const STATUS_CONFIG: Record<Status, { label: string; color: string; ring: string }> = {
    online:  { label: "Online",  color: "bg-emerald-500", ring: "ring-emerald-500" },
    ausente: { label: "Ausente", color: "bg-yellow-400",  ring: "ring-yellow-400"  },
    ocupado: { label: "Ocupado", color: "bg-red-500",     ring: "ring-red-500"     },
    offline: { label: "Offline", color: "bg-zinc-400",    ring: "ring-zinc-400"    },
};

const STATUS_STORAGE_KEY = "nuvio_user_status";

export function Profile() {
    const [open, setOpen] = useState(false);
    const { usuario, logout } = useAuth();
    const [nome, setNome] = useState<string | null>(null);
    const [foto, setFoto] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>("online");

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Carrega status salvo no localStorage
    useEffect(() => {
        const salvo = localStorage.getItem(STATUS_STORAGE_KEY) as Status | null;
        if (salvo && salvo in STATUS_CONFIG) setStatus(salvo);
    }, []);

    useEffect(() => {
        if (usuario?.nome) setNome(usuario.nome);
        if (usuario?.fotoPerfil) {
            const fotoVal = usuario.fotoPerfil;
            if (fotoVal.startsWith("http") || fotoVal.startsWith("data:")) {
                setFoto(fotoVal);
            } else {
                setFoto(`${API_URL}${fotoVal.startsWith("/") ? "" : "/"}${fotoVal}`);
            }
        }

        (async () => {
            try {
                const dados = await apiFetch<any>("/auth/verificar", { method: "GET" });
                const u = dados.usuario ?? dados;
                if (u?.nome) setNome(u.nome);
                const fotoVal = u?.fotoPerfil || u?.fotoperfil || null;
                if (fotoVal) {
                    if (fotoVal.startsWith("http") || fotoVal.startsWith("data:")) {
                        setFoto(fotoVal);
                    } else {
                        setFoto(`${API_URL}${fotoVal.startsWith("/") ? "" : "/"}${fotoVal}`);
                    }
                }
            } catch {
                // ignora
            }
        })();

        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [usuario]);

    function trocarStatus(novoStatus: Status) {
        setStatus(novoStatus);
        localStorage.setItem(STATUS_STORAGE_KEY, novoStatus);
    }

    const cfg = STATUS_CONFIG[status];
    const srcFoto = foto ?? "/balls.jpeg";

    return (
        <div ref={dropdownRef} className="relative">
            {/* BOTÃO DO AVATAR */}
            <button
                onClick={() => setOpen(!open)}
                aria-label="Abrir menu do perfil"
                className="relative cursor-pointer rounded-full p-0.5 bg-white/50 hover:bg-white/70 transition-colors"
            >
                {/* AVATAR */}
                <div className={`rounded-full ring-2 ring-offset-1 ring-offset-transparent ${cfg.ring} transition-all duration-300`}>
                    {srcFoto.startsWith("data:") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={srcFoto}
                            alt="Foto de Perfil"
                            className="w-10 h-10 rounded-full object-cover block"
                        />
                    ) : (
                        <Image
                            src={srcFoto}
                            alt="Foto de Perfil"
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                        />
                    )}
                </div>

                {/* BOLINHA DE STATUS */}
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${cfg.color} transition-colors duration-300`}
                />
            </button>

            {/* DROPDOWN */}
            {open && (
                <div className="absolute right-0 top-14 w-60 bg-(--card) border border-(--card-border) rounded-2xl shadow-xl z-50 flex flex-col p-2 gap-1">

                    {/* INFO DO USUÁRIO */}
                    <div className="px-2.5 py-2 border-b border-(--border) mb-1">
                        <div className="flex min-w-0 items-center gap-1.5 truncate font-semibold text-sm text-(--foreground)">
                            <span className="truncate">{nome || usuario?.nome || "Meu Perfil"}</span>
                            <NuvioBadge tipo={usuario?.tipo} />
                        </div>
                        <div className="text-xs text-(--muted-foreground) truncate">
                            {usuario?.email || "Conectado"}
                        </div>
                    </div>

                    {/* SELETOR DE STATUS */}
                    <div className="px-1 pb-1 border-b border-(--border) mb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground) px-2 pb-1">
                            Status
                        </p>
                        {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, val]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => trocarStatus(key)}
                                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-sm transition-colors cursor-pointer
                                    ${status === key
                                        ? "bg-(--hoverbg) text-(--foreground) font-medium"
                                        : "text-(--muted-foreground) hover:bg-(--hoverbg) hover:text-(--foreground)"
                                    }`}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${val.color}`} />
                                {val.label}
                                {status === key && (
                                    <span className="ml-auto text-[10px] text-(--primary)">✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* LINKS */}
                    <Link
                        href="/perfil"
                        onClick={() => setOpen(false)}
                        className="w-full px-3 py-2 text-sm text-(--foreground) rounded-xl hover:bg-(--hoverbg) transition-colors flex items-center gap-2"
                    >
                        <span>👤</span> Meu Perfil
                    </Link>

                    <Link
                        href="/portal"
                        onClick={() => setOpen(false)}
                        className="w-full px-3 py-2 text-sm text-(--foreground) rounded-xl hover:bg-(--hoverbg) transition-colors flex items-center gap-2"
                    >
                        <span>🌐</span> Portal do Cliente
                    </Link>

                    <Link
                        href="/admin/dashboard"
                        onClick={() => setOpen(false)}
                        className="w-full px-3 py-2 text-sm text-(--foreground) rounded-xl hover:bg-(--hoverbg) transition-colors flex items-center gap-2"
                    >
                        <span>🛡️</span> Painel Admin
                    </Link>

                    <button
                        type="button"
                        onClick={() => { setOpen(false); logout("/login"); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                        <span>🚪</span> Sair
                    </button>
                </div>
            )}
        </div>
    );
}
