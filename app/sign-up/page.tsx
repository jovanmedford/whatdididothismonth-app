import { Metadata } from "next";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
    title: "Sign Up",
}

export default function SignUpPage() {
    return (
        <div>
            <h1>Sign Up Page</h1>
            <p>This is the sign-up page.</p>
            <SignUpForm />
        </div>
    );
}