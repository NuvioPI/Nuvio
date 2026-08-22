const LOCAL_API_URL = "http://localhost:8000";
const PRODUCTION_API_URL = "https://nuvio-znvo.onrender.com";
const LEGACY_API_URL = "https://nuvio-yqqq.onrender.com";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
const isLegacyApi = configuredApiUrl === LEGACY_API_URL;

// Corrige automaticamente apenas a configuracao antiga do projeto oficial.
// Outros ambientes continuam livres para apontar para seus proprios backends.
const apiUrl =
  configuredApiUrl && !isLegacyApi
    ? configuredApiUrl
    : process.env.NODE_ENV === "production"
      ? PRODUCTION_API_URL
      : LOCAL_API_URL;

export const API_URL = apiUrl.replace(/\/$/, "");
