"use client"

import { ActivityLogBadge } from "../_components/activity-log-badge"
import { useCalendarDate } from "./date-provider"
import { getDaysRemaining, getLogStatus, getToday } from "./status-helpers"

export function CalendarLabel({ label, successes, target }: CalendarLabelProps) {
    const viewDate = useCalendarDate()
    const today = getToday()
    const daysRemaining = getDaysRemaining(viewDate, today)
    const status = getLogStatus({ successes, target, daysRemaining })
    return (
        <div>
            <div className="flex gap-1">
                <h2>{label}</h2>
                <ActivityLogBadge status={status} />
            </div>
            <span className="block">{successes} / {target}</span>
        </div>
    )
}

interface CalendarLabelProps {
    label: string
    successes: number
    target: number
}