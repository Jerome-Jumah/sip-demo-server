import type { SIPHeaders } from "../types/index.mjs";
import WebSocket from "ws";
import { sendOptions } from "./send-options.mjs";
import { clients } from '../index.mjs';

export function handleRegister(ws: WebSocket, headers: SIPHeaders): void {
  console.log("Handling Register...");
  const sipUri = headers["Contact"];
  const username = headers["From"] ? headers["From"].match(/sip:([^@]+)@/)?.[1] ?? null : null;

  if (!sipUri || !username) {
    console.log("⚠️ Invalid registration request");
    ws.send(JSON.stringify({ status: 400, message: "Bad Request: Missing SIP URI or username" }));
    return;
  }

  clients.set(username, { ws, sipUri });

  ws.send(
    `SIP/2.0 200 OK\r\n` +
      `Via: ${headers["Via"]}\r\n` +
      `To: ${headers["To"]}\r\n` +
      `From: ${headers["From"]}\r\n` +
      `Call-ID: ${headers["Call-ID"]}\r\n` +
      `CSeq: ${headers["CSeq"]}\r\n` +
      `Contact: ${sipUri}\r\n` +
      `Expires: 3600\r\n` +
      `Content-Length: 0\r\n\r\n`
  );

  console.log(`✅ User Registered: ${username} (${sipUri})\n`);
  sendOptions(ws, sipUri, username);
}
