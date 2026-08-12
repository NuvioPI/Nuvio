"use client";

import { Bell } from "@/components/animate-ui/icons/bell";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    style: ["italic"],
});

import {
    useEffect,
    useRef,
    useState
} from "react";

import { apiFetch } from "@/lib/api";

export function Notifications() {
    const [open, setOpen] = useState(false);
    const [notificacoes, setNotificacoes] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // buscar notificações
        (async () => {
            try {
                const dados = await apiFetch<any>("/notificacoes", { method: "GET" });
                setNotificacoes(dados.notificacoes || []);
                setUnreadCount(dados.unreadCount || 0);
            } catch (err) {
                // falha silenciosa
                console.warn('Erro ao buscar notificações', err);
            }
        })();

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        
        <div ref={dropdownRef} className="relative">
        
        <AnimateIcon animateOnHover>
        
        <button onClick={() => setOpen(!open)}>
        <div  
        className="py-2 px-4 rounded-full bg-(--notification-bg) cursor-pointer outline-2 outline-offset-2 outline-(--notification-outline) hover:outline-3 transition-all duration-300 ease-in-out flex items-center gap-2 text-(--notification-text)">
            <Bell  className={"w-5 h-5"}/>
            <span>{unreadCount > 0 ? `Você tem ${unreadCount} novas notificações` : `Sem notificações`}</span>
        </div>
        </button>
        </AnimateIcon>

        {open && (
            <div 
            className="
            w-full h-auto absolute right-0 
            mt-3 
            bg-(--card) 
            rounded-lg shadow-lg 
            border border-(--card-border)
            z-10">


            <div 
            className="p-4">

                <h3 
                className={`
                font-bold ${playfairDisplay.className} 
                `}
                >Notificações</h3>
                
                <ul className="mt-2 space-y-2">
                    {notificacoes.length === 0 && <p>Sem notificações.</p>}
                    {notificacoes.map((n) => (
                        <li key={n.idNotificacao} className="p-2 rounded hover:bg-(--hoverbg)">
                            <div className="flex justify-between items-start">
                                <div>
                                    <strong>{n.titulo}</strong>
                                    <p className="text-sm">{n.mensagem}</p>
                                </div>
                                <div className="text-xs text-(--muted)">{new Date(n.dataCriacao).toLocaleString()}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            </div>
        )}
        </div>
    );
}