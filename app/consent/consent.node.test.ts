import { createHash, randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { headers } from "next/headers";
import { HeadersAdapter } from "next/dist/server/web/spec-extension/adapters/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authBaseUrl, mcpResourceUrl } from "@/lib/mcp-config";
import { submitConsent } from "./consent";

vi.mock("next/headers", () => ({
    headers: vi.fn(),
    cookies: vi.fn(async () => ({ set: vi.fn() })),
}));
vi.mock("next/navigation", () => ({
    redirect: (location: string) => {
        throw Object.assign(new Error("NEXT_REDIRECT"), { location });
    },
}));

const callback = "https://client.example.test/callback";
let clientId: string | undefined;
let userId: string | undefined;

afterEach(async () => {
    if (clientId) await prisma.oauthClient.deleteMany({ where: { clientId } });
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    clientId = undefined;
    userId = undefined;
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

async function startConsent(scopes: string[]) {
    const id = randomUUID();
    const signup = await auth.api.signUpEmail({
        body: {
            name: "Consent test user",
            email: `consent-${id}@example.test`,
            password: randomUUID(),
        },
        asResponse: true,
    });
    expect(signup.status).toBe(200);
    const account = await signup.json();
    userId = account.user.id;
    const cookie = signup.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    const requestHeaders = HeadersAdapter.seal(new Headers({
        cookie,
        origin: authBaseUrl!,
        accept: "text/x-component",
    }));
    vi.mocked(headers).mockResolvedValue(requestHeaders);

    clientId = `consent-action-${id}`;
    await prisma.oauthClient.create({
        data: {
            id: randomUUID(), clientId, name: "Consent test client",
            scopes, contacts: [],
            redirectUris: [callback], postLogoutRedirectUris: [],
            grantTypes: ["authorization_code"], responseTypes: ["code"],
            tokenEndpointAuthMethod: "none", requirePKCE: true,
            oauthclientresources: { create: { id: randomUUID(), resourceId: mcpResourceUrl } },
        },
    });
    const verifier = randomUUID() + randomUUID();
    const query = new URLSearchParams({
        client_id: clientId, redirect_uri: callback, response_type: "code",
        scope: scopes.join(" "), resource: mcpResourceUrl, state: id,
        code_challenge: createHash("sha256").update(verifier).digest("base64url"),
        code_challenge_method: "S256",
    });
    const response = await auth.handler(new Request(`${authBaseUrl}/api/auth/oauth2/authorize?${query}`, {
        headers: { cookie, accept: "text/html" },
    }));
    const location = response.headers.get("location");
    expect(location).toMatch(/^\/consent\?/);
    return {
        signedQuery: new URL(location!, authBaseUrl).search.slice(1),
        requestHeaders, state: id, verifier,
    };
}

describe("OAuth consent server action", () => {
    it.each([
        { decision: "allow", scopes: ["activity:read"] },
        { decision: "deny", scopes: ["activity:read"] },
        { decision: "allow", scopes: ["activity:read", "activity:write"] },
        { decision: "deny", scopes: ["activity:read", "activity:write"] },
    ])("returns to the client after $decision for $scopes with read-only Next.js headers", async ({ decision, scopes }) => {
        const { signedQuery, requestHeaders, state, verifier } = await startConsent(scopes);
        const form = new FormData();
        form.set("decision", decision);
        const consentCall = vi.spyOn(auth.api, "oauth2Consent");
        const result = await submitConsent(signedQuery, form).catch(error => error);
        expect(consentCall).toHaveBeenCalledOnce();
        await expect(consentCall.mock.results[0].value).resolves.toHaveProperty("url");
        expect(result).toHaveProperty("location");
        const redirect = new URL(result.location, authBaseUrl);
        expect(redirect.origin + redirect.pathname).toBe(callback);
        expect(redirect.searchParams.get("state")).toBe(state);
        expect(requestHeaders.get("accept")).toBe("text/x-component");

        if (decision === "deny") {
            expect(redirect.searchParams.get("error")).toBe("access_denied");
            expect(await prisma.oauthConsent.count({ where: { clientId } })).toBe(0);
            return;
        }

        expect(redirect.searchParams.get("code")).toBeTruthy();
        expect(await prisma.oauthConsent.count({ where: { clientId, userId } })).toBe(1);
        const tokenResponse = await auth.handler(new Request(`${authBaseUrl}/api/auth/oauth2/token`, {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "authorization_code", client_id: clientId!,
                code: redirect.searchParams.get("code")!, code_verifier: verifier,
                redirect_uri: callback, resource: mcpResourceUrl,
            }),
        }));
        expect(tokenResponse.status).toBe(200);
        const token = await tokenResponse.json();
        expect(token.access_token).toBeTruthy();
        expect(token.scope.split(" ")).toEqual(expect.arrayContaining(scopes));
    });
});
