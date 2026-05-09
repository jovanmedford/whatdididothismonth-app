"use client";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/app/_components/toast/store";
import { ComponentProps, SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";


export default function SignUpForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    const handleGithubSignIn = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        setLoading(true);
        try {
            const { error } = await authClient.signUp.email({
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                name: formData.get("name") as string,
            });

            if (error) {
                console.error("[auth] sign-up returned error", error);
                toast.error("An error occurred during sign-up. Please try again.");
                return;
            }

            router.push("/calendar");
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
            <Divider />
            <Button disabled={loading} onClick={handleGithubSignIn}>
                GitHub
            </Button>
        </div>
    )
}

type InputProps = ComponentProps<"input"> & {
    label: string
}

type ButtonProps = ComponentProps<"button">

function Input({ label, className, ...rest }: InputProps) {
    return (
        <div>
            <label className="block" htmlFor={rest.id}>
                {label}
            </label>
            <input className={`w-full border p-1 ${className || ''}`} {...rest} />
        </div>
    );
}

function Button({ className, children, ...rest }: ButtonProps) {
    return (
        <button className={`border px-4 py-1 rounded hover:cursor-pointer ${className || ''}`} {...rest} >
            {children}
        </button>
    );
}

function Divider() {
    return (<div className="flex items-center mt-4 text-center mb-2">
        <hr className="flex-grow border-t" />
        <span className="mx-2 text-sm">or sign in with</span>
        <hr className="flex-grow border-t" />
    </div>
    )
}