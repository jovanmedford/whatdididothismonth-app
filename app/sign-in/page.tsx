import Link from "next/link";
import { AuthPageLayout } from "../_components/auth-page-layout";
import { Plant } from "../_components/plant";
import SignInForm from "./sign-in-form";
import { Metadata } from "next";
import { redirectIfAuthenticated } from "@/lib/dal";

export const metadata: Metadata = {
    title: "Sign In",
}

export default async function SignInPage() {
    await redirectIfAuthenticated();

    return (
        <AuthPageLayout
            left={<Plant className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width={140} height={280} />}
            right={
                <>
                    <h1 className="font-bold text-lg mb-6">Sign In </h1>
                    <SignInForm />
                    <p className="mt-4">Don't have an account? <Link href="/sign-up">Sign Up</Link></p>
                    <div className="md:hidden flex justify-center mt-12">
                        <Plant />
                    </div>
                </>
            } />
    );
}
