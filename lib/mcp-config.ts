export const authBaseUrl = process.env.BETTER_AUTH_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000")

if (!authBaseUrl) {
    throw new Error("BETTER_AUTH_URL is required to configure MCP authentication")
}

export const mcpResourceUrl = new URL("/api/mcp", authBaseUrl).toString()
