export default function inputPassword() {
  return (
    <div className="flex flex-col">
      <label className="text-(--foreground) font-medium">Password</label>
      <input
        type="password"
        className="bg-transparent border border-(--input-border) rounded px-4 py-2 text-(--foreground) focus:outline-none focus:ring-2 focus:ring-black transition-all"
        placeholder="Digite a senha aqui"
      />
    </div>
  );
}