import { Metadata } from "next";
import SignUpForm from "./sign-up-form";
import Logo from "../_components/logo/logo";
import Plant from "../_components/plant/plant";

export const metadata: Metadata = {
    title: "Sign Up",
}

export default function SignUpPage() {
    return (<div className="flex min-h-screen">
        <section className="hidden md:block md:flex-1 bg-blue-100 relative">
            <Plant className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width={140} height={280} />
        </section>
        <section className="flex-1 mx-8 my-10 md:mx-16 md:mt-16 md:mb-8 2xl:mt-32 ">
            <div className="max-w-md mx-auto">
                <Logo className="mb-12" />
                <h1 className="font-bold text-lg mb-6">Sign Up </h1>
                <p className="mb-8 text-sm">Track your journey not just your streaks</p>
                <SignUpForm />

                <div className="md:hidden flex justify-center mt-12">
                    <Plant />
                </div>
            </div>
        </section>
    </div>
    );
}