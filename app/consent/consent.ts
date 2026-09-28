import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const scopeDescriptions: Record<string, string> = {
    "activity:read": "View your activities and monthly progress",
    "activity:write": "Mark days as completed for your activities",
    openid: "Confirm your identity",
    profile: "See your profile information",
    offline_access: "Stay connected after you close this session",
};

export function requestedClaims(rawClaims: string | null) {
    if (!rawClaims) return [];

    try {
        const claims = JSON.parse(rawClaims) as Record<string, unknown>;
        return ["userinfo", "id_token"].flatMap((group) => {
            const requested = claims?.[group];
            return requested && typeof requested === "object" && !Array.isArray(requested)
                ? Object.keys(requested).map((name) => `${group}: ${name}`)
                : [];
        });
    } catch {
        return ["Additional profile details"];
    }
}

export async function submitConsent(signedQuery: string, formData: FormData) {
    "use server";

    const decision = formData.get("decision");
    if (decision !== "allow" && decision !== "deny") redirect("/consent");

    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session?.user) redirect(`/sign-in?${signedQuery}`);

    let result;
    try {
        const { baseURL } = await auth.$context;
        result = await auth.api.oauth2Consent({
            body: { accept: decision === "allow", oauth_query: signedQuery },
            headers: requestHeaders,
            // Consent resumes authorization, which requires HTTP request context.
            request: new Request(`${baseURL}/oauth2/consent`, {
                method: "POST",
                headers: requestHeaders,
            }),
            asResponse: false,
        });
    } catch {
        redirect("/consent");
    }
    redirect(result.url);
}
