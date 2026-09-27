import { betterAuth } from "better-auth";
import { prisma } from "./db";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { mcp } from "@better-auth/mcp";
import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { authBaseUrl, mcpResourceUrl, previewOrigins } from "./mcp-config";

export const auth = betterAuth({
    baseURL: authBaseUrl,
    trustedOrigins: previewOrigins,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    plugins: [
        jwt(),
        mcp({
            loginPage: "/sign-in",
            consentPage: "/consent",
            allowPublicClientPrelogin: true,
            // Let local MCP clients register without hosting CIMD metadata.
            allowDynamicClientRegistration: process.env.NODE_ENV === "development",
            allowUnauthenticatedClientRegistration: process.env.NODE_ENV === "development",
            resource: mcpResourceUrl,
            resources: [{ identifier: mcpResourceUrl, allowedScopes: ["activity:read"] }],
            scopes: ["openid", "profile", "offline_access", "activity:read"],
        }),
        cimd({
            fetchClientMetadataResource,
            metadataProfile: "mcp-2026-07-28",
        }),
        nextCookies(),
    ],
});
