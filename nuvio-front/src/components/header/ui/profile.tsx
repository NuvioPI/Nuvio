"use client";

import Link from "next/link";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function Profile() {
    const [open, setOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="
                    bg-white/50
                    rounded-full
                    cursor-pointer
                    hover:bg-white/70
                    transition-colors
                "
            >
                <div
                    className="
                    w-2.5 h-2.5
                    bg-(--online)
                    rounded-full
                    absolute
                    top-8 right-0
                    outline-2
                    outline-(--sidebar)
                "
                />

                <Image
                    className="
                    rounded-full
                    outline-2
                    outline-offset-2
                    outline-(--online)
                    active:outline-3
                    transition-all
                    duration-300
                    ease-in-out
                "
                    src="/balls.jpeg"
                    alt="Foto de Perfil"
                    width={40}
                    height={40}
                />
            </button>

            {open && (
                <div
                    className="
                        flex flex-col justify-start items-start
                        p-4
                        gap-2
                        absolute
                        right-0
                        top-14
                        w-56
                        bg-(--card)
                        border border-(--card-border)
                        rounded-2xl
                        p-2
                        shadow-xl
                        z-50
                    "
                >
                    <Link href="/perfil" className="dropdown-item block w-full">
                        Meu Perfil
                    </Link>

                    <Link href="/portal-cliente" className="dropdown-item block w-full">
                        Portal do Cliente
                    </Link>

                    <Link href="/admin/login" className="dropdown-item block w-full">
                        Admin
                    </Link>

                    <Link
                        href="/"
                        className="
                        block
                        dropdown-item
                        text-red-500
                        w-full"
                    >
                        Sair
                    </Link>
                </div>
            )}
        </div>
    );
}
