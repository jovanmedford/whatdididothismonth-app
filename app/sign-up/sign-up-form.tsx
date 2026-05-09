"use client";
import { authClient } from "@/lib/auth-client";
import { toast } from "../_components/toast/store";


export default function SignUpForm() {

    const handleGithubSignIn = async () => {
        try {
            const response = await authClient.signIn.social({
                provider: "github",
                callbackURL: "/calendar",
                errorCallbackURL: "/error",
            });

            if (response.error) {
                console.log("[auth] Error during GitHub sign-in:", response.error);
                toast.error(`GitHub sign-in failed. | Please try again.`);
                return;
            }

        } catch (error) {
            toast.error("An error occurred during GitHub sign-in. Please try again.");
            console.log("[auth] Error during GitHub sign-in:", { error });
        }
    }

    return (<section>
        <button onClick={handleGithubSignIn} className="bg-gray-800 text-white px-4 py-2 rounded">Github</button>
    </section>)
}