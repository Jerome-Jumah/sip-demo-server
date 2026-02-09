import type { CallResponse, MockCallRow } from "../types/index.mjs";

export function buildCallResponse(rows: MockCallRow[]): CallResponse {
  return {
    type: "queue_update",
    payload: {
      response: {
        subdomain_details: "Subdomain Details Updated",
        get_profile: "Session Profile Captured",
        data_source: {
          cols: [
            {
              label: "sessionId",
              type: "string",
              value: "sessionId",
            },
            {
              label: "channel",
              type: "string",
              value: "channel",
              list_filters: ["voice", "chat", "Whatsapp", "Mail", "SMS"],
            },
            {
              label: "phone",
              type: "string",
              value: "phone",
              search_filters: true,
            },
            {
              label: "name",
              type: "string",
              value: "name",
            },
            {
              label: "createdAt",
              type: "datetime",
              value: "createdAt",
            },
            {
              label: "status",
              type: "string",
              value: "status",
            },
            {
              label: "priority",
              type: "string",
              value: "priority",
            },
            {
              label: "waiting",
              type: "string",
              value: "waiting",
            },
            {
              label: "claimed",
              type: "string",
              value: "claimed",
            },
            {
              label: "Claim",
              type: "href",
              value: "Claim",
            },
            {
              label: "Transfer",
              type: "href",
              value: "Transfer",
            },
            {
              label: "Cancel",
              type: "href",
              value: "Cancel",
            },
            {
              label: "domain",
              type: "string",
              value: "domain",
            },
            {
              label: "token",
              type: "string",
              value: "token",
            },
            {
              label: "isDuplicatePhone",
              type: "boolean",
              value: "isDuplicatePhone",
            },
          ],
          rows: rows,
          lines: [],
          groups: [],
          data: [],
          min_id: 0,
          max_id: 0,
          row_count: rows.length,
        },
      },
      action_id: 54,
      response_status: "00",
      overall_status: "00",
    },
  };
}
