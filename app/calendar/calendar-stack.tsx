import { CalendarViewProps } from "@/lib/types";
import {SuccessSquare} from "../_components/success-square";

export default function CalendarStack({ logs, days }: CalendarViewProps) {
    return (
        <div className="flex flex-col gap-12 mb-8">
            {logs.map(log => (
                <div key={log.id} >
                    {log.activityLabel}
                    <span className="block">{log.successes.length} / {log.target}</span>
                    <div className="grid grid-cols-7 gap-y-2 mt-2">
                        {days.map((day) => <SuccessSquare key={day} activityLogId={log.id} day={day} initialChecked={log.successes.includes(day)} />)}
                    </div>
                </div>

            ))}
        </div>
    )

}