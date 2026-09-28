import "server-only";
import { prisma } from "@/lib/db";
import { badRequestError, internalError, notFoundError, success } from "@/lib/error";
import { getDaysInMonth } from "@/lib/util";

export async function addSuccessForUser(
    userId: string,
    { day, activityLogId }: { day: number; activityLogId: string },
) {
    if (!Number.isInteger(day) || day < 1 || day > 31) {
        return badRequestError("Invalid day.");
    }

    if (!activityLogId?.trim()) {
        return badRequestError("Activity log ID is required.");
    }

    try {
        const activityLog = await prisma.activityLog.findFirst({
            where: { id: activityLogId, activity: { userId } },
            select: { year: true, month: true },
        });

        if (!activityLog) {
            return notFoundError("Activity log not found.");
        }

        if (day > getDaysInMonth(activityLog.year, activityLog.month)) {
            return badRequestError("Invalid day for this activity log's month.");
        }

        const result = await prisma.successLog.upsert({
            where: { activityLogId_day: { activityLogId, day } },
            update: {},
            create: { activityLogId, day },
        });

        return success(result);
    } catch {
        return internalError();
    }
}
