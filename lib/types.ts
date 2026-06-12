import { ActivityLogDto } from "@/app/_data/dtos"

export interface CalendarViewProps {
    logs: ActivityLogDto[]
    days: number[]
}

export interface UserInput {
    name: string;
    email: string;
}

export interface ActivityInput {
    label: string;
}

export type ActivityLogStatus = "SUCCESS" | "OUT_OF_REACH" | "IN_PROGRESS"

export interface CalendarViewDate {
    year: number
    month: number
}

export interface CalendarViewFullDate extends CalendarViewDate{
    day: number
}