"use client"
import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { ActivityLogDto } from "../_data/dtos";
import { useCalendarDate } from "./date-provider";

const SelectionContext = createContext<SelectionCtx | null>(null)

interface SelectionCtx {
    selectedLogs: ActivityLogDto[];
    toggleLogSelection: (log: ActivityLogDto) => void;
    clearSelection: () => void;
}

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
    const [selectedLogs, setSelectedLogs] = useState<ActivityLogDto[]>([])
    const {year, month} = useCalendarDate()

    useEffect(() => {
        clearSelection()
    }, [year, month])

    function toggleLogSelection(log: ActivityLogDto) {
        setSelectedLogs(prev => {
            if (prev.some(prevLog => prevLog.id === log.id)) {
                return prev.filter(prevLog => prevLog.id !== log.id)
            } else {
                return [...prev, log]
            }
        })
    }

    function clearSelection() {
        setSelectedLogs([]);
    }

    return (
        <SelectionContext.Provider value={{ selectedLogs, toggleLogSelection, clearSelection }}>
            {children}
        </SelectionContext.Provider>
    )
}

export function useSelection() {
    const context = useContext(SelectionContext);

    if (!context) {
        throw new Error("useSelection must be used within a SelectionProvider");
    }

    return context;
}