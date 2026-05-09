
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Error",
}

export default function ErrorPage() {
    return (
        <div className="flex flex-col items-center  min-h-screen">
            <div className="mt-36">
                <h1 className="text-3xl font-bold">Error occurred.</h1>
                <p className="text-gray-600">An unexpected error has occurred. Please try again later.</p>
            </div>
        </div>
    )
}