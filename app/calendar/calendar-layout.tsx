import { ActivityLogDto } from "../_data/dtos"

/**
 * Renders the appropriate layout by screen width. Handles empty.
 */
export const CalendarLayout = ({ logs }: { logs: ActivityLogDto[] }) => {

    if (logs.length === 0) {
        return (
            <div className="text-center text-gray-500">
                <p>Add a new log to start tracking!</p>
            </div>
        )
    }

    return (
        <div>
            {logs.map(log => (
                <div key={log.id} className="border p-4 rounded mb-4">
                    <h2 className="text-lg font-semibold">{log.activityLabel}</h2>
                    <p>Success Logs: {log.successes.join(", ")}</p>
                </div>
            ))}
        </div>
    )
}
