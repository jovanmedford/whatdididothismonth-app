import { ActivityLogDto } from "@/app/_data/dtos"
import { MAX_ACTIVITY_LABEL_LENGTH } from "./constants"

const DAYS_PER_WEEK = 7
const SUNDAY_INDEX = 0
const SATURDAY_INDEX = DAYS_PER_WEEK - 1
const JAVASCRIPT_MONTH_INDEX_OFFSET = 1

export const clsx = (...args: (string | boolean | null | undefined)[]) => {
    return args.filter(Boolean).join(" ")
}

/**
 * Normalizes a label by trimming whitespace, collapsing multiple spaces into one, and converting to lowercase.
 */
export const normalizeLabel = (label: string) => {
    return label.trim().replace(/\s+/g, ' ').toLowerCase()
}

export const validateMonth = (month: number) => {
    return !Number.isNaN(month) && month >= 1 && month <= 12
}

export const validateYear = (year: number) => {
    const currentYear = new Date().getFullYear()
    return !Number.isNaN(year) && year > 0 && year <= currentYear
}

export const validateTarget = (target: number) => {
    return !Number.isNaN(target) && target > 0
}

export const validateLabel = (label: string) => {
    return label && label.trim() && label.length <= MAX_ACTIVITY_LABEL_LENGTH
}

export const validateInput = (input: any, validators: ((value: any) => boolean)[]) => {
    return validators.every(validate => validate(input))
}

export const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export const getWeekday = (year: number, month: number, day: number) => {
    return new Date(year, month - JAVASCRIPT_MONTH_INDEX_OFFSET, day).getDay()
}

export const groupDaysBySaturday = (days: number[], year: number, month: number) => {
    const groups: Array<Array<number | null>> = []
    const leadingDays = (getWeekday(year, month, days[0]) - SUNDAY_INDEX + DAYS_PER_WEEK) % DAYS_PER_WEEK
    let currentGroup: Array<number | null> = Array<null>(leadingDays).fill(null)

    for (const day of days) {
        currentGroup.push(day)

        if (getWeekday(year, month, day) === SATURDAY_INDEX) {
            groups.push(currentGroup)
            currentGroup = []
        }
    }

    if (currentGroup.length > 0) {
        currentGroup.push(...Array<null>(DAYS_PER_WEEK - currentGroup.length).fill(null))
        groups.push(currentGroup)
    }

    return groups
}

export const getReachedStatus = (log: ActivityLogDto) => {
    return log.successes.length >= log.target
}
