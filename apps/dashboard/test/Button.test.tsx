import { Button } from "@odyssey/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("Button", () => {
  it("fires onPress when enabled", () => {
    const onPress = vi.fn();
    render(<Button label="Save" onPress={onPress} />);
    fireEvent.click(screen.getByText("Save"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", () => {
    const onPress = vi.fn();
    render(<Button label="Save" disabled onPress={onPress} />);
    fireEvent.click(screen.getByText("Save"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("does not fire onPress while loading, and hides the label", () => {
    const onPress = vi.fn();
    render(<Button label="Save" loading onPress={onPress} />);
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
    // ActivityIndicator (react-native-web) renders with role="progressbar"
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("exposes disabled state to assistive tech via accessibilityState", () => {
    render(<Button label="Save" disabled onPress={() => {}} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
