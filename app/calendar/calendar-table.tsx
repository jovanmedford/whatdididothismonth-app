import { CalendarViewProps } from "@/lib/types"
import { SuccessSquare } from "../_components/success-square"
import { EditActivityLogButton } from "../_components/edit-activity-log-button"
import { CalendarRow } from "./calendar-row"
import { CalendarCheckbox } from "../_components/calendar"


export default function CalendarTable({ logs, days }: CalendarViewProps) {
    return (
        <table className="w-full">
            <tbody>
                {logs.map(log => (
                    <CalendarRow key={log.id} log={log}>
                        <td className="border-r py-4 pr-4 ">
                            <div className="flex items-center gap-6">
                                <CalendarCheckbox log={log} />
                                <div className="flex justify-between w-full">
                                    <div>
                                        {log.activityLabel}
                                        <span className="block">{log.successes.length} / {log.target}</span>
                                    </div>
                                    <EditActivityLogButton log={log} />
                                </div>
                            </div>
                        </td>
                        <td className="grid grid-cols-16 gap-4 p-4">
                            {days.map((day) => <SuccessSquare key={day} activityLogId={log.id} day={day} initialChecked={log.successes.includes(day)} />)}
                        </td>
                    </CalendarRow>
                ))}
            </tbody>
        </table>
    )
}
