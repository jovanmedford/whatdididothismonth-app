import { ActivityLogDto } from "../_data/dtos"
import Square from "../_components/square/square"

export default function CalendarTable({ logs }: { logs: ActivityLogDto[] }) {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    return (
        <table className="w-full">
            <tbody>
                {logs.map(log => (
                    <tr key={log.id} className="border-b">
                        <td className="p-4 border-r">
                            {log.activityLabel}
                            <span className="block">{log.successes.length} / {daysInMonth}</span>
                        </td>
                        <td className="grid grid-cols-16 gap-4 p-4">
                            {days.map((day) => <Square key={day} isChecked={log.successes.includes(day)} />)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
