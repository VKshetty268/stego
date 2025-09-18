// src/services/stegoClient.ts
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

// --- Base URL (strip trailing slash if any) ---
const STEGO_BASE_URL =
  (process.env.STEGO_BASE_URL || "http://stegoe-stego-qvc3v54pb5af-21957659.us-east-1.elb.amazonaws.com")
    .replace(/\/+$/, "");

const AGENT_IDENTIFIER_TOKEN = process.env.STEGO_AGENT_TOKEN ; // one-time identifier token
const AGENT_NAME = process.env.STEGO_AGENT_NAME || "WEBAPP";

let cachedToken: string | null = null;
let tokenExpiry: Date | null = null;

/**
 * Request a fresh JWT from /auth/token
 */
export async function getAuthToken(): Promise<{ token: string; expiration_time: string }> {
  const url = `${STEGO_BASE_URL}/auth/token`;

  console.log("🔑 Requesting new auth token from", url);

  const response = await axios.post(
    url,
    {
      agent_identifier_token: AGENT_IDENTIFIER_TOKEN,
      agent_name: AGENT_NAME,
    },
    { headers: { "Content-Type": "application/json" } }
  );

  //Logging Token Response
  // console.log("✅ Token response:", response.data);

  return response.data;
}

/**
 * Ensure we have a valid token, refresh if expired
 */
export async function ensureToken(): Promise<string> {
  const now = new Date();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const { token, expiration_time } = await getAuthToken();
  cachedToken = token;
  tokenExpiry = new Date(expiration_time);

  return token;
}

/**
 * Sync scan API
 */
export async function stegoScanSync(filePath: string, filename: string) {
  const token = await ensureToken();
  const url = `${STEGO_BASE_URL}/api/scan`;

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("filename", filename);
  form.append("agent_name", AGENT_NAME); // ✅ required in body


  // Uncomment for logging in future
  // console.log("🚀 Calling SYNC scan:", url);
  // console.log("📌 Headers:", {
  //   Authorization: `Bearer ${token}`,
  //   ...form.getHeaders(),
  //   Accept: "application/json",
  // });

  const response = await axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    maxBodyLength: Infinity,
  });

  console.log("✅ Response status:", response.status);
  console.log("📄 Raw JSON:", JSON.stringify(response.data, null, 2));

  return response.data;
}

/**
 * Async scan API
 */
export async function stegoScanAsync(filePath: string, filename: string) {
  const token = await ensureToken();
  const url = `${STEGO_BASE_URL}/api/scan/async`;

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("filename", filename);
  form.append("agent_name", AGENT_NAME); // ✅ required in body

  console.log("🚀 Calling ASYNC scan:", url);

  const response = await axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    maxBodyLength: Infinity,
  });

  console.log("✅ Async scan started:", response.data);

  return response.data; // expected: { job_id: "..." }
}

/**
 * Get async scan report
 */
export async function stegoGetReport(jobId: string, pretty = false) {
  const token = await ensureToken();
  const url = `${STEGO_BASE_URL}/api/report/${jobId}`;

  console.log("📥 Fetching report for job:", jobId);

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (pretty) {
    console.log("📄 Async report:", JSON.stringify(response.data, null, 2));
  }

  return response.data;
}
