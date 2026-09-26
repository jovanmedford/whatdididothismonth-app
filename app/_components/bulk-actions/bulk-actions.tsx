"use client";

import { useSelection } from "@/app/calendar/selection-provider";
import { Button } from "../button";
import { DeleteLogsButton } from "../delete-logs-button";
import { X } from "lucide-react";


export function BulkActions() {
    const { selectedLogs, clearSelection } = useSelection();

    if (selectedLogs.length === 0) {
        return <div className="hidden h-13 w-56 md:block" aria-hidden="true" />
    }

    return (
        <div className="fixed inset-x-0 top-0 flex h-13 w-full items-center md:static md:w-56">
            <div role="group" aria-label="Selected activity actions" className="flex h-full w-full items-center justify-center gap-0.5 border-b border-border bg-background px-2 md:h-11 md:w-fit md:justify-start md:rounded-lg md:border md:px-1">
                <Button variant="transparent" size="icon" aria-label="Clear selection" onClick={clearSelection}><X className="size-4.5" /></Button>
                <span className="whitespace-nowrap px-1 text-sm font-medium text-text">{selectedLogs.length} selected</span>
                <DeleteLogsButton logs={selectedLogs.map((log) => log.id)} />
            </div>
        </div>
    );
}
