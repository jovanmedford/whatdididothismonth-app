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
                        <td className="p-4">
                            <div className="grid grid-cols-2 gap-y-4 lg:grid-cols-3 2xl:grid-cols-5">
                                {weekGroups.map((week, weekIndex) => (
                                    <div
                                        key={`week-${weekIndex}`}
                                        className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center"
                                        role="group"
                                        aria-label={`Week ${weekIndex + 1}`}
                                    >
                                        <div className="col-start-2 flex gap-1">
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
                                        {weekIndex < weekGroups.length - 1 && (
                                            <div className="col-start-3 flex justify-end" aria-hidden="true">
                                                <span className="h-4 w-px bg-text-light/50" />
                                            </div>
                                        )}
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
