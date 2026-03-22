import type { OperationConfig } from "../src/types";

export const FUTURE_DATE = "2099-01-01T00:00:00Z";
export const PAST_DATE = "2000-01-01T00:00:00Z";

/** Standard operation used across most tests */
export const BASE_OP: OperationConfig = {
  operation: {
    name: "Test Op",
    start: PAST_DATE,
    end: FUTURE_DATE,
  },
  perimeter: {
    hosts: ["api.example.com", "*.dev.example.com"],
    domains: ["*.corp.local"],
    cidrs: ["10.0.0.0/16", "192.168.1.0/24"],
  },
  no_touch: {
    hosts: ["prod.example.com"],
    cidrs: ["10.0.1.0/24"],
    restricted_periods: [],
  },
  constraints: {
    blocked_tactics: ["TA0040", "TA0010"],
    gated_tactics: ["TA0002", "TA0008"],
  },
};

/** Operation that has not started yet */
export const FUTURE_OP: OperationConfig = {
  ...BASE_OP,
  operation: { name: "Future Op", start: FUTURE_DATE, end: FUTURE_DATE },
};

/** Operation that has already ended */
export const EXPIRED_OP: OperationConfig = {
  ...BASE_OP,
  operation: { name: "Expired Op", start: PAST_DATE, end: PAST_DATE },
};

/** Operation with an active restricted period covering now */
export const RESTRICTED_OP: OperationConfig = {
  ...BASE_OP,
  no_touch: {
    ...BASE_OP.no_touch,
    restricted_periods: [
      {
        start: PAST_DATE,
        end: FUTURE_DATE,
        note: "maintenance window",
      },
    ],
  },
};
