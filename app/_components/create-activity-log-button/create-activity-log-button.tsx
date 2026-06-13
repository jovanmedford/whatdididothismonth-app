"use client";
import { createActivityLogByLabel } from "@/app/_data/activity-log";
import { Button } from "../button";
import { toast } from "../toast/store";
import { ResponsiveShell } from "../responsive-shell";
import { Scale } from 'lucide-react';
import { ActivityLogForm } from "../activity-log-form";
import clsx from "clsx";

export function CreateActivityLogButton({ year, month, className }: { year: number, month: number, className?: string }) {
    async function handleSubmit(label: string, target: number) {

        const result = await createActivityLogByLabel({
            label,
            month,
            year,
            target
        })

        if (!result.ok) {
            toast.error(result.error.message)
        }
    }



    return (
        <ResponsiveShell title="Start a new log" trigger={<Button variant="primary" className={clsx("flex justify-center", className)}>Track an activity <Scale className="ml-2" /></Button>}>
            <div>
                <ActivityLogForm onSubmit={(label, target) => handleSubmit(label, target)} />
            </div>
        </ResponsiveShell>

    );
}