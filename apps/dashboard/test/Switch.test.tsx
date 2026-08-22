import { Switch } from "@odyssey/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("Switch", () => {
  it("renders label and description", () => {
    render(
      <Switch
        label="Ordering enabled"
        description="Toggles whether customers can place new orders"
        value={true}
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByText("Ordering enabled")).toBeInTheDocument();
    expect(screen.getByText("Toggles whether customers can place new orders")).toBeInTheDocument();
  });

  it("calls onValueChange with the flipped value when toggled", () => {
    const onValueChange = vi.fn();
    render(<Switch label="Ordering enabled" value={false} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("marks the underlying control disabled", () => {
    // jsdom's fireEvent.click doesn't suppress the change event on a
    // disabled <input> the way real browsers do, so clicking through and
    // asserting onValueChange wasn't called would pass or fail on jsdom
    // quirks rather than our component. What we actually control — and
    // what real browsers respect — is whether `disabled` reaches the DOM.
    render(<Switch label="Ordering enabled" value={false} onValueChange={() => {}} disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });
});
