import { ActivityLogStatus, CalendarViewDate, CalendarViewToday } from "@/lib/types"
import { getDaysInMonth } from "@/lib/util"


export function getToday() {
    const date = new Date()

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
    }
}

export function getDaysRemaining(calendarDate: CalendarViewDate, today: CalendarViewToday) {
    if (calendarDate.year !== today.year || calendarDate.month !== today.month) {
        return 0
    }

    const daysInMonth = getDaysInMonth(today.year, today.month)

    return daysInMonth - today.day
}

/**
 * Determines the activity log status
 */
export function getLogStatus({ successes, target, daysRemaining }: { successes: number, target: number, daysRemaining: number }): ActivityLogStatus {
    if (successes >= target) {
        return "SUCCESS"
    }

    if (target - successes > daysRemaining) {
        return "OUT_OF_REACH"
    }

    return "IN_PROGRESS"
}



