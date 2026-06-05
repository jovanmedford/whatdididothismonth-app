"use client"

import clsx from "clsx";
import { ActivityLogDto } from "../_data/dtos";
import { useSelection } from "./selection-provider";

export const CalendarRow = ({ children, log }: { children: React.ReactNode; log: ActivityLogDto }) => {
    const { selectedLogs } = useSelection();
    const isSelected = selectedLogs.some(selectedLog => selectedLog.id === log.id);

    return (
        <tr className={clsx("border-b", isSelected && "bg-highlight")}>
            {children}
        </tr>
    )
}