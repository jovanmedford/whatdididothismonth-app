import { auth } from "@/lib/auth";
import { mcpResourceUrl } from "@/lib/mcp-config";
import { mcpHandler } from "@/lib/mcp-server";
import { requireMcpAuth } from "@better-auth/mcp";

export const POST = requireMcpAuth(
    auth,
    (request, claims) => {
        if (typeof claims.sub !== "string" || !claims.sub) {
            return new Response("Invalid user token", { status: 401 });
        }

        const authorization = request.headers.get("authorization") ?? "";
        const token = authorization.replace(/^(Bearer|DPoP)\s+/i, "");
        return mcpHandler.fetch(request, {
            authInfo: {
                token,
                clientId: typeof claims.client_id === "string" ? claims.client_id : "",
                scopes: typeof claims.scope === "string" ? claims.scope.split(" ") : [],
                expiresAt: typeof claims.exp === "number" ? claims.exp : undefined,
                resource: new URL(mcpResourceUrl),
                extra: { userId: claims.sub },
            },
        });
    },
    { resource: mcpResourceUrl, requiredScopes: ["activity:read"] },
);
