import WebSocket from "ws";
import type { SIPHeaders } from "../types/index.mjs";
import { extractSDP } from "./utils.mjs";
import { clients } from "../index.mjs";

export function handleSIPResponse(ws: WebSocket, msgStr: string, headers: SIPHeaders): void {
  const firstLine = msgStr.split("\n")[0];

  if (firstLine?.includes("100 Trying")) {
    console.log("🔄 Received: 100 Trying");
  } else if (firstLine?.includes("180 Ringing")) {
    console.log("📞 Received: 180 Ringing");
  } else if (firstLine?.includes("200 OK")) {
    console.log("✅ Handling 200 OK response...");

    const callId = headers["Call-ID"];
    const sdpBody = extractSDP(msgStr);

    if (!callId || !sdpBody) {
      ws.send(`SIP/2.0 400 Bad Request\r\n`);
      return;
    }

    const callerUsername = headers["From"]?.match(/sip:(\d+)@/)?.[1];
    const caller = callerUsername ? clients.get(callerUsername) : undefined;
    if (!caller) return;

    const responseMessage =
      `SIP/2.0 200 OK\r\n` +
      `Via: ${headers["Via"]}\r\n` +
      `To: ${headers["To"]}\r\n` +
      `From: ${headers["From"]}\r\n` +
      `Call-ID: ${callId}\r\n` +
      `CSeq: ${headers["CSeq"]}\r\n` +
      `Contact: ${headers["Contact"]}\r\n` +
      `Content-Type: application/sdp\r\n` +
      `Content-Length: ${sdpBody.length}\r\n\r\n` +
      sdpBody;

    caller.ws.send(responseMessage);
  } else {
    console.log(`ℹ️ Received SIP Response: ${firstLine}`);
  }
}
