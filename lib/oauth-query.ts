import { auth } from "./auth";

type SearchParams = Record<string, string | string[] | undefined>;

export async function getValidatedOAuthRequest(searchParams: SearchParams) {
    const query = new URLSearchParams();

    for (const [name, value] of Object.entries(searchParams)) {
        if (value === undefined) continue;
        for (const item of Array.isArray(value) ? value : [value]) {
            query.append(name, item);
        }
    }

    const clientId = query.get("client_id");
    if (!clientId) return null;

    try {
        const client = await auth.api.getOAuthClientPublicPrelogin({
            body: { client_id: clientId, oauth_query: query.toString() },
        });
        return { query, clientId, client };
    } catch {
        return null;
    }
}
