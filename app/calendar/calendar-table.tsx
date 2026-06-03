import { CalendarViewProps } from "@/lib/types"
import { SuccessSquare } from "../_components/success-square"
import { EditActivityLogButton } from "../_components/edit-activity-log-button"


export default function CalendarTable({ logs, days }: CalendarViewProps) {
    return (
        <table className="w-full">
            <tbody>
                {logs.map(log => (
                    <tr key={log.id} className="border-b">
                        <td className="p-4 border-r">
                            {log.activityLabel}
                            <span className="block">{log.successes.length} / {log.target}</span>
                            <EditActivityLogButton log={log} />
                        </td>
                        <td className="grid grid-cols-16 gap-4 p-4">
                            {days.map((day) => <SuccessSquare key={day} activityLogId={log.id} day={day} initialChecked={log.successes.includes(day)} />)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
