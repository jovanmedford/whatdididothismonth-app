import { ActivityLogDto } from "@/app/_data/dtos"

export interface CalendarViewProps {
    logs: ActivityLogDto[]
    days: number[]
}

export interface UserInput {
    name: string;
    email: string;
}