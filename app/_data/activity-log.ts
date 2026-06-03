"use server"
import { verifySession } from "./auth"
import { prisma } from "@/lib/db";
import { ActivityLogDto, UserDto } from "./dtos";
import { badRequestError, conflictError, internalError, notFoundError, Result, success, unauthorizedError } from "@/lib/error";
import { revalidatePath } from "next/cache";
import { normalizeLabel, validateLabel, validateMonth, validateTarget, validateYear } from "@/lib/util";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ACTIVITY_EXISTS_MESSAGE, LOG_ALREADY_EXISTS_MESSAGE } from "@/lib/messages";


export const getActivityLogs = async ({ year, month }: { year: number, month: number }): Promise<Result<ActivityLogDto[]>> => {
    const user = await verifySession()

    if (!user) {
        return unauthorizedError("Unauthorized")
    }

    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12 || year > new Date().getFullYear()) {
        return badRequestError("Invalid year or month")
    }

    try {
        const logs = await prisma.activityLog.findMany({
            where: {
                activity: {
                    owner: { id: user.id }
                },
                month,
                year,
            },
            include: {
                activity: true,
                successLogs: true,
            }, orderBy: {
                activity: {
                    label: "asc"
                }
            }
        });

        return success(logs.map(log => ({
            id: log.id,
            activityLabel: log.activity.label,
            month: log.month,
            year: log.year,
            target: log.target,
            successes: log.successLogs.map(successLog => successLog.day)
        })))
    } catch (error) {
        return internalError("Failed to fetch activity logs")
    }
}


export const createActivityLogByLabel = async ({ label, month, year, target, sessionAuth = verifySession, revalidateFn = revalidatePath }: CreateActivityLogByLabelInput): Promise<Result<ActivityLogDto>> => {
    const user = await sessionAuth()

    if (!user) {
        return unauthorizedError("Unauthorized")
    }

    if (!validateLabel(label) || !validateMonth(month) || !validateYear(year) || !validateTarget(target)) {
        return badRequestError("Invalid input")
    }

    try {
        const activityLog = await prisma.$transaction(async (tx) => {
            const activity = await tx.activity.upsert({
                where: {
                    userId_normalizedLabel: {
                        normalizedLabel: normalizeLabel(label),
                        userId: user.id
                    }
                },
                create: {
                    label,
                    userId: user.id
                },
                update: {}
            })


            return await tx.activityLog.create({
                data: {
                    month,
                    year,
                    target,
                    activityId: activity.id
                }
            })
        })

        revalidateFn("/calendar")
        return success({
            id: activityLog.id,
            activityLabel: label,
            month: activityLog.month,
            year: activityLog.year,
            target: activityLog.target,
            successes: []
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return conflictError(LOG_ALREADY_EXISTS_MESSAGE)
            }
        }

        if (error instanceof Error) {
            return internalError(error.message)
        }
        return internalError("Failed to create activity log")
    }
}

export const createActivityLogById = async ({ activityId, month, year, target, sessionAuth = verifySession, revalidateFn = revalidatePath }: CreateActivityLogByIdInput): Promise<Result<ActivityLogDto>> => {
    const user = await sessionAuth()

    if (!user) {
        return unauthorizedError("Unauthorized")
    }

    if (!activityId || typeof activityId !== "string" || !validateMonth(month) || !validateYear(year) || !validateTarget(target)) {
        return badRequestError("Invalid input")
    }

    try {
        await prisma.activity.findFirstOrThrow({
            where: {
                userId: user.id,
                id: activityId
            }
        })

        const activityLog = await prisma.activityLog.create({
            include: {
                activity: true
            },
            data: {
                month,
                year,
                target,
                activityId
            }
        })

        revalidateFn("/calendar")
        return success({
            id: activityLog.id,
            activityLabel: activityLog.activity.label,
            month: activityLog.month,
            year: activityLog.year,
            target: activityLog.target,
            successes: []
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return conflictError(LOG_ALREADY_EXISTS_MESSAGE)
            }

            if (error.code === "P2025") {
                return notFoundError("Activity not found")
            }
        }

        if (error instanceof Error) {
            return internalError(error.message)
        }
        return internalError("Failed to create activity log")
    }
}

export const editActivityLog = async ({ activityLogId, label, target, sessionAuth = verifySession, revalidateFn = revalidatePath }: EditActivityLogInput): Promise<Result<ActivityLogDto>> => {
    const user = await sessionAuth()

    if (!user) {
        return unauthorizedError("Unauthorized")
    }

    // Validate BEFORE any DB work so bad input short-circuits ahead of the
    // rename attempt — a request that is both invalid and colliding is BAD_REQUEST.
    if (!activityLogId || typeof activityLogId !== "string" || !validateLabel(label) || !validateTarget(target)) {
        return badRequestError("Invalid input")
    }

    // ownership-scoped lookup: log must belong to one of the user's activities
    const log = await prisma.activityLog.findFirst({
        where: { id: activityLogId, activity: { userId: user.id } },
    })

    if (!log) {
        return notFoundError("Activity log not found")
    }

    try {
        const updated = await prisma.$transaction(async (tx) => {
            await tx.activity.update({
                where: { id: log.activityId },
                data: { label },
            })
            return tx.activityLog.update({
                where: { id: log.id },
                data: { target },
                include: { activity: true, successLogs: true },
            })
        })

        revalidateFn("/calendar")
        return success({
            id: updated.id,
            activityLabel: updated.activity.label,
            month: updated.month,
            year: updated.year,
            target: updated.target,
            successes: updated.successLogs.map(s => s.day),
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return conflictError(ACTIVITY_EXISTS_MESSAGE)
            }
        }
        if (error instanceof Error) {
            return internalError(error.message)
        }
        return internalError("Failed to edit activity log")
    }
}

export interface ActivityLogInputBase {
    month: number;
    year: number;
    target: number;
    sessionAuth?: () => Promise<UserDto | null>;
    revalidateFn?: (path: string) => void;
}

export interface CreateActivityLogByLabelInput extends ActivityLogInputBase {
    label: string;
}

export interface CreateActivityLogByIdInput extends ActivityLogInputBase {
    activityId: string;
}

export interface EditActivityLogInput {
    activityLogId: string
    label: string
    target: number
    sessionAuth?: () => Promise<UserDto | null>;
    revalidateFn?: (path: string) => void;
}