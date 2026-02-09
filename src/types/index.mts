import WebSocket from "ws";

export interface Client {
  ws: WebSocket;
  sipUri: string;
}

export type SIPHeaders = Record<string, string>;
// Mock call data with proper TypeScript typing
export interface MockCallData {
  sessionId: string;
  channel: string;
  phone: string;
  name: string;
  createdAt: string;
  status: string;
  priority: string;
  waiting: string;
  claimed: string;
  claimAction: string;
  transferAction: string | null;
  cancelAction: string | null;
  domain: string;
  token: string;
  isDuplicatePhone: boolean;
}

// Raw array representation as used in the original JavaScript
export type MockCallRow = [
  string, // sessionId
  string, // channel
  string, // phone
  string, // name
  string, // createdAt
  string, // status
  string, // priority
  string, // waiting
  string, // claimed
  string, // claimAction (JSON string)
  string | null, // transferAction
  string | null, // cancelAction
  string, // domain
  string, // token
  boolean // isDuplicatePhone
];

export interface CallResponse {
  type: string;
  payload: {
    response: {
      subdomain_details: string;
      get_profile: string;
      data_source: {
        cols: Array<{
          label: string;
          type: string;
          value: string;
          list_filters?: string[];
          search_filters?: boolean;
        }>;
        rows: MockCallRow[];
        lines: any[];
        groups: any[];
        data: any[];
        min_id: number;
        max_id: number;
        row_count: number;
      };
    };
    action_id: number;
    response_status: string;
    overall_status: string;
  };
}

export interface ChatMessage {
  id?: string;
  content: string;
  timestamp: string;
  sender: string;
}
