import { WebSocketServer } from "ws";
import type { ChatMessage } from "../types/index.mjs";

export function broadcastMessages(obj: ChatMessage, callsWSS: WebSocketServer): void {
  const msg = JSON.stringify(obj);
  callsWSS.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
