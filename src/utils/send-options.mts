import WebSocket from "ws";

export function sendOptions(ws: WebSocket, sipUri: string, username: string): void {
  const callId = `options-${Math.floor(Math.random() * 100000)}`;
  const optionsMessage =
    `OPTIONS ${sipUri} SIP/2.0\r\n` +
    `Via: SIP/2.0/WSS server.invalid;branch=z9hG4bK-${Math.random().toString(36).substring(2, 12)}\r\n` +
    `To: <${sipUri}>\r\n` +
    `From: <sip:server@invalid>;tag=${Math.random().toString(36).substring(2, 12)}\r\n` +
    `Call-ID: ${callId}\r\n` +
    `CSeq: 1 OPTIONS\r\n` +
    `Max-Forwards: 70\r\n` +
    `Content-Length: 0\r\n\r\n`;

  ws.send(optionsMessage);
  console.log(`📡 Sent OPTIONS to ${username} (${sipUri})`);
}
