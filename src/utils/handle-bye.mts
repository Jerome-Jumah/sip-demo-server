import WebSocket from "ws";
import { clients } from "../index.mjs";
import type { SIPHeaders } from "../types/index.mjs";

export function handleBye(ws: WebSocket, headers: SIPHeaders): void {
  console.log("📞 Handling BYE...");
  const from = headers["From"];
  const to = headers["To"];
  const callId = headers["Call-ID"];

  if (!from || !to || !callId) {
    ws.send(JSON.stringify({ status: 400, message: "Bad Request: Missing required headers" }));
    return;
  }

  const otherUserUsername = to.match(/sip:(\d+)@/)?.[1];
  const otherUser = otherUserUsername ? clients.get(otherUserUsername) : undefined;

  if (!otherUser) {
    console.log("🚫 Other party not found, but ending call.");
    return;
  }

  const byeMessage =
    `BYE sip:${otherUserUsername}@server SIP/2.0\r\n` +
    `Via: ${headers["Via"]}\r\n` +
    `To: ${headers["To"]}\r\n` +
    `From: ${headers["From"]}\r\n` +
    `Call-ID: ${callId}\r\n` +
    `CSeq: ${headers["CSeq"]}\r\n` +
    `Content-Length: 0\r\n\r\n`;

  otherUser.ws.send(byeMessage);
  console.log("📞 BYE sent to the other party.");
}
