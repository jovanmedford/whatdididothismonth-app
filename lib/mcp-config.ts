const previewHosts = process.env.VERCEL_ENV === "preview"
    ? [process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL].filter((host): host is string => Boolean(host))
    : [];

export const previewOrigins = previewHosts.map((host) => `https://${host}`);

export const authBaseUrl = previewOrigins[0] ?? process.env.BETTER_AUTH_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000")

if (!authBaseUrl) {
    throw new Error("BETTER_AUTH_URL is required to configure MCP authentication")
}

export const mcpResourceUrl = new URL("/api/mcp", authBaseUrl).toString()
