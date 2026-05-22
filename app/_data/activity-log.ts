import { verifySession } from "./auth"
import { prisma } from "@/lib/db";
import { ActivityLogDto } from "./dtos";
import { badRequestError, internalError, Result, success } from "@/lib/error";


export const getActivityLogs = async ({ year, month }: { year: number, month: number }): Promise<Result<ActivityLogDto[]>> => {
    const user = await verifySession()

    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12 || year > new Date().getFullYear()) {
        return badRequestError("Invalid year or month")
    }

    try {
        const logs = await prisma.activityLog.findMany({
            where: {
                activity: {
                    owner: { email: "jovan@wdidtm.com" }
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
            successes: log.successLogs.map(successLog => successLog.date.getDate())
        })))
    } catch (error) {
        return internalError("Failed to fetch activity logs")
    }
}

