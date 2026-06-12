"use client";

import { useSelection } from "@/app/calendar/selection-provider";
import { Button } from "../button";
import { DeleteLogsButton } from "../delete-logs-button";
import { X } from "lucide-react";


export function BulkActions() {
    const { selectedLogs, clearSelection } = useSelection();

    return (
        <div className="fixed top-0 left-0 right-0 md:static flex w-full md:w-fit  box-border h-13 ">
            {selectedLogs.length > 0 ? (
                <div className="w-full md:w-fit justify-center flex gap-4  items-center bg-highlight border px-1 rounded">
                    <Button variant="transparent" onClick={() => clearSelection()}><X /></Button>
                    <span>{selectedLogs.length} Selected</span>
                    <DeleteLogsButton logs={selectedLogs.map((log) => log.id)} />
                </div>
            ) : <Button variant="transparent">
                <div className="size-4"></div>
            </Button>}
        </div>
    );
}