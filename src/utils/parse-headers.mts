import type { SIPHeaders } from "../types/index.mjs";

export function parseSIPHeaders(sipMessage: string): SIPHeaders {
  const headers: SIPHeaders = {};
  const lines = sipMessage.split("\n");

  for (const line of lines) {
    const match = line.match(/^([\w-]+):\s*(.*)/);
    if (match) {
      const header = match[1]!.trim();
      const value = match[2]!.trim();
      headers[header] = value;
    }
  }

  return headers;
}
