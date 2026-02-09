import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import mockCalls from "./calls.mjs";
import { server } from "./http-server.mjs";
import type { CallResponse, ChatMessage, Client } from "./types/index.mjs";
import { broadcastMessages } from "./utils/broadcast-messages.mjs";
import { buildCallResponse } from "./utils/build-call-response.mjs";
import { handleBye } from "./utils/handle-bye.mjs";
import { handleCancel } from "./utils/handle-cancel.mjs";
import { handleInvite } from "./utils/handle-invite.mjs";
import { parseSIPHeaders } from "./utils/parse-headers.mjs";
import { handleRegister } from "./utils/register.mjs";
import { handleSIPResponse } from "./utils/sip-response-handler.mjs";
import { extractSDP } from "./utils/utils.mjs";

const PORT = 8085;
const wss = new WebSocketServer({ noServer: true });

console.log(`📡 SIP WebSocket Server running on ws://localhost:${PORT}`);

export const clients: Map<string, Client> = new Map();
const messages: ChatMessage[] = []; // simple in-memory chat history

wss.on("connection", (ws: WebSocket) => {
  console.log("✅ New WebSocket connection established");
  ws.send(JSON.stringify(buildCallResponse(mockCalls)));

  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * mockCalls.length);
    if (mockCalls[randomIndex]) {
      mockCalls[randomIndex][4] = new Date().toISOString(); // Update createdAt
    }

    console.log(`🔄 Updated call row at index ${randomIndex}`);
    broadcastCalls(buildCallResponse(mockCalls));
  }, 30000);

  ws.on("close", () => clearInterval(interval));

  ws.on("message", (message: WebSocket.RawData) => {
    const msgStr = message.toString("utf-8");
    console.log("-------------------------------------------");
    console.log("📩 Raw SIP Message:\n", msgStr);

    const headers = parseSIPHeaders(msgStr);
    const sdpBody = extractSDP(msgStr);
    const firstLine = msgStr.split("\n")[0];

    if (msgStr.startsWith("REGISTER")) {
      handleRegister(ws, headers);
    } else if (msgStr.startsWith("INVITE")) {
      handleInvite(ws, headers, sdpBody);
    } else if (msgStr.startsWith("BYE")) {
      handleBye(ws, headers);
    } else if (msgStr.startsWith("CANCEL") || firstLine?.includes("603 Decline")) {
      handleCancel(ws, headers);
    } else if (msgStr.startsWith("SIP/2.0")) {
      handleSIPResponse(ws, msgStr, headers);
    } else {
      console.log("⚠️ Unrecognized SIP message type");
    }
    console.log("-------------------------------------------");
    const parsed = JSON.parse(msgStr) as ChatMessage;
    messages.push(parsed);
    broadcastMessages(parsed, wss);
  });

  ws.on("close", () => {
    console.log("❌ WebSocket connection closed");
  });
});

// ================== UPGRADE HANDLER ==================
server.on("upgrade", (req: http.IncomingMessage, socket: any, head: Buffer) => {
  if (req.url === "/calls") {
    wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
      wss.emit("connection", ws, req);
    });
  } else if (req.url === "/messages") {
    wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

function broadcastCalls(obj: CallResponse): void {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

function startHttpServer(): http.Server {
  return server.listen(PORT, () => {
    console.log(`✅ HTTP Server running on http://localhost:${PORT}`);
    console.log(`   WS -> ws://localhost:${PORT}/calls`);
    console.log(`   WS -> ws://localhost:${PORT}/messages`);
  });
}

startHttpServer();
