import CalendarTable from "./calendar-table";
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
            <CalendarTable logs={logs} />
        </div>
    )
}

