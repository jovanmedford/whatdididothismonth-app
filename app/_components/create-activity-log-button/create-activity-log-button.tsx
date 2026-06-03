"use client";
import { createActivityLogByLabel } from "@/app/_data/activity-log";
import { Button } from "../button";
import { toast } from "../toast/store";
import { ResponsiveShell } from "../responsive-shell";
import { Scale } from 'lucide-react';
import { ActivityLogForm } from "../activity-log-form";

export function CreateActivityLogButton({ year, month }: { year: number, month: number }) {
    async function handleSubmit(label: string, target: number) {
        console.log({ label, target, year, month })

        const result = await createActivityLogByLabel({
            label,
            month,
            year,
            target
        })

        if (!result.ok) {
            toast.error(result.error.message)
        }

        console.log(result)
    }



    return (
        <ResponsiveShell title="Start a new log" trigger={<Button variant="primary" className="fixed bottom-20 left-20 right-20 md:static flex justify-center">Start tracking an activity <Scale className="ml-2" /></Button>}>
            <div>
                <ActivityLogForm onSubmit={(label, target) => handleSubmit(label, target)} />
            </div>
        </ResponsiveShell>

    );
}