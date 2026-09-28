import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { addSuccess } from "./success";
import type { UserDto } from "./dtos";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let user: UserDto;
let otherUser: UserDto;
let activityLogId: string;
let leapYearLogId: string;
let otherActivityLogId: string;

beforeAll(async () => {
    user = await prisma.user.create({
        data: { name: "Success test user", email: `success-${randomUUID()}@example.test` },
    });
    otherUser = await prisma.user.create({
        data: { name: "Other Success test user", email: `success-other-${randomUUID()}@example.test` },
    });
    const activity = await prisma.activity.create({
        data: {
            userId: user.id,
            label: "Reading",
            activityLogs: {
                create: [
                    { year: 2026, month: 2, target: 10 },
                    { year: 2024, month: 2, target: 10 },
                ],
            },
        },
        include: { activityLogs: true },
    });
    activityLogId = activity.activityLogs.find(log => log.year === 2026)!.id;
    leapYearLogId = activity.activityLogs.find(log => log.year === 2024)!.id;
    const otherActivity = await prisma.activity.create({
        data: {
            userId: otherUser.id,
            label: "Private activity",
            activityLogs: { create: { year: 2026, month: 2, target: 5 } },
        },
        include: { activityLogs: true },
    });
    otherActivityLogId = otherActivity.activityLogs[0].id;
});

beforeEach(async () => {
    vi.clearAllMocks();
    await prisma.successLog.deleteMany({
        where: { activityLogId: { in: [activityLogId, leapYearLogId, otherActivityLogId] } },
    });
});

afterAll(async () => {
    await prisma.user.deleteMany({
        where: { id: { in: [user?.id, otherUser?.id].filter((id): id is string => Boolean(id)) } },
    });
});

function addLog(day: number, logId = activityLogId) {
    return addSuccess({ day, activityLogId: logId, sessionAuth: async () => user });
}

describe("addSuccess", () => {
    it("saves a completion and returns the existing log when repeated", async () => {
        const first = await addLog(28);
        const repeated = await addLog(28);
        expect(first).toEqual({ ok: true, data: { id: expect.any(String), activityLogId, day: 28 } });
        expect(repeated).toEqual(first);
        expect(await prisma.successLog.count({ where: { activityLogId, day: 28 } })).toBe(1);
        expect(revalidatePath).toHaveBeenCalledWith("/calendar");
    });

    it("requires a signed-in user", async () => {
        expect(await addSuccess({ activityLogId, day: 1, sessionAuth: async () => null })).toMatchObject({
            ok: false, error: { code: "UNAUTHORIZED" },
        });
        expect(await prisma.successLog.count({ where: { activityLogId } })).toBe(0);
        expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("rejects another user's log without revealing whether it exists", async () => {
        for (const id of [otherActivityLogId, randomUUID()]) {
            expect(await addLog(1, id)).toMatchObject({
                ok: false, error: { code: "NOT_FOUND", message: "Activity log not found." },
            });
        }
        expect(await prisma.successLog.count({ where: { activityLogId: otherActivityLogId } })).toBe(0);
        expect(revalidatePath).not.toHaveBeenCalled();
    });

    it.each([0, 32, 1.5, NaN])("rejects invalid day %s", async day => {
        expect(await addLog(day)).toMatchObject({ ok: false, error: { code: "BAD_REQUEST" } });
        expect(await prisma.successLog.count({ where: { activityLogId } })).toBe(0);
        expect(revalidatePath).not.toHaveBeenCalled();
    });

    it.each(["", "  "])("rejects empty activity ID %j", async id => {
        expect(await addLog(1, id)).toMatchObject({ ok: false, error: { code: "BAD_REQUEST" } });
        expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("validates days against the log's month, including leap years", async () => {
        for (const day of [29, 30, 31]) {
            expect(await addLog(day)).toMatchObject({
                ok: false, error: { code: "BAD_REQUEST", message: "Invalid day for this activity log's month." },
            });
        }
        expect(await addLog(29, leapYearLogId)).toMatchObject({
            ok: true, data: { activityLogId: leapYearLogId, day: 29 },
        });
        expect(await prisma.successLog.count({ where: { activityLogId } })).toBe(0);
        expect(revalidatePath).toHaveBeenCalledOnce();
    });
});
