import { authClient } from "@/lib/auth-client";
import { Button } from "../button"
import { toast } from "../toast/store";

export const SocialSignIn = ({ disabled }: { disabled?: boolean }) => {
    const handleGithubSignIn = async () => {

        try {
            const response = await authClient.signIn.social({
                provider: "github",
                callbackURL: "/calendar",
                errorCallbackURL: "/error",
            });

            if (response.error) {
                console.log("[auth] Error during GitHub sign-in:", response.error);
                toast.error(`Sign-in is temporarily unavailable. Please try again shortly.`);
                return;
            }

        } catch (error) {
            toast.error("An error occurred during GitHub sign-in. Please try again.");
            console.log("[auth] Error during GitHub sign-in:", { error });
        }
    }

    return (
        <div>
            <Divider />
            <div>
                <Button disabled={disabled} onClick={handleGithubSignIn}>
                    GitHub
                </Button>
            </div>
        </div>
    )
}

function Divider() {
    return (<div className="flex items-center text-center mb-2">
        <hr className="flex-grow border-t" />
        <span className="mx-2 text-sm">or sign in with</span>
        <hr className="flex-grow border-t" />
    </div>
    )
}