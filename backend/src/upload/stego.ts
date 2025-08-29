// src/upload/stego.ts
import axios from "axios";
import { Readable } from "stream";
import FormData from "form-data";

/**
 * scanWithStego streams the file to Stego's scan endpoint and returns the response.
 * - filename, mime, size and a readable stream are passed in.
 * - The function returns whatever the Stego API returns; we assume an object
 *   with `verdict: "clean" | "malicious"` in this prototype.
 */
export async function scanWithStego(
  filename: string,
  mime: string,
  size: number,
  fileStream: Readable
) {
  const form = new FormData();
  // Note: fileStream must be a readable stream (busboy provides one)
  form.append("file", fileStream, { filename, contentType: mime, knownLength: size });

  const resp = await axios.post(process.env.STEGO_SCAN_URL!, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${process.env.STEGO_API_KEY}`
    },
    maxContentLength: size,
    maxBodyLength: Infinity,
    timeout: 60_000 // 60 seconds (tune as needed)
  });

  return resp.data;
}
