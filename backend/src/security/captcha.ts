// src/security/captcha.ts
import axios from "axios";

/**
 * verifyTurnstile - sends the token to Cloudflare to validate CAPTCHA.
 * In dev you may accept a 'dev-token' server-side if desired.
 */
export async function verifyTurnstile(token: string, remoteIp?: string) {
  // Accept a dev token in local dev (optional)
  if (token === "dev-token" && process.env.NODE_ENV !== "production") {
    return true;
  }

  const params = new URLSearchParams();
  params.append("secret", process.env.TURNSTILE_SECRET!);
  params.append("response", token);
  if (remoteIp) params.append("remoteip", remoteIp);

  const { data } = await axios.post(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    params
  );
  return !!data.success;
}
