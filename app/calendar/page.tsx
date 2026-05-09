
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppPageLayout } from "../_components/app-page-layout";

export default async function CalendarPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        redirect("/sign-in")
    }

    return (
        <AppPageLayout>
            <h1 className="text-center text-2xl font-bold">Calendar</h1>
        </AppPageLayout>
    );
}