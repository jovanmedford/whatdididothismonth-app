"use client"

import { CalendarViewDate } from "@/lib/types";
import { useContext, createContext, PropsWithChildren } from "react";

const DateContext = createContext<CalendarViewDate | null>(null)

export function DateProvider({ children, year, month }: DateProviderViewProps) {
    return (
        <DateContext.Provider value={{ year, month }}>
            {children}
        </DateContext.Provider>
    )
}

export function useCalendarDate() {
    const ctx = useContext(DateContext)

    if (!ctx) {
        throw new Error("no date context")
    }

    return ctx
}

type DateProviderViewProps = PropsWithChildren<CalendarViewDate>