import { ActivityLogDto } from "@/app/_data/dtos"

export interface CalendarViewProps {
    logs: ActivityLogDto[]
    days: number[]
}