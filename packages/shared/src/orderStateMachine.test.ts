import { describe, expect, it } from "vitest";
import { canTransition, getNextValidStatuses, ORDER_STATUSES, type OrderStatus } from "./orderStateMachine";

const EXPECTED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

describe("getNextValidStatuses", () => {
  for (const status of ORDER_STATUSES) {
    it(`returns exactly [${EXPECTED_TRANSITIONS[status].join(", ")}] from '${status}'`, () => {
      expect([...getNextValidStatuses(status)].sort()).toEqual(
        [...EXPECTED_TRANSITIONS[status]].sort(),
      );
    });
  }
});

describe("canTransition", () => {
  // Exhaustively check every (from, to) pair against the expected table
  // rather than spot-checking a few, since this function gates a real
  // business rule (server-enforced order status transitions).
  for (const from of ORDER_STATUSES) {
    for (const to of ORDER_STATUSES) {
      const expected = EXPECTED_TRANSITIONS[from].includes(to);
      it(`${from} -> ${to} is ${expected ? "allowed" : "rejected"}`, () => {
        expect(canTransition(from, to)).toBe(expected);
      });
    }
  }

  it("treats completed and cancelled as terminal (no outgoing transitions)", () => {
    expect(getNextValidStatuses("completed")).toHaveLength(0);
    expect(getNextValidStatuses("cancelled")).toHaveLength(0);
  });

  it("never allows a status to transition to itself", () => {
    for (const status of ORDER_STATUSES) {
      expect(canTransition(status, status)).toBe(false);
    }
  });
});
