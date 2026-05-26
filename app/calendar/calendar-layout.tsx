"use client"
import { useIsMobile } from "../_hooks/useIsMobile";


/**
 * Renders the appropriate layout by screen width. Handles empty.
 */
export const CalendarLayout = ({ table, stack }: { table: React.ReactNode, stack: React.ReactNode }) => {
    const isMobile = useIsMobile();

    if (isMobile === undefined) {
        return null;
    }

    return isMobile ? stack : table
}

