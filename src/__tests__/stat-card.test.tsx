import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/ui/stat-card";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Campaign Balance" value="KES 12.4M" />);
    expect(screen.getByText("Campaign Balance")).toBeInTheDocument();
    expect(screen.getByText("KES 12.4M")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <StatCard label="Total Spent" value="KES 8.7M" sub="6 categories" />
    );
    expect(screen.getByText("6 categories")).toBeInTheDocument();
  });

  it("omits subtitle when not provided", () => {
    const { container } = render(
      <StatCard label="Agents" value="1,247" />
    );
    const subElements = container.querySelectorAll(".text-text-tertiary");
    // Only the label should have this class, not a subtitle
    expect(subElements.length).toBe(1);
  });
});
