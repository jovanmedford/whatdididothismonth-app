import { Metadata } from "next";
import SignUpForm from "./sign-up-form";
import { Plant } from "../_components/plant";
import Link from "next/link";
import { AuthPageLayout } from "../_components/auth-page-layout";

export const metadata: Metadata = {
    title: "Sign Up",
}

export default function SignUpPage() {
    return (
        <AuthPageLayout
            left={<Plant className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width={140} height={280} />}
            right={
                <>
                    <h1 className="font-bold text-lg mb-6">Sign Up </h1>
                    <SignUpForm />
                    <p className="mt-4">Already have an account? <Link href="/sign-in">Sign In</Link></p>
                    <div className="md:hidden flex justify-center mt-12">
                        <Plant />
                    </div>
                </>
            } />
    );
}