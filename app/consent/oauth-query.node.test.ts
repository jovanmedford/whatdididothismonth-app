import { describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getValidatedOAuthRequest } from "@/lib/oauth-query";

describe("signed OAuth page query", () => {
    it("accepts a provider redirect and rejects changed scopes", async () => {
        const clientId = `consent-query-${crypto.randomUUID()}`;
        await auth.$context;
        await prisma.oauthClient.create({
            data: {
                id: crypto.randomUUID(),
                clientId,
                name: "Test chat client",
                scopes: ["activity:read"],
                contacts: [],
                redirectUris: ["https://client.example.test/callback"],
                postLogoutRedirectUris: [],
                grantTypes: ["authorization_code"],
                responseTypes: ["code"],
                tokenEndpointAuthMethod: "none",
                requirePKCE: true,
            },
        });

        try {
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: "https://client.example.test/callback",
                response_type: "code",
                scope: "activity:read",
                code_challenge: "a".repeat(43),
                code_challenge_method: "S256",
            });
            const response = await auth.handler(new Request(
                `http://localhost:3000/api/auth/oauth2/authorize?${params}`,
                { headers: { accept: "text/html" } },
            ));
            const location = response.headers.get("location");
            expect(location).toMatch(/^\/sign-in\?/);

            const query = new URL(location!, "http://localhost:3000").search.slice(1);
            const valid = await getValidatedOAuthRequest(toPageSearchParams(query));
            expect(valid?.client.client_name).toBe("Test chat client");

            const changed = new URLSearchParams(query);
            changed.set("scope", "activity:write");
            expect(await getValidatedOAuthRequest(toPageSearchParams(changed.toString()))).toBeNull();
        } finally {
            await prisma.oauthClient.deleteMany({ where: { clientId } });
        }
    });
});

function toPageSearchParams(query: string) {
    const result: Record<string, string | string[]> = {};
    for (const [name, value] of new URLSearchParams(query)) {
        const existing = result[name];
        result[name] = existing === undefined ? value :
            Array.isArray(existing) ? [...existing, value] : [existing, value];
    }
    return result;
}
