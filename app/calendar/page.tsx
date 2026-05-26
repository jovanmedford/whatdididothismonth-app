
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppPageLayout } from "../_components/app-page-layout";
import { getActivityLogs } from "../_data/activity-log";
import { CalendarLayout } from "./calendar-layout";
import YearSelector from "./year-selector";
import MonthSelector from "./month-selector";
import CalendarTable from "./calendar-table";
import CalendarStack from "./calendar-stack";

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string, month?: string }>
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        redirect("/sign-in")
    }

    const year = Number((await searchParams).year ?? new Date().getFullYear());
    const month = Number((await searchParams).month ?? new Date().getMonth() + 1);

    if (isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
        redirect("/calendar");
    }

    if (isNaN(month) || month < 1 || month > 12) {
        redirect("/calendar");
    }

    const result = await getActivityLogs({ year, month })
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);


    return (
        <AppPageLayout>
            <h1 className="text-center text-2xl font-bold">Calendar</h1>

            <YearSelector searchYear={year} />
            <MonthSelector searchMonth={month} />


            {result.ok ? (
                result.data.length > 0 ? (
                    <CalendarLayout table={<CalendarTable logs={result.data} days={daysArray} />} stack={<CalendarStack logs={result.data} days={daysArray} />} />
                ) : (
                    <p className="text-center">Add activity logs to see them here.</p>
                )
            ) : (
                <p className="text-center text-error">Failed to load activity logs.</p>
            )}
        </AppPageLayout>
    );
}