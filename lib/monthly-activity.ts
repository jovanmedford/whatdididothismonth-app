import { prisma } from "@/lib/db";
import type { ActivityLogDto } from "@/app/_data/dtos";

export async function getMonthlyActivityLogsForUser(
    userId: string,
    year: number,
    month: number,
): Promise<ActivityLogDto[]> {
    const logs = await prisma.activityLog.findMany({
        where: {
            activity: { userId },
            year,
            month,
        },
        include: {
            activity: true,
            successLogs: { orderBy: { day: "asc" } },
        },
        orderBy: { activity: { label: "asc" } },
    });

    return logs.map((log) => ({
        id: log.id,
        activityLabel: log.activity.label,
        month: log.month,
        year: log.year,
        target: log.target,
        successes: log.successLogs.map((success) => success.day),
    }));
}
