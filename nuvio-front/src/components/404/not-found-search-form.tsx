"use client";

export function NotFoundSearchForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
      <input
        type="text"
        placeholder="Pesquisar por artigos, chamados ou ajuda..."
        className="flex-1 bg-[var(--searchbar-bg)] border border-[var(--searchbar-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--searchbar-text)] placeholder-[var(--searchbar-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--searchbar-focus-ring)] transition-all"
      />
      <button
        type="submit"
        className="bg-[var(--button-bg)] hover:bg-[var(--button-hover-bg)] text-[var(--button-foreground)] px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
      >
        Buscar
      </button>
    </form>
  );
}