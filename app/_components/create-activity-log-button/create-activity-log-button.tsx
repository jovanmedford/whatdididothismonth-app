"use client";
import { createActivityLogByLabel } from "@/app/_data/activity-log";
import { Button } from "../button";
import { toast } from "../toast/store";
import { ResponsiveShell } from "../responsive-shell";
import { Scale } from 'lucide-react';
import { ActivityLogForm } from "../activity-log-form";
import clsx from "clsx";
import { useState } from "react";

export function CreateActivityLogButton({ year, month, className }: { year: number, month: number, className?: string }) {
    const [open, setOpen] = useState(false)

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

        setOpen(false)
    }



    return (
        <ResponsiveShell title="Start a new log" open={open} onOpenChange={setOpen} trigger={<Button variant="primary" className={clsx("flex justify-center", className)}>Track an activity <Scale className="ml-2" /></Button>}>
            <div>
                <ActivityLogForm onSubmit={(label, target) => handleSubmit(label, target)} />
            </div>
        </ResponsiveShell>

    );
}