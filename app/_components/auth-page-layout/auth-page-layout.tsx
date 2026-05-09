import { Logo } from "../logo";

export const AuthPageLayout = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => {

    return (<div className="flex min-h-screen">
        <section className="hidden md:block md:flex-1 bg-blue-100 relative">
            {left}
        </section>
        <section className="flex-1 mx-8 my-10 md:mx-16 md:mt-16 md:mb-8 2xl:mt-32 ">
            <div className="max-w-md mx-auto">
                <Logo className="mb-8" />
                {right}
            </div>
        </section>
    </div>)
}