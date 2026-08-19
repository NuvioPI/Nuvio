"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { apiFetch, API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function Profile() {
    const [open, setOpen] = useState(false);
    const { usuario, logout } = useAuth();
    const [nome, setNome] = useState<string | null>(null);
    const [foto, setFoto] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (usuario?.nome) {
            setNome(usuario.nome);
        }
        if (usuario?.fotoPerfil) {
            const fotoVal = usuario.fotoPerfil;
            if (fotoVal.startsWith('http') || fotoVal.startsWith('data:')) {
                setFoto(fotoVal);
            } else {
                setFoto(`${API_URL}${fotoVal.startsWith('/') ? '' : '/'}${fotoVal}`);
            }
        }

        (async () => {
            try {
                const dados = await apiFetch<any>("/auth/verificar", { method: "GET" });
                const u = dados.usuario ?? dados;
                if (u?.nome) setNome(u.nome);
                const fotoVal = u?.fotoPerfil || u?.fotoperfil || null;
                if (fotoVal) {
                    if (fotoVal.startsWith('http') || fotoVal.startsWith('data:')) {
                        setFoto(fotoVal);
                    } else {
                        setFoto(`${API_URL}${fotoVal.startsWith('/') ? '' : '/'}${fotoVal}`);
                    }
                }
            } catch (err) {
                // ignora
            }
        })();

        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [usuario]);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="
                    relative
                    bg-white/50
                    rounded-full
                    cursor-pointer
                    hover:bg-white/70
                    transition-colors
                    p-0.5
                "
                aria-label="Abrir menu do perfil"
            >
                <div
                    className="
                    w-2.5 h-2.5
                    bg-(--online)
                    rounded-full
                    absolute
                    bottom-0 right-0
                    outline-2
                    outline-(--sidebar)
                "
                />

                {foto && foto.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        className="rounded-full object-cover w-10 h-10"
                        src={foto}
                        alt="Foto de Perfil"
                    />
                ) : (
                    <Image
                        className="
                        rounded-full
                        object-cover
                        outline-2
                        outline-offset-2
                        outline-(--online)
                        active:outline-3
                        transition-all
                        duration-300
                        ease-in-out
                    "
                        src={foto ?? "/balls.jpeg"}
                        alt="Foto de Perfil"
                        width={40}
                        height={40}
                    />
                )}
            </button>

            {open && (
                <div
                    className="
                        flex flex-col justify-start items-start
                        p-2
                        gap-1
                        absolute
                        right-0
                        top-14
                        w-56
                        bg-(--card)
                        border border-(--card-border)
                        rounded-2xl
                        shadow-xl
                        z-50
                    "
                >
                    <div className="block w-full p-2.5 border-b border-(--border)">
                        <div className="font-semibold text-sm text-(--foreground) truncate">{nome || usuario?.nome || "Meu Perfil"}</div>
                        <div className="text-xs text-(--muted-foreground) truncate">{usuario?.email || "Conectado"}</div>
                    </div>

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
                        onClick={() => {
                            setOpen(false);
                            logout('/login');
                        }}
                        className="
                        w-full text-left px-3 py-2 text-sm
                        text-red-500
                        rounded-xl
                        hover:bg-red-500/10
                        transition-colors
                        cursor-pointer
                        flex items-center gap-2"
                    >
                        <span>🚪</span> Sair
                    </button>
                </div>
            )}
        </div>
    );
}
