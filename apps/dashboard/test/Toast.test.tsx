import { Button, ToastProvider, useToast } from "@odyssey/ui";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function ToastTrigger() {
  const { showToast } = useToast();
  return <Button label="Fire toast" onPress={() => showToast("Order confirmed", "success")} />;
}

describe("ToastProvider / useToast", () => {
  it("renders children when no toast is showing", () => {
    render(
      <ToastProvider>
        <Button label="Just a button" onPress={() => {}} />
      </ToastProvider>,
    );
    expect(screen.getByText("Just a button")).toBeInTheDocument();
    expect(screen.queryByText("Order confirmed")).not.toBeInTheDocument();
  });

  it("shows the message passed to showToast", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("Fire toast"));
    expect(screen.getByText("Order confirmed")).toBeInTheDocument();
  });

  it(
    "auto-dismisses after the timeout elapses",
    async () => {
      // Real timers on purpose: the dismiss delay plus its fade-out run
      // through RN's Animated (rAF-driven), which doesn't advance under
      // vitest's fake timers — faking them here just deadlocks waitFor.
      render(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByText("Fire toast"));
      expect(screen.getByText("Order confirmed")).toBeInTheDocument();

      await waitFor(() => expect(screen.queryByText("Order confirmed")).not.toBeInTheDocument(), {
        timeout: 4000,
      });
    },
    { timeout: 5000 },
  );

  it("useToast throws when called outside a ToastProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ToastTrigger />)).toThrow("useToast must be used within a ToastProvider");
    consoleError.mockRestore();
  });
});
