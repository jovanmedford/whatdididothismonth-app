import { getMonthlyActivityLogsForUser } from "@/lib/monthly-activity";
import { addSuccessForUser } from "@/lib/success-logs";
import { createMcpHandler, McpServer, requireScopes } from "@modelcontextprotocol/server";
import { revalidatePath } from "next/cache";
import * as z from "zod";

export const mcpHandler = createMcpHandler(({ authInfo }) => {
    const userId = authInfo?.extra?.userId;
    if (typeof userId !== "string" || !userId) {
        throw new Error("Authenticated user is missing");
    }

    const server = new McpServer({ name: "whatdididothismonth", version: "1.0.0" });

    server.registerTool(
        "get_month_activity",
        {
            title: "Get month activity",
            description: "Read the signed-in user's activity goals and completed days for a month. Omit year and month for the current UTC month.",
            inputSchema: z.object({
                year: z.number().int().min(2000).max(9999).optional(),
                month: z.number().int().min(1).max(12).optional(),
            }),
            annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        },
        async ({ year: requestedYear, month: requestedMonth }) => {
            const now = new Date();
            const year = requestedYear ?? now.getUTCFullYear();
            const month = requestedMonth ?? now.getUTCMonth() + 1;
            const logs = await getMonthlyActivityLogsForUser(userId, year, month);
            const summary = {
                year,
                month,
                activities: logs.map((log) => ({
                    activityLogId: log.id,
                    label: log.activityLabel,
                    target: log.target,
                    completedDays: log.successes,
                    completionCount: log.successes.length,
                    targetReached: log.successes.length >= log.target,
                })),
            };

            return {
                content: [{ type: "text", text: JSON.stringify(summary) }],
                structuredContent: summary,
            };
        },
    );

    server.registerTool(
        "add_success_log",
        {
            title: "Add success log",
            description: "Mark a day as completed for one of the signed-in user's monthly activity logs. Use an activityLogId from get_month_activity; day belongs to that log's year and month. Adding an already completed day leaves it unchanged. Requires activity:write permission.",
            inputSchema: z.object({
                activityLogId: z.string().trim().min(1).describe("The activityLogId returned by get_month_activity."),
                day: z.number().int().min(1).max(31).describe("Day of the month to mark as completed."),
            }),
            scopeChallenge: requireScopes("activity:read", "activity:write"),
            annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
        },
        async ({ activityLogId, day }) => {
            const result = await addSuccessForUser(userId, { activityLogId, day });
            if (!result.ok) {
                return {
                    isError: true,
                    content: [{ type: "text", text: result.error.message }],
                };
            }

            revalidatePath("/calendar");
            return {
                content: [{ type: "text", text: JSON.stringify(result.data) }],
                structuredContent: result.data,
            };
        },
    );

    return server;
});
