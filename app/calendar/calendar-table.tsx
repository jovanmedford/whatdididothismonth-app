"use client"
import { CalendarViewProps } from "@/lib/types"
import { SuccessSquare } from "../_components/success-square"
import { EditActivityLogButton } from "../_components/edit-activity-log-button"
import { CalendarRow } from "./calendar-row"
import { CalendarCheckbox } from "../_components/calendar"
import { CalendarLabel } from "./calendar-label"
import { getReachedStatus, groupDaysBySaturday } from "@/lib/util"
import { useCalendarDate } from "./date-provider"
import { getToday, isDayDisabled } from "./status-helpers"


export default function CalendarTable({ logs, days }: CalendarViewProps) {
    const { year, month } = useCalendarDate()
    const today = getToday()
    const weekGroups = groupDaysBySaturday(days, year, month)

    return (
        <table className="w-full table-fixed">
            <colgroup>
                <col className="w-44 lg:w-56 xl:w-64" />
                <col />
            </colgroup>
            <tbody>
                {logs.map(log => (
                    <CalendarRow key={log.id} log={log}>
                        <td className="relative border-r p-0">
                            <CalendarCheckbox className="absolute inset-0 rounded-none p-0" log={log} />
                            <div className="pointer-events-none relative flex h-full items-center px-4 py-4">
                                <CalendarLabel label={log.activityLabel} successes={log.successes.length} target={log.target} />
                                <div className="pointer-events-auto relative z-10 ml-auto flex items-center">
                                    <EditActivityLogButton log={log} />
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-wrap gap-x-4 gap-y-4">
                                {weekGroups.map((week, weekIndex) => (
                                    <div
                                        key={`week-${weekIndex}`}
                                        className="flex w-59 shrink-0 gap-0.5"
                                        role="group"
                                        aria-label={`Week ${weekIndex + 1}`}
                                    >
                                        {week.map((day, dayIndex) => day === null ? (
                                            <span key={`empty-${dayIndex}`} className="size-8" aria-hidden="true" />
                                        ) : (
                                            <SuccessSquare
                                                key={day}
                                                className="size-8"
                                                activityLogId={log.id}
                                                day={day}
                                                disabled={isDayDisabled({ year, month, day }, today)}
                                                initialChecked={log.successes.includes(day)}
                                                isReached={getReachedStatus(log)}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </td>
                    </CalendarRow>
                ))}
            </tbody>
        </table>
    )
}
