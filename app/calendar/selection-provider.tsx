"use client"
import { createContext, useState, ReactNode, useContext } from "react";
import { ActivityLogDto } from "../_data/dtos";

const SelectionContext = createContext<SelectionCtx | null>(null)

interface SelectionCtx {
    selectedLogs: ActivityLogDto[];
    toggleLogSelection: (log: ActivityLogDto) => void;
}

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
    const [selectedLogs, setSelectedLogs] = useState<ActivityLogDto[]>([])

    function toggleLogSelection(log: ActivityLogDto) {
        setSelectedLogs(prev => {
            if (prev.some(prevLog => prevLog.id === log.id)) {
                return prev.filter(prevLog => prevLog.id !== log.id)
            } else {
                return [...prev, log]
            }
        })
    }

    return (
        <SelectionContext.Provider value={{ selectedLogs, toggleLogSelection }}>
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