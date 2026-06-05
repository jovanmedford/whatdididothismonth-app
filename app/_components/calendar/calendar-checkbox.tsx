"use client"
import { ActivityLogDto } from "@/app/_data/dtos"
import { useSelection } from "@/app/calendar/selection-provider";
import clsx from "clsx";
import { Check } from 'lucide-react';

export function CalendarCheckbox({ log, className }: { log: ActivityLogDto; className?: string }) {
    const { selectedLogs, toggleLogSelection } = useSelection();
    const isChecked = selectedLogs.some(selectedLog => selectedLog.id === log.id);

    return (
        <label className={clsx("block cursor-pointer focus-within:outline-2 relative p-2 checkbox-parent size-4 border border-text rounded", isChecked ? "bg-text border-primary-400" : "hover:bg-highlight", className)}>
            <p className="sr-only">Select log: {log.activityLabel}</p>
            <input
                className="sr-only"
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleLogSelection(log)}
            />
            {isChecked && <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white size-4" />}
        </label>
    )
}