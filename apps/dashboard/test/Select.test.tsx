import { Select } from "@odyssey/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
];

describe("Select", () => {
  it("shows the selected option's label", () => {
    render(<Select label="Status" value="confirmed" options={OPTIONS} onChange={() => {}} />);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("shows a placeholder when no option matches the current value", () => {
    render(<Select label="Status" value="" options={OPTIONS} onChange={() => {}} placeholder="Choose one" />);
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });

  it("opens the option list on press and calls onChange when one is picked", () => {
    const onChange = vi.fn();
    render(<Select label="Status" value="pending" options={OPTIONS} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button"));
    const option = screen.getByText("Confirmed", { selector: "div" });
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledWith("confirmed");
  });

  it("does not open when disabled", () => {
    render(<Select label="Status" value="pending" options={OPTIONS} onChange={() => {}} disabled />);
    fireEvent.click(screen.getByRole("button"));
    // With only one "Pending" in the DOM (the closed trigger's label),
    // opening would introduce a second "Pending" row inside the list.
    expect(screen.getAllByText("Pending")).toHaveLength(1);
  });
});
