"use client";

import { useSelection } from "@/app/calendar/selection-provider";
import { Button } from "../button";
import { Trash, RotateCw } from 'lucide-react';
import { CheckBox } from "../calendar/checkbox";


export function BulkActions() {
    const { selectedLogs } = useSelection();

    return (
        <div className="flex items-center gap-2  box-border h-13 ">
            <CheckBox label="Select log" onChange={() => { console.log("SELECT ALL") }} />

            {selectedLogs.length > 0 ? (
                <Button variant="transparent">
                    <Trash className="size-4" />
                </Button>
            ) : <Button variant="transparent">
                <RotateCw className="size-4" />
            </Button>}
        </div>
    );
}