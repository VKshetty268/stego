import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let cached: { token: string; expiresAt: number } | null = null;

export async function getStegoToken(): Promise<string> {
  const now = Date.now();
  if (cached && now < cached.expiresAt - 60_000) {
    return cached.token;
  }

  const base = process.env.STEGO_BASE_URL!;
  const res = await axios.post(
    `${base}/auth/token`,
    {
      agent_identifier_token: process.env.STEGO_AGENT_IDENTIFIER_TOKEN,
      agent_name: process.env.STEGO_AGENT_NAME || "WEBAPP",
    },
    { headers: { "Content-Type": "application/json" } }
  );

  const token: string = res.data.token;
  const expStr: string | undefined = res.data.expiration_time;

  let expiresAt = now + 24 * 60 * 60 * 1000; // fallback
  if (expStr) {
    const parsed = new Date(expStr.endsWith("Z") ? expStr : `${expStr}Z`);
    if (!isNaN(parsed.getTime())) expiresAt = parsed.getTime();
  }

  cached = { token, expiresAt };
  return token;
}
