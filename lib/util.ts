import { MAX_ACTIVITY_LABEL_LENGTH } from "./constants"

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