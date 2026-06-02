export default function inputUser() {
  return (
    <div className="flex flex-col">
      <label className="text-(--foreground) font-medium">User</label>
      <input
        type="text"
        className="bg-transparent border border-(--input-border) rounded px-4 py-2 text-(--foreground) focus:outline-none focus:ring-2 focus:ring-black transition-all"
        placeholder="Digite o nome de usuário aqui"
      />
    </div>
  );

}