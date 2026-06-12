"use client"
import { CalendarViewProps } from "@/lib/types"
import { SuccessSquare } from "../_components/success-square"
import { EditActivityLogButton } from "../_components/edit-activity-log-button"
import { CalendarRow } from "./calendar-row"
import { CalendarCheckbox } from "../_components/calendar"
import { CalendarLabel } from "./calendar-label"
import { getReachedStatus } from "@/lib/util"
import { useCalendarDate } from "./date-provider"
import { getToday, isDayDisabled } from "./status-helpers"


export default function CalendarTable({ logs, days }: CalendarViewProps) {
    const { year, month } = useCalendarDate()
    const today = getToday()
    return (
        <table className="w-full">
            <tbody>
                {logs.map(log => (
                    <CalendarRow key={log.id} log={log}>
                        <td className="border-r py-4 pr-4 ">
                            <div className="flex items-center gap-6">
                                <CalendarCheckbox log={log} />
                                <div className="flex justify-between w-full">
                                    <CalendarLabel label={log.activityLabel} successes={log.successes.length} target={log.target} />
                                    <EditActivityLogButton log={log} />
                                </div>
                            </div>
                        </td>
                        <td className="grid grid-cols-16 gap-4 p-4">
                            {days.map((day) => <SuccessSquare key={day} activityLogId={log.id} day={day} disabled={isDayDisabled({ year, month, day }, today)} initialChecked={log.successes.includes(day)} isReached={getReachedStatus(log)} />)}
                        </td>
                    </CalendarRow>
                ))}
            </tbody>
        </table>
    )
}
