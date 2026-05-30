"use server"
import { badRequestError, internalError, notFoundError, success, unauthorizedError } from "@/lib/error";
import { verifySession } from "./auth";
import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { UserDto } from "./dtos";
import { revalidatePath } from "next/cache";

export async function addSuccess({ day, activityLogId, sessionAuth = verifySession }: { day: number, activityLogId: string, sessionAuth?: () => Promise<UserDto | null> }) {
    const user = await sessionAuth()

    if (!user) {
        return unauthorizedError()
    }

    if (day < 1 || day > 31) {
        return badRequestError("Invalid day.")
    }

    if (!activityLogId) {
        return badRequestError("Activity log ID is required.")
    }


    try {
        const existingActivityLog = await prisma.activityLog.findFirst({
            where: {
                activity: {
                    owner: {
                        id: user.id,
                    }
                },
                id: activityLogId,
            }
        })

        if (!existingActivityLog) {
            return notFoundError("Activity log not found.")
        }

        const successResult = await prisma.successLog.upsert({
            where: {
                activityLogId_day: {
                    activityLogId,
                    day,
                }
            },
            update: {},
            create: {
                activityLogId,
                day,
            }
        })

        revalidatePath("/calendar")
        return success(successResult)
    } catch (e) {
        if (e instanceof Error) {
            return internalError(e.message)
        }

        return internalError()
    }
}

export async function deleteSuccess({ day, activityLogId, sessionAuth = verifySession }: { day: number, activityLogId: string, sessionAuth?: () => Promise<UserDto | null> }) {
    const user = await sessionAuth()

    if (!user) {
        return unauthorizedError()
    }

    if (day < 1 || day > 31) {
        return badRequestError("Invalid day.")
    }

    if (!activityLogId) {
        return badRequestError("Activity log ID is required.")
    }

    try {
        const existingActivityLog = await prisma.activityLog.findFirst({
            where: {
                activity: {
                    owner: {
                        id: user.id,
                    }
                },
                id: activityLogId,
            }
        })

        if (!existingActivityLog) {
            return notFoundError("Activity log not found.")
        }

        const result = await prisma.successLog.delete({
            where: {
                activityLogId_day: {
                    activityLogId,
                    day,
                }
            }
        })

        revalidatePath("/calendar")
        return success(result)
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
            return notFoundError("Success log not found.")
        }

        if (e instanceof Error) {
            return internalError(e.message)
        }

        return internalError()
    }
}