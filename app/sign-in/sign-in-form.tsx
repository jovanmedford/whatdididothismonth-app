"use client";
import { Button } from "../_components/button";
import { Input } from "../_components/input";
import { SocialSignIn } from "../_components/social-sign-in";
import { SubmitEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "../_components/toast/store";


export default function SignInForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            const { error } = await authClient.signIn.email({
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                callbackURL: "/calendar",
            });

            if (error) {
                toast.error(error.message || "An error occurred during sign-in.");
                console.error("Sign-in error:", error);
            }
        } catch (error) {
            toast.error("An unexpected error occurred during sign-in.");
            console.error("Sign-in error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (<div>
        <form className="flex flex-col gap-4 mb-4" onSubmit={handleSubmit}>
            <Input disabled={loading} label="Email" type="email" name="email" placeholder="Email" className="mb-2 p-2 border rounded" required />
            <Input disabled={loading} label="Password" type="password" name="password" placeholder="Password" className="mb-4 p-2 border rounded" required minLength={8} />
            <Button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
            </Button>
        </form>
        <SocialSignIn />
    </div>)
}