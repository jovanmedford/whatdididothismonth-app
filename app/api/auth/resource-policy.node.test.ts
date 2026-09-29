import { createHash, randomUUID } from "node:crypto";
import { afterAll, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { authBaseUrl, mcpResourceUrl } from "@/lib/mcp-config";

vi.mock("@/lib/mcp-config", async importOriginal => {
    const config = await importOriginal<typeof import("@/lib/mcp-config")>();
    return {
        ...config,
        mcpResourceUrl: new URL(`/api/mcp-policy-${crypto.randomUUID()}`, config.authBaseUrl).toString(),
    };
});
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ set: vi.fn() })) }));

let userId: string | undefined;
const clientId = `resource-policy-${randomUUID()}`;

afterAll(async () => {
    await prisma.oauthClient.deleteMany({ where: { clientId } });
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.oauthResource.deleteMany({ where: { identifier: mcpResourceUrl } });
});

it("updates an existing read-only resource before issuing and refreshing approved write access", async () => {
    // Reproduce an existing deployment, before the current auth configuration initializes.
    await prisma.oauthResource.create({
        data: {
            id: randomUUID(), identifier: mcpResourceUrl, name: "Existing MCP resource",
            allowedScopes: ["activity:read"], accessTokenTtl: 600,
        },
    });
    const { auth } = await import("@/lib/auth");
    const scopes = ["openid", "offline_access", "activity:read", "activity:write"];
    const signup = await auth.api.signUpEmail({
        body: { name: "Resource policy test", email: `${clientId}@example.test`, password: randomUUID() },
        asResponse: true,
    });
    expect(signup.status).toBe(200);
    userId = (await signup.json()).user.id;
    const cookie = signup.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    const callback = "https://client.example.test/callback";
    await prisma.oauthClient.create({
        data: {
            id: randomUUID(), clientId, name: "Resource policy test client", scopes,
            contacts: [], redirectUris: [callback], postLogoutRedirectUris: [],
            grantTypes: ["authorization_code", "refresh_token"], responseTypes: ["code"],
            tokenEndpointAuthMethod: "none", requirePKCE: true,
            oauthclientresources: { create: { id: randomUUID(), resourceId: mcpResourceUrl } },
        },
    });
    const verifier = randomUUID() + randomUUID();
    const state = randomUUID();
    const query = new URLSearchParams({
        client_id: clientId, redirect_uri: callback, response_type: "code", state,
        scope: scopes.join(" "), resource: mcpResourceUrl,
        code_challenge: createHash("sha256").update(verifier).digest("base64url"),
        code_challenge_method: "S256",
    });
    const authorization = await auth.handler(new Request(`${authBaseUrl}/api/auth/oauth2/authorize?${query}`, {
        headers: { cookie, accept: "text/html" },
    }));
    const consentLocation = authorization.headers.get("location");
    expect(consentLocation).toMatch(/^\/consent\?/);
    const consent = await auth.handler(new Request(`${authBaseUrl}/api/auth/oauth2/consent`, {
        method: "POST",
        headers: { cookie, origin: authBaseUrl!, "content-type": "application/json" },
        body: JSON.stringify({
            accept: true,
            oauth_query: new URL(consentLocation!, authBaseUrl).search.slice(1),
        }),
    }));
    expect(consent.status).toBe(200);
    const redirect = new URL((await consent.json()).url);
    expect(redirect.origin + redirect.pathname).toBe(callback);
    expect(redirect.searchParams.get("state")).toBe(state);
    expect(redirect.searchParams.get("code")).toBeTruthy();

    async function exchange(parameters: Record<string, string>) {
        const response = await auth.handler(new Request(`${authBaseUrl}/api/auth/oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({ client_id: clientId, resource: mcpResourceUrl, ...parameters }),
        }));
        expect(response.status).toBe(200);
        const token = await response.json();
        expect(token.access_token).toBeTruthy();
        expect(token.scope.split(" ")).toContain("activity:write");
        expect(token.scope.split(" ")).toEqual(expect.arrayContaining(scopes));
        expect(token.id_token).toBeTruthy();
        expect(token.refresh_token).toBeTruthy();
        return token;
    }

    let token = await exchange({
        grant_type: "authorization_code", code: redirect.searchParams.get("code")!,
        code_verifier: verifier, redirect_uri: callback,
    });
    // Refresh twice so a response that drops offline access cannot pass.
    for (let attempt = 0; attempt < 2; attempt++) {
        const previousRefreshToken = token.refresh_token;
        token = await exchange({ grant_type: "refresh_token", refresh_token: previousRefreshToken });
        expect(token.refresh_token).not.toBe(previousRefreshToken);
    }
    const resource = await prisma.oauthResource.findUniqueOrThrow({ where: { identifier: mcpResourceUrl } });
    expect(resource.accessTokenTtl).toBe(600);
    expect(resource.name).toBe("Existing MCP resource");
}, 15000);
