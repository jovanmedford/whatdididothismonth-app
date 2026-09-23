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
        <span className="block">
            <span className="flex gap-1">
                <span role="heading" aria-level={2}>{label}</span>
                <ActivityLogBadge status={status} />
            </span>
            <span className="block">{successes} / {target}</span>
        </span>
    )
}

interface CalendarLabelProps {
    label: string
    successes: number
    target: number
}
