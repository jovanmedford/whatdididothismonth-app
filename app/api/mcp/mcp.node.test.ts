import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { mcpHandler } from "@/lib/mcp-server";
import { mcpResourceUrl } from "@/lib/mcp-config";
import { getMonthlyActivityLogsForUser } from "@/lib/monthly-activity";
import { addSuccessForUser } from "@/lib/success-logs";
import { notFoundError, success } from "@/lib/error";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/monthly-activity", () => ({ getMonthlyActivityLogsForUser: vi.fn() }));
vi.mock("@/lib/success-logs", () => ({ addSuccessForUser: vi.fn() }));

const userId = "mcp-user";
const activityLogId = "activity-log";
const successLog = { id: "success-log", activityLogId, day: 28 };

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(addSuccessForUser).mockResolvedValue(success(successLog));
    vi.mocked(getMonthlyActivityLogsForUser).mockResolvedValue([{
        id: activityLogId, activityLabel: "Reading", year: 2026, month: 2, target: 10, successes: [],
    }]);
});

function request(
    method: string,
    params: Record<string, unknown> = {},
    scopes = ["activity:read", "activity:write"],
    modern = false,
) {
    return mcpHandler.fetch(new Request(mcpResourceUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
            ...(modern ? {
                "MCP-Protocol-Version": "2026-07-28",
                "Mcp-Method": method,
                ...(typeof params.name === "string" ? { "Mcp-Name": params.name } : {}),
            } : {}),
        },
        body: JSON.stringify({
            jsonrpc: "2.0", id: 1, method,
            params: {
                ...params,
                ...(modern ? { _meta: {
                    "io.modelcontextprotocol/protocolVersion": "2026-07-28",
                    "io.modelcontextprotocol/clientInfo": { name: "test-client", version: "1.0.0" },
                    "io.modelcontextprotocol/clientCapabilities": {},
                } } : {}),
            },
        }),
    }), {
        authInfo: {
            token: "verified-test-token", clientId: "test-client", scopes,
            resource: new URL(mcpResourceUrl), extra: { userId },
        },
    });
}

async function toolResult(response: Response) {
    expect(response.status, await response.clone().text()).toBe(200);
    const text = await response.text();
    const body = response.headers.get("content-type")?.includes("text/event-stream")
        ? JSON.parse(text.split("\n").find(line => line.startsWith("data: "))!.slice(6))
        : JSON.parse(text);
    expect(body.error).toBeUndefined();
    return body.result;
}

async function addLog(arguments_: Record<string, unknown>, modern = false) {
    return toolResult(await request("tools/call", { name: "add_success_log", arguments: arguments_ }, undefined, modern));
}

describe("MCP success logs", () => {
    it("advertises the write tool and its required inputs", async () => {
        const listed = await toolResult(await request("tools/list", {}, ["activity:read"]));
        expect(listed.tools).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: "add_success_log",
                inputSchema: expect.objectContaining({ required: ["activityLogId", "day"] }),
                annotations: expect.objectContaining({ readOnlyHint: false, destructiveHint: false, idempotentHint: true }),
            }),
        ]));
    });

    it("exposes activity log IDs through the month tool", async () => {
        const month = await toolResult(await request("tools/call", {
            name: "get_month_activity", arguments: { year: 2026, month: 2 },
        }, ["activity:read"]));
        expect(getMonthlyActivityLogsForUser).toHaveBeenCalledExactlyOnceWith(userId, 2026, 2);
        expect(month.structuredContent.activities).toEqual([
            expect.objectContaining({ activityLogId, label: "Reading" }),
        ]);
    });

    it.each([false, true])("passes the authenticated user and inputs to the function and returns its result (modern protocol: %s)", async modern => {
        const result = await addLog({ activityLogId, day: 28 }, modern);
        expect(addSuccessForUser).toHaveBeenCalledExactlyOnceWith(userId, { activityLogId, day: 28 });
        expect(result.isError).not.toBe(true);
        expect(result.structuredContent).toEqual(successLog);
        expect(result.content).toEqual([{ type: "text", text: JSON.stringify(successLog) }]);
        expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/calendar");
    });

    it.each([false, true])("challenges read-only tokens before calling the function (modern protocol: %s)", async modern => {
        const response = await request("tools/call", {
            name: "add_success_log", arguments: { activityLogId, day: 1 },
        }, ["activity:read"], modern);
        expect(response.status, await response.clone().text()).toBe(403);
        expect(response.headers.get("www-authenticate")).toContain('error="insufficient_scope"');
        expect(response.headers.get("www-authenticate")).toContain('scope="activity:read activity:write"');
        expect(response.headers.get("www-authenticate")).toContain("/.well-known/oauth-protected-resource/api/mcp");
        expect(addSuccessForUser).not.toHaveBeenCalled();
        expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("rejects malformed tool arguments before calling the function", async () => {
        const result = await addLog({ activityLogId, day: "1" });
        expect(result.isError).toBe(true);
        expect(addSuccessForUser).not.toHaveBeenCalled();
    });

    it("maps a function error to an MCP tool error", async () => {
        const failure = notFoundError("Activity log not found.");
        vi.mocked(addSuccessForUser).mockResolvedValue(failure);
        const result = await addLog({ activityLogId, day: 1 });
        expect(result).toMatchObject({
            isError: true,
            content: [{ type: "text", text: failure.error.message }],
        });
        expect(result.structuredContent).toBeUndefined();
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});
