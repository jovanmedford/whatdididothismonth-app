
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        redirect("/sign-in")
    }

    return (
        <div>
            <h1>Calendar Page</h1>
            <p>This is the calendar page.</p>
        </div>
    );
}