import { SignJWT, jwtVerify } from "jose";

// Em produção, use uma variável de ambiente: process.env.JWT_SECRET_KEY
// Nunca deixe a chave hardcoded em produção!
const SECRET_KEY = process.env.JWT_SECRET_KEY || "nuvio_secret_key_2025_troque_isso";
const key = new TextEncoder().encode(SECRET_KEY);

export async function signJWT(payload: any, expiresIn = "8h") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null; // Retorna null se for inválido, expirado, etc.
  }
}
