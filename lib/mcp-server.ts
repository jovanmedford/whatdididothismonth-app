import { getMonthlyActivityLogsForUser } from "@/lib/monthly-activity";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
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

    return server;
});
