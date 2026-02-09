import WebSocket from "ws";
import { clients } from "../index.mjs";
import { sendCallNotification } from "../push-ntf.mjs";
import type { SIPHeaders } from "../types/index.mjs";

export function handleInvite(ws: WebSocket, headers: SIPHeaders, sdpBody: string | null): void {
  console.log("📞 Handling Invite...");
  const from = headers["From"];
  const to = headers["To"];
  const callId = headers["Call-ID"];

  if (!from || !to || !callId || !sdpBody) {
    ws.send(JSON.stringify({ status: 400, message: "Bad Request: Missing required headers or SDP" }));
    return;
  }

  const calleeUsername = to.match(/sip:(\d+)@/)?.[1];
  const callerUsername = from.match(/sip:(\d+)@/)?.[1];
  let callee = calleeUsername ? clients.get(calleeUsername) : undefined;

  ws.send(
    `SIP/2.0 100 TRYING\r\n` +
      `Via: ${headers["Via"]}\r\n` +
      `To: ${headers["To"]}\r\n` +
      `From: ${headers["From"]}\r\n` +
      `Call-ID: ${callId}\r\n` +
      `CSeq: ${headers["CSeq"]}\r\n` +
      `Content-Length: 0\r\n\r\n`
  );
  console.log(`📞 Sent 100 TRYING...`);

  const userFcmToken = "FAKE_TOKEN_FOR_TESTING";
  if (callerUsername && calleeUsername) {
    sendCallNotification({ fcmToken: userFcmToken, callerName: callerUsername, calleeName: calleeUsername });
  }

  if (!callee && calleeUsername) {
    console.log(`🚫 Callee not available. Checking every 2 seconds for up to 20 seconds...`);
    let retries = 0;
    const maxRetries = 10;

    const interval = setInterval(() => {
      callee = clients.get(calleeUsername);
      retries++;

      if (callee) {
        console.log(`📞 Callee became available after ${retries * 2} seconds. Proceeding with call.`);
        clearInterval(interval);
        forwardInvite(headers, sdpBody, calleeUsername);
      } else if (retries >= maxRetries) {
        console.log(`🚫 Callee still unavailable after 20 seconds. Sending 480.`);
        clearInterval(interval);
        ws.send(
          `SIP/2.0 480 Temporarily Unavailable\r\n` +
            `Retry-After: 30\r\n` +
            `Via: ${headers["Via"]}\r\n` +
            `To: ${headers["To"]}\r\n` +
            `From: ${headers["From"]}\r\n` +
            `Call-ID: ${callId}\r\n` +
            `CSeq: ${headers["CSeq"]}\r\n` +
            `Content-Length: 0\r\n\r\n`
        );
      }
    }, 2000);
  } else if (calleeUsername) {
    console.log(`📞 Callee is available. Forwarding the call immediately.`);
    forwardInvite(headers, sdpBody, calleeUsername);
  }
}

function forwardInvite(headers: SIPHeaders, sdpBody: string, calleeUsername: string): void {
  const callee = clients.get(calleeUsername);
  if (!callee) return;

  const contact = `sip:${calleeUsername}@yourdomain.com`;
  const inviteMessage =
    `INVITE sip:${calleeUsername}@server SIP/2.0\r\n` +
    `Via: ${headers["Via"]}\r\n` +
    `To: ${headers["To"]}\r\n` +
    `From: ${headers["From"]}\r\n` +
    `Call-ID: ${headers["Call-ID"]}\r\n` +
    `CSeq: ${headers["CSeq"]}\r\n` +
    `Contact: ${contact}\r\n` +
    `Content-Type: application/sdp\r\n` +
    `Content-Length: ${sdpBody.length}\r\n\r\n` +
    sdpBody;

  callee.ws.send(inviteMessage);
  console.log(`📞 Invite forwarded successfully to ${calleeUsername}`);
}
