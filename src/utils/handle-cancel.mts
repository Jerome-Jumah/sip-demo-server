import WebSocket from "ws";
import { clients } from "../index.mjs";
import type { SIPHeaders } from "../types/index.mjs";

export function handleCancel(ws: WebSocket, headers: SIPHeaders): void {
  const callId = headers["Call-ID"];
  console.log(`🚫 Call Canceled: ${callId}`);

  const fromUser = headers["From"]!.match(/sip:(\d+)@/)?.[1];
  const toUser = headers["To"]!.match(/sip:(\d+)@/)?.[1];

  const response =
    `SIP/2.0 200 OK\r\n` +
    `Via: ${headers["Via"]}\r\n` +
    `To: ${headers["To"]}\r\n` +
    `From: ${headers["From"]}\r\n` +
    `Call-ID: ${callId}\r\n` +
    `CSeq: ${headers["CSeq"]}\r\n` +
    `Content-Length: 0\r\n\r\n`;

  ws.send(response);
  console.log(`✅ Sent 200 OK to acknowledge CANCEL from ${fromUser}`);

  if (toUser && fromUser && clients.has(fromUser)) {
    const callee = clients.get(fromUser);
    if (callee) {
      const terminatedResponse =
        `SIP/2.0 487 Request Terminated\r\n` +
        `Via: ${headers["Via"]}\r\n` +
        `To: ${headers["To"]}\r\n` +
        `From: ${headers["From"]}\r\n` +
        `Call-ID: ${callId}\r\n` +
        `CSeq: ${headers["CSeq"]}\r\n` +
        `Content-Length: 0\r\n\r\n`;

      callee.ws.send(terminatedResponse);
      console.log(`📴 Notified callee ${fromUser} that the call was canceled`);
    }
  }
}
