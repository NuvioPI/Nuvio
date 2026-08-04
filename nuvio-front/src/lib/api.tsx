const DEFAULT_API_URL = "http://localhost/nuvio-back/routes/api.php";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
