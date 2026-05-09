"use client";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/app/_components/toast/store";
import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../_components/input";
import { Button } from "../_components/button";
import { SocialSignIn } from "../_components/social-sign-in";


export default function SignUpForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setLoading(true);
        try {
            const { error } = await authClient.signUp.email({
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                name: formData.get("name") as string,
                callbackURL: "/calendar",
            });

            if (error) {
                console.error("[auth] sign-up returned error", error);
                toast.error("An error occurred during sign-up. Please try again.");
                return;
            }

        } catch (error) {
            console.error("[auth] sign-up threw", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
                <Input disabled={loading} label="Name" type="text" id="name" name="name" required placeholder="John Smith" />
                <Input disabled={loading} label="Email" type="email" id="email" name="email" required placeholder="Email" />
                <Input disabled={loading} minLength={8} label="Password" type="password" id="password" name="password" required placeholder="Password" />
                <Button disabled={loading} type="submit" className="my-2">Sign Up</Button>
            </form>
            <SocialSignIn disabled={loading} />
        </div>
    )
}