import Square from "../_components/square/square"
import { CalendarViewProps } from "@/lib/types"

export default function CalendarTable({ logs, days }: CalendarViewProps) {
    return (
        <table className="w-full">
            <tbody>
                {logs.map(log => (
                    <tr key={log.id} className="border-b">
                        <td className="p-4 border-r">
                            {log.activityLabel}
                            <span className="block">{log.successes.length} / {log.target}</span>
                        </td>
                        <td className="grid grid-cols-16 gap-4 p-4">
                            {days.map((day) => <Square className="size-8" key={day} isChecked={log.successes.includes(day)} />)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
