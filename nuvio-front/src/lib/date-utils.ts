const FUSO_EXIBICAO = "America/Sao_Paulo";

export function dataDoBackend(valor: string | null | undefined) {
  if (!valor) return null;

  const texto = String(valor).trim();
  if (!texto) return null;

  const temFuso = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(texto);
  const iso = texto.includes("T") ? texto : texto.includes(" ") ? texto.replace(" ", "T") : `${texto}T00:00:00`;
  const data = new Date(temFuso ? iso : `${iso}Z`);

  return Number.isFinite(data.getTime()) ? data : null;
}

export function timestampDoBackend(valor: string | null | undefined) {
  return dataDoBackend(valor)?.getTime() ?? Number.NaN;
}

export function formatarDataBackend(
  valor: string | null | undefined,
  opcoes: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short" }
) {
  const data = dataDoBackend(valor);
  if (!data) return "Data indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    ...opcoes,
    timeZone: FUSO_EXIBICAO,
  }).format(data);
}
