"use client";
import { editActivityLog } from "@/app/_data/activity-log";
import { Button } from "../button";
import { toast } from "../toast/store";
import { ResponsiveShell } from "../responsive-shell";
import { ActivityLogForm } from "../activity-log-form";
import { ActivityLogDto } from "@/app/_data/dtos";
import { Pen } from 'lucide-react';
import { useState } from "react";

export function EditActivityLogButton({ log }: { log: ActivityLogDto }) {
    const [open, setOpen] = useState(false)

    async function handleSubmit(label: string, target: number) {

        const result = await editActivityLog({
            activityLogId: log.id,
            label,
            target
        })

        if (!result.ok) {
            toast.error(result.error.message)
        }

        setOpen(false)
    }



    return (
        <ResponsiveShell open={open} onOpenChange={setOpen} title={`Edit ${log.activityLabel}`} trigger={<Button variant="transparent" aria-label={`Edit ${log.activityLabel}`}><Pen /></Button>}>
            <div>
                <ActivityLogForm label={log.activityLabel} target={log.target} onSubmit={(label, target) => handleSubmit(label, target)} />
            </div>
        </ResponsiveShell>

    );
}