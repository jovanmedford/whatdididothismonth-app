"use client";

import { useSelection } from "@/app/calendar/selection-provider";
import { Button } from "../button";
import { RotateCw } from 'lucide-react';
import { CheckBox } from "../calendar/checkbox";
import { DeleteLogsButton } from "../delete-logs-button";


export function BulkActions() {
    const { selectedLogs } = useSelection();

    return (
        <div className="flex items-center gap-2  box-border h-13 ">
            <CheckBox label="Select log" onChange={() => { console.log("SELECT ALL") }} />

            {selectedLogs.length > 0 ? (
                <DeleteLogsButton logs={selectedLogs.map((log) => log.id)} />
            ) : <Button variant="transparent">
                <RotateCw className="size-4" />
            </Button>}
        </div>
    );
}