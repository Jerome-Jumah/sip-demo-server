import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import WebSocket, { WebSocketServer } from "ws";
import mockCalls from "./calls.mjs";
import type { CallResponse } from "./types/index.mjs";
import { buildCallResponse } from "./utils/build-call-response.mjs";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8085;

// ================== HTTP SERVER ==================

// Utility: load JSON file safely
function loadJsonFromFile(filePath: string, res: http.ServerResponse): void {
  const fullPath = path.join(__dirname, "..", filePath);
  fs.readFile(fullPath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `File not found: ${filePath}` }));
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(jsonData));
    } catch (parseErr) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON format" }));
    }
  });
}

export const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  console.log("Received request:", req.method, req.url);

  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request");
    return;
  }

  const parts = req.url.split("/");
  let endpoint = parts[parts.length - 1];
  endpoint = decodeURIComponent(endpoint || "").toUpperCase();

  console.log("Resolved endpoint:", endpoint);

  switch (endpoint) {
    case "HOME":
    case "LANDING PAGE":
      return loadJsonFromFile("json/ui/home.json", res);
    case "CALL HISTORY":
      return loadJsonFromFile("json/ui/call_history.json", res);
    case "CHAT":
      return loadJsonFromFile("json/ui/chat.json", res);
    case "ACTIVE PLAN":
      return loadJsonFromFile("json/ui/active_plan.json", res);
    case "BILLING HISTORY":
      return loadJsonFromFile("json/ui/billing_history.json", res);
    case "USAGE OVERVIEW":
      return loadJsonFromFile("json/ui/usage_overview.json", res);
    case "SUBSCRIPTION PLANS":
      return loadJsonFromFile("json/ui/subscription_plans.json", res);

    case "DATA SOURCE": {
      // Collect request body for POST
      let body = "";
      req.on("data", (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        let dataName: string;
        try {
          const parsed = JSON.parse(body);
          dataName = parsed.data_name;
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON body" }));
          return;
        }
        console.log("Data name requested:", dataName);

        switch (dataName) {
          case "txns data viz":
          case "call_history":
            return loadJsonFromFile("json/data/call_history_data.json", res);
          case "call_queue":
            return loadJsonFromFile("json/data/call_queue_data.json", res);
          case "suggestions":
            return loadJsonFromFile("json/data/suggestions_data.json", res);
          case "incoming_call_queue":
            return loadJsonFromFile("json/data/call_queue_data.json", res);
          case "chat":
            return loadJsonFromFile("json/data/chat_data.json", res);
          case "subscription_plans":
            return loadJsonFromFile("json/data/subscription_plans_data.json", res);
          case "active_plan":
            return loadJsonFromFile("json/data/active_plan_data.json", res);
          case "billing_history":
            return loadJsonFromFile("json/data/billing_history_data.json", res);
          case "usage_overview":
            return loadJsonFromFile("json/data/usage_overview_data.json", res);
          default:
            return loadJsonFromFile("json/data/txns_data.json", res);
        }
      });
      break;
    }

    default:
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
  }
});

// ================== CALLS SOCKET ==================
// const callsWSS = new WebSocketServer({ noServer: true });

// // Helper: build call response

// function broadcastCalls(obj: CallResponse): void {
//   const msg = JSON.stringify(obj);
//   callsWSS.clients.forEach(client => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(msg);
//     }
//   });
// }

// callsWSS.on("connection", (ws: WebSocket) => {
//   console.log("🔗 Client connected to /calls");

//   ws.send(JSON.stringify(buildCallResponse(mockCalls)));

//   const interval = setInterval(() => {
//     const randomIndex = Math.floor(Math.random() * mockCalls.length);
//     if (mockCalls[randomIndex]) {
//       mockCalls[randomIndex][4] = new Date().toISOString(); // Update createdAt
//     }

//     console.log(`🔄 Updated call row at index ${randomIndex}`);
//     broadcastCalls(buildCallResponse(mockCalls));
//   }, 30000);

//   ws.on("close", () => clearInterval(interval));
// });

// ================== MESSAGES SOCKET ==================
// const messagesWSS = new WebSocketServer({ noServer: true });
// // const messages: ChatMessage[] = []; // simple in-memory chat history

// messagesWSS.on("connection", (ws: WebSocket) => {
//   console.log("🔗 Client connected to /messages");

//   ws.on("message", (msg: WebSocket.RawData) => {
//     const parsed: ChatMessage = JSON.parse(msg.toString());
//     // messages.push(parsed);

//     console.log("💬 New message:", parsed);
//     broadcastMessages(parsed, messagesWSS);
//   });
// });

// ================== UPGRADE HANDLER ==================
// server.on("upgrade", (req: http.IncomingMessage, socket: any, head: Buffer) => {
//   if (req.url === "/calls") {
//     callsWSS.handleUpgrade(req, socket, head, (ws: WebSocket) => {
//       callsWSS.emit("connection", ws, req);
//     });
//   } else if (req.url === "/messages") {
//     messagesWSS.handleUpgrade(req, socket, head, (ws: WebSocket) => {
//       messagesWSS.emit("connection", ws, req);
//     });
//   } else {
//     socket.destroy();
//   }
// });

// ================== START SERVER ==================
// export function startHttpServer(): http.Server {
//   return server.listen(PORT, () => {
//     console.log(`✅ HTTP Server running on http://localhost:${PORT}`);
//     console.log(`   WS -> ws://localhost:${PORT}/calls`);
//     console.log(`   WS -> ws://localhost:${PORT}/messages`);
//   });
// }
