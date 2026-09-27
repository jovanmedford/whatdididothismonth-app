import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPageLayout } from "../_components/auth-page-layout";
import { Button } from "../_components/button";
import { Plant } from "../_components/plant";
import { auth } from "@/lib/auth";
import { getValidatedOAuthRequest } from "@/lib/oauth-query";
import { requestedClaims, scopeDescriptions, submitConsent } from "./consent";

export const metadata: Metadata = { title: "Approve connection" };

function ConsentLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthPageLayout
            left={<Plant className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width={140} height={280} />}
            right={children}
        />
    );
}

export default async function ConsentPage({ searchParams }: PageProps<"/consent">) {
    const request = await getValidatedOAuthRequest(await searchParams);

    if (!request) {
        return (
            <ConsentLayout>
                <h1 className="mb-4 text-lg font-bold">Connection request expired</h1>
                <p>Return to your chat app and start the connection again.</p>
            </ConsentLayout>
        );
    }

    const { query, clientId, client } = request;
    const signedQuery = query.toString();
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user) {
        redirect(`/sign-in?${signedQuery}`);
    }

    const scopes = [...new Set((query.get("scope") ?? "").split(" ").filter(Boolean))];
    const claims = requestedClaims(query.get("claims"));

    return (
        <ConsentLayout>
            <h1 className="mb-2 text-lg font-bold">Approve connection</h1>
            <p className="mb-6 text-text-light">
                <strong className="text-text">{client.client_name || clientId}</strong> wants to connect to What Did I Do This Month.
            </p>
            <p className="mb-3 font-medium">This connection requests permission to:</p>
            <ul className="mb-6 list-disc space-y-2 pl-5">
                {scopes.map((scope) => (
                    <li key={scope}>{scopeDescriptions[scope] ?? scope}</li>
                ))}
                {claims.map((claim) => <li key={claim}>See {claim}</li>)}
            </ul>
            <p className="mb-6 text-sm text-text-light">Signed in as {session.user.email}</p>
            <form action={submitConsent.bind(null, signedQuery)} className="flex flex-wrap gap-3">
                <Button type="submit" name="decision" value="allow" variant="primary">Allow access</Button>
                <Button type="submit" name="decision" value="deny">Deny</Button>
            </form>
        </ConsentLayout>
    );
}
