"use client";
import { authClient } from "@/lib/auth-client";


export default function SignUpForm() {

    const handleGithubSignIn = async () => {
        try {
            await authClient.signIn.social({
                /**
                 * The social provider ID
                 * @example "github", "google", "apple"
                 */
                provider: "github",
                /**
                 * A URL to redirect after the user authenticates with the provider
                 * @default "/"
                 */
                callbackURL: "/calendar",
                /**
                 * A URL to redirect if an error occurs during the sign in process
                 */
                errorCallbackURL: "/error",
            });

        } catch (error) {
            console.error("Error during GitHub sign-in:", error);
        }
    }

    return (<section>
        <button onClick={handleGithubSignIn} className="bg-gray-800 text-white px-4 py-2 rounded">Github</button>
    </section>)
}