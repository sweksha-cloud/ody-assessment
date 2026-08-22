import { TextField } from "@odyssey/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("TextField", () => {
  it("renders the label and current value", () => {
    render(<TextField label="Name" value="Alice" onChangeText={() => {}} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
  });

  it("calls onChangeText as the user types", () => {
    const onChangeText = vi.fn();
    render(<TextField label="Name" value="" onChangeText={onChangeText} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Bob" } });
    expect(onChangeText).toHaveBeenCalledWith("Bob");
  });

  it("shows the error message instead of helper text when both are set", () => {
    render(
      <TextField
        label="Email"
        value="bad-input"
        onChangeText={() => {}}
        error="This value is invalid"
        helperText="We'll never share this"
      />,
    );
    expect(screen.getByText("This value is invalid")).toBeInTheDocument();
    expect(screen.queryByText("We'll never share this")).not.toBeInTheDocument();
  });

  it("shows helper text when there is no error", () => {
    render(<TextField label="Email" value="" onChangeText={() => {}} helperText="We'll never share this" />);
    expect(screen.getByText("We'll never share this")).toBeInTheDocument();
  });

  it("renders as non-editable when editable is false", () => {
    render(<TextField label="Name" value="Can't edit this" editable={false} onChangeText={() => {}} />);
    expect(screen.getByDisplayValue("Can't edit this")).toHaveAttribute("readonly");
  });
});
