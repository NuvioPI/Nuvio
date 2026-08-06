"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, FileText, LifeBuoy, Search, ShieldCheck, TicketCheck, Wrench } from "lucide-react";

const categories = [
  { id: "todos", label: "Todos", icon: BookOpen },
  { id: "primeiros-passos", label: "Primeiros passos", icon: LifeBuoy },
  { id: "chamados", label: "Chamados", icon: TicketCheck },
  { id: "conta", label: "Conta e acesso", icon: ShieldCheck },
  { id: "solucoes", label: "Soluções técnicas", icon: Wrench },
];

const articles = [
  { id: 1, category: "primeiros-passos", title: "Como começar a usar a Nuvio", description: "Conheça os recursos principais para acompanhar seus atendimentos.", read: "3 min de leitura", updated: "Atualizado hoje", body: "A Nuvio reúne seus chamados, atualizações e documentos em um só lugar. Comece pelo Dashboard para ver o que precisa da sua atenção e use o botão Novo Chamado sempre que precisar de suporte." },
  { id: 2, category: "chamados", title: "Como abrir um novo chamado", description: "Envie sua solicitação com todas as informações necessárias para um atendimento ágil.", read: "2 min de leitura", updated: "Atualizado ontem", body: "Acesse Chamados e selecione Novo Chamado. Descreva o que aconteceu, inclua a categoria correta e, quando possível, adicione imagens ou arquivos que ajudem a equipe a entender a solicitação." },
  { id: 3, category: "chamados", title: "Acompanhar o status de um chamado", description: "Entenda os status e saiba quando há uma ação pendente da sua parte.", read: "4 min de leitura", updated: "Atualizado há 3 dias", body: "Cada chamado informa em qual etapa está: aberto, em atendimento, aguardando retorno, resolvido ou fechado. Você receberá um aviso quando houver uma atualização importante." },
  { id: 4, category: "conta", title: "Recuperar o acesso à sua conta", description: "Passos para redefinir sua senha e voltar a acessar a plataforma.", read: "2 min de leitura", updated: "Atualizado há 1 semana", body: "Na tela de acesso, selecione a opção para recuperar sua senha. Enviaremos um link para o e-mail profissional associado à sua conta. Se não tiver acesso ao e-mail, abra um chamado com a equipe responsável." },
  { id: 5, category: "solucoes", title: "Soluções rápidas para problemas de acesso", description: "Verificações simples antes de solicitar ajuda ao suporte técnico.", read: "5 min de leitura", updated: "Atualizado há 2 semanas", body: "Confirme sua conexão, tente acessar em uma janela anônima e limpe os dados do navegador. Se o problema continuar, registre um chamado e informe a mensagem de erro encontrada." },
  { id: 6, category: "primeiros-passos", title: "Personalizar suas notificações", description: "Escolha como receber avisos sobre chamados e atualizações.", read: "2 min de leitura", updated: "Atualizado há 2 semanas", body: "Em Configurações, abra a área de Notificações. Lá você pode ativar ou desativar e-mails sobre chamados, alertas dentro da plataforma e comunicações sobre novidades." },
];

export default function KnowledgeBasePage() {
  const [category, setCategory] = useState("todos");
  const [query, setQuery] = useState("");
  const [article, setArticle] = useState<(typeof articles)[number] | null>(null);
  const filtered = useMemo(() => articles.filter((item) => (category === "todos" || item.category === category) && `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [category, query]);

  if (article) return <ArticleView article={article} onBack={() => setArticle(null)} />;

  return <div className="mx-auto w-full max-w-7xl px-1 py-2 sm:px-2 sm:py-5">
    <section className="relative overflow-hidden rounded-3xl bg-(--primary) px-6 py-10 text-white sm:px-10 sm:py-14">
      <div className="relative z-10 mx-auto max-w-2xl text-center"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium"><BookOpen className="h-3.5 w-3.5" />Central de ajuda</span><h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Como podemos ajudar?</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/80">Encontre respostas, guias rápidos e soluções para aproveitar melhor a Nuvio.</p><div className="relative mt-7 text-left"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--muted-foreground)" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar na base de conhecimento..." className="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none shadow-lg placeholder:text-slate-400" /></div></div>
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" /><div className="absolute -bottom-28 -left-14 h-56 w-56 rounded-full bg-black/10" />
    </section>

    <div className="mt-8 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside><p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Categorias</p><nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">{categories.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setCategory(id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${category === id ? "bg-(--hoverbg) font-medium text-(--primary)" : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav></aside>
      <main><div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">{category === "todos" ? "Artigos em destaque" : categories.find((item) => item.id === category)?.label}</h2><p className="mt-1 text-sm text-(--muted-foreground)">{filtered.length} {filtered.length === 1 ? "resultado encontrado" : "resultados encontrados"}</p></div></div><div className="grid gap-4 sm:grid-cols-2">{filtered.map((item) => <button key={item.id} onClick={() => setArticle(item)} className="group rounded-2xl border border-(--card-border) bg-(--card) p-5 text-left shadow-(--shadow) transition hover:-translate-y-0.5 hover:border-(--primary)/50 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-(--hoverbg) p-2.5 text-(--primary)"><FileText className="h-5 w-5" /></span><ArrowRight className="h-4 w-4 text-(--muted-foreground) transition group-hover:translate-x-1 group-hover:text-(--primary)" /></div><h3 className="mt-5 text-base font-semibold text-(--foreground)">{item.title}</h3><p className="mt-2 text-sm leading-6 text-(--muted-foreground)">{item.description}</p><div className="mt-5 flex gap-3 text-xs text-(--muted-foreground)"><span>{item.read}</span><span>•</span><span>{item.updated}</span></div></button>)}</div>{filtered.length === 0 && <div className="rounded-2xl border border-dashed border-(--border) py-14 text-center"><Search className="mx-auto h-6 w-6 text-(--muted-foreground)" /><p className="mt-3 text-sm font-medium">Nenhum artigo encontrado</p><p className="mt-1 text-sm text-(--muted-foreground)">Tente buscar por outro termo ou categoria.</p></div>}</main>
    </div>
  </div>;
}

function ArticleView({ article, onBack }: { article: (typeof articles)[number]; onBack: () => void }) {
  const categoryName = categories.find((item) => item.id === article.category)?.label;
  return <article className="mx-auto max-w-3xl px-1 py-2 sm:px-2 sm:py-5"><button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"><ArrowLeft className="h-4 w-4" />Voltar para a base de conhecimento</button><p className="mt-9 text-sm font-medium text-(--primary)">{categoryName}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{article.title}</h1><div className="mt-4 flex gap-3 text-sm text-(--muted-foreground)"><span>{article.read}</span><span>•</span><span>{article.updated}</span></div><div className="mt-9 rounded-2xl border border-(--card-border) bg-(--card) p-6 text-[15px] leading-7 text-(--muted-foreground) shadow-(--shadow) sm:p-8"><p>{article.body}</p><h2 className="mt-8 text-lg font-semibold text-(--foreground)">Ainda precisa de ajuda?</h2><p className="mt-2">Se as instruções não resolverem sua dúvida, abra um novo chamado e nossa equipe continuará o atendimento.</p><button onClick={onBack} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-(--primary-foreground) transition hover:bg-(--primary-hover)">Ver outros artigos <ChevronRight className="h-4 w-4" /></button></div></article>;
}
