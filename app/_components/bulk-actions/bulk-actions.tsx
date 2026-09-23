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
        <div className="fixed top-0 left-0 right-0 md:static flex w-full md:w-56 box-border h-13">
            <div className="w-full justify-center flex gap-4 items-center bg-highlight border px-1 rounded">
                <Button variant="transparent" aria-label="Clear selection" onClick={clearSelection}><X /></Button>
                <span>{selectedLogs.length} Selected</span>
                <DeleteLogsButton logs={selectedLogs.map((log) => log.id)} />
            </div>
        </div>
    );
}
