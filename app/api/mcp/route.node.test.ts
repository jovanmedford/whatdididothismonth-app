import { expect, it, vi } from "vitest";
import { mcpResourceUrl } from "@/lib/mcp-config";
import { mcpHandler } from "@/lib/mcp-server";
import { POST } from "./route";

vi.mock("@/lib/auth", async () => {
    const { authBaseUrl } = await import("@/lib/mcp-config");
    return {
        auth: {
            $context: Promise.resolve({ baseURL: `${authBaseUrl}/api/auth`, internalAdapter: {} }),
        },
    };
});
vi.mock("@/lib/mcp-server", () => ({ mcpHandler: { fetch: vi.fn() } }));

it("requests read and write permission when starting an unauthenticated MCP connection", async () => {
    const response = await POST(new Request(mcpResourceUrl, { method: "POST" }));

    expect(response.status).toBe(401);
    const challenge = response.headers.get("www-authenticate");
    expect(challenge).toContain('scope="activity:read activity:write"');
    expect(challenge).toContain(`resource_metadata="${new URL("/.well-known/oauth-protected-resource/api/mcp", mcpResourceUrl)}"`);
    expect(mcpHandler.fetch).not.toHaveBeenCalled();
});
