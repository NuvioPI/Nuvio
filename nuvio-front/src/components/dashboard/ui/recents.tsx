import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    style: ["italic"],
});

export default function Recents(){
    return (
        <div className="p-6 bg-(--card) border border-(--card-border) rounded-lg mt-10">
            <h2 className="text-2xl font-semibold text-(--card-foreground) mb-4">Atividades Recentes</h2>
            
            <ul className="space-y-4">
                <li className="flex items-center gap-4">
                    <div className="w-1 h-5 bg-(--primary) rounded-full"></div>
                    <div>
                        <p className="text-(--foreground) font-medium"><span className={`font-bold ${playfairDisplay.className}`}>Gabriel</span> criou um novo ticket</p>
                        <p className="text-sm text-zinc-500">Agora mesmo</p>
                    </div>
                </li>
                
                <li className="flex items-center gap-4">
                    <div className="w-1 h-5 bg-(--primary) rounded-full"></div>
                    <div>
                        <p className="text-(--foreground) font-medium"><span className={`font-bold ${playfairDisplay.className}`}>Erick</span> Iniciou um ticket</p>
                        <p className="text-sm text-zinc-500">15 minutos atrás</p>
                    </div>
                </li>

                <li className="flex items-center gap-4">
                    <div className="w-1 h-5 bg-(--primary) rounded-full"></div>
                    <div>
                        <p className="text-(--foreground) font-medium">
                            <span 
                            className={`font-bold ${playfairDisplay.className}`}>Luiz</span> Mencionou um você no ticket <span className="font-bold text-[#0f6b2e] cursor-pointer hover:underline">#123</span> </p>
                        <p className="text-sm text-zinc-500">15 Horas atrás</p>
                    </div>
                </li>

                <li className="flex items-center gap-4">
                    <div className="w-1 h-5 bg-(--primary) rounded-full"></div>
                    <div>
                        <p className="text-(--foreground) font-medium"><span className={`font-bold ${playfairDisplay.className}`}>Marcela</span> Fechou um ticket</p>
                        <p className="text-sm text-zinc-500">Ontem</p>
                    </div>
                </li>
            </ul>

            <button className="text-(--primary) mt-4 hover:underline">Ver todos</button>

        </div>
    );
}