"use client"
import { CalendarViewProps } from "@/lib/types";
import { SuccessSquare } from "../_components/success-square";
import { EditActivityLogButton } from "../_components/edit-activity-log-button";
import { CalendarCheckbox } from "../_components/calendar";
import { CalendarLabel } from "./calendar-label";
import { getReachedStatus } from "@/lib/util";
import { useCalendarDate } from "./date-provider";
import { getToday, isDayDisabled } from "./status-helpers";

export default function CalendarStack({ logs, days }: CalendarViewProps) {
    const { year, month } = useCalendarDate()
    const today = getToday()
    return (
        <div className="flex flex-col gap-12 mb-8">
            {logs.map(log => (
                <div key={log.id} >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <CalendarCheckbox className="size-7" log={log} />
                            <CalendarLabel label={log.activityLabel} successes={log.successes.length} target={log.target} />
                        </div>
                        <EditActivityLogButton log={log} />
                    </div>
                    <div className="grid grid-cols-7 gap-2 gap-y-4 mt-2">
                        {days.map((day) => <SuccessSquare className="w-full h-15" key={day} disabled={isDayDisabled({ year, month, day }, today)} activityLogId={log.id} day={day} initialChecked={log.successes.includes(day)} isReached={getReachedStatus(log)} />)}
                    </div>
                </div>

            ))}
        </div>
    )

}