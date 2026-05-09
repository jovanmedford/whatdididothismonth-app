"use client";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/app/_components/toast/store";
import { ComponentProps, SubmitEvent } from "react";


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

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log("Form submitted.");
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-8">
                <Input label="Email" type="email" id="email" required placeholder="Email" />
                <Input label="Password" type="password" id="password" required placeholder="Password" />
                <Button type="submit">Sign Up</Button>
            </form>
            <Divider />
            <Button onClick={handleGithubSignIn}>
                Github
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
    return (<div className="flex items-center my-4 text-center mb-8">
        <hr className="flex-grow border-t" />
        <span className="mx-2 text-sm">or sign in with</span>
        <hr className="flex-grow border-t" />
    </div>
    )
}