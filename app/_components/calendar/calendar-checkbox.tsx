"use client"
import { ActivityLogDto } from "@/app/_data/dtos"
import { useSelection } from "@/app/calendar/selection-provider";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function CalendarCheckbox({ log, children, className }: CalendarCheckboxProps) {
    const { selectedLogs, toggleLogSelection } = useSelection();
    const isChecked = selectedLogs.some(selectedLog => selectedLog.id === log.id);

    return (
        <label className={cn(
            "flex min-w-0 cursor-pointer items-center rounded px-2 py-1 transition-colors focus-within:outline-2 focus-within:outline-offset-2",
            isChecked ? "bg-primary-400/10 ring-1 ring-inset ring-primary-400/40" : "hover:bg-highlight",
            className
        )}>
            <input
                className="sr-only"
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleLogSelection(log)}
                aria-label={`Select activity log: ${log.activityLabel}`}
            />
            {children}
        </label>
    )
}

interface CalendarCheckboxProps {
    log: ActivityLogDto
    children?: ReactNode
    className?: string
}
