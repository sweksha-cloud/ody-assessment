import { ORDER_STATUSES } from "@odyssey/shared";
import { STATUS_LABELS, StatusBadge } from "@odyssey/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("StatusBadge", () => {
  for (const status of ORDER_STATUSES) {
    it(`renders the "${STATUS_LABELS[status]}" label for status '${status}'`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument();
    });
  }
});
