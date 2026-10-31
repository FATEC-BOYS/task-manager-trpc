import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TrpcProvider } from "./TrpcProvider";

vi.mock("@/utils/trpc", () => ({
  trpc: {
    createClient: vi.fn(() => ({ links: [] })),
    Provider: ({ children }: { children: React.ReactNode }) => <div data-testid="trpc-provider">{children}</div>
  }
}));

describe("TrpcProvider", () => {
  it("provides tRPC and React Query context to children", () => {
    render(<TrpcProvider><span>Provider child</span></TrpcProvider>);
    expect(screen.getByTestId("trpc-provider")).toBeInTheDocument();
    expect(screen.getByText("Provider child")).toBeInTheDocument();
  });
});
