import axios from "axios";
import { Readable } from "stream";

export async function scanWithStego(
  filename: string,
  mime: string,
  size: number,
  fileStream: Readable
) {
  // Example: send multipart form-data to Stego
  // Adapt to Stego's actual API contract.
  const form = new (require("form-data"))();
  form.append("file", fileStream, { filename, contentType: mime, knownLength: size });

  const resp = await axios.post(process.env.STEGO_SCAN_URL!, form, {
    headers: {
      ...form.getHeaders(),
      "Authorization": `Bearer ${process.env.STEGO_API_KEY}`
    },
    maxContentLength: size,
    maxBodyLength: Infinity,
    timeout: 60_000
  });
  return resp.data; // assume { verdict: "clean" | "malicious", details?: ... }
}
