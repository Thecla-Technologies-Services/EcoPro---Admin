import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RowActions } from "@/components/shared/row-actions";
import { Eye } from "lucide-react";

function openMenu() {
  fireEvent.pointerDown(
    screen.getByRole("button", { name: "Open actions" }),
    { ctrlKey: false, button: 0 },
  );
}

describe("RowActions.Item", () => {
  it("renders an item and reports selection", () => {
    const onSelect = vi.fn();

    render(
      <RowActions>
        <RowActions.Item icon={Eye} onSelect={onSelect}>
          View Details
        </RowActions.Item>
      </RowActions>,
    );

    openMenu();
    fireEvent.click(screen.getByText("View Details"));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("accepts a single element under `asChild`", () => {
    /**
     * Radix's Slot calls React.Children.only, so an `asChild` item must forward
     * exactly one child. Rendering the icon slot alongside it throws
     * "expected to receive a single React element child" — which is what
     * shipped when the marketing menu first moved onto this module.
     */
    expect(() =>
      render(
        <RowActions>
          <RowActions.Item asChild>
            <a href="/marketing/create-banner">
              <Eye className="mr-2 size-4" />
              Edit Ad
            </a>
          </RowActions.Item>
        </RowActions>,
      ),
    ).not.toThrow();

    openMenu();

    expect(screen.getByText("Edit Ad").closest("a")?.getAttribute("href")).toBe(
      "/marketing/create-banner",
    );
  });
});
