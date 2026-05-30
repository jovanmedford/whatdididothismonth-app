import { beforeAll, describe, it, expect, beforeEach, afterAll } from "vitest"
import { createActivityLogById, CreateActivityLogByIdInput, createActivityLogByLabel, CreateActivityLogByLabelInput } from "./activity-log"
import { ActivityLogDto, UserDto } from "./dtos"
import { Result } from "@/lib/error";
import { prisma } from "@/lib/db";
import { UserInput } from "@/lib/types";
import { LOG_ALREADY_EXISTS_MESSAGE } from "@/lib/messages";
import { MAX_ACTIVITY_LABEL_LENGTH } from "@/lib/constants";



const testUserInput: UserInput = {
    name: "Test User",
    email: "test@wdidtm.com"
}

const otherUserInput: UserInput = {
    name: "Other User",
    email: "other@wdidtm.com"
}

describe("Create Activity Log", () => {
    let testCreateActivityLogByLabel: (input: CreateActivityLogByLabelInput) => Promise<Result<ActivityLogDto>>;
    let testCreateActivityLogById: (input: CreateActivityLogByIdInput) => Promise<Result<ActivityLogDto>>;
    let getMockUser: () => Promise<UserDto>;
    let user: UserDto;
    let otherUser: UserDto;

    beforeAll(async () => {
        user = await prisma.user.upsert({
            where: { email: testUserInput.email },
            create: testUserInput,
            update: {}
        })

        otherUser = await prisma.user.upsert({
            where: { email: otherUserInput.email },
            create: otherUserInput,
            update: {}
        })


        getMockUser = async () => user



        testCreateActivityLogByLabel = async (input: CreateActivityLogByLabelInput) => createActivityLogByLabel({ ...input, sessionAuth: getMockUser, revalidateFn: (path: string) => { } })
        testCreateActivityLogById = async (input: CreateActivityLogByIdInput) => createActivityLogById({ ...input, sessionAuth: getMockUser, revalidateFn: (path: string) => { } })
    })

    beforeEach(async () => {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "activity_logs", "activities" RESTART IDENTITY CASCADE`
        )
    })

    afterAll(async () => {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "users", "activity_logs", "activities" RESTART IDENTITY CASCADE`
        )
        await prisma.$disconnect()
    })

    describe("By Label", () => {
        it("creates activity + log", async () => {
            const result = await testCreateActivityLogByLabel({ label: "Test Activity", month: 1, year: 2024, target: 10 })

            if (!result.ok) {
                throw new Error(result.error.message)
            }

            // Verify the db has the new activity log
            const found = await prisma.activityLog.findFirst({
                where: {
                    id: result.data.id,
                }
            })

            if (!found) {
                throw new Error("Activity log not found in database")
            }

            expect(found.activityId).toBeTruthy()
            expect(found.month).toBe(1)
            expect(found.year).toBe(2024)
            expect(found.target).toBe(10)
        })

        it("creates log with existing activity", async () => {
            // Arrange: activity already exists under Jovan
            await prisma.activity.create({
                data: { userId: user.id, label: "Skate boarding" },
            });

            // Act: call byLabel with a different-casing version of the same name
            const result = await testCreateActivityLogByLabel({
                label: "skate  boarding",
                month: 5,
                year: 2026,
                target: 20,
            });

            // Assert: the result succeeded
            expect(result.ok).toBe(true);

            // Assert: still only ONE activity (the existing one was reused, not duplicated)
            const activities = await prisma.activity.findMany({ where: { userId: user.id } });
            expect(activities).toHaveLength(1);
            expect(activities[0].label).toBe("Skate boarding");  // original casing preserved

            // Assert: a log was created on the existing activity
            const logs = await prisma.activityLog.findMany();
            expect(logs).toHaveLength(1);
            expect(logs[0].activityId).toBe(activities[0].id);
        });

        it("returns error if log already exists for that month/year/label", async () => {
            // Arrange: create an activity and an existing log for May 2026
            const activity = await prisma.activity.create({
                data: { userId: user.id, label: "Skateboarding" },
            });
            await prisma.activityLog.create({
                data: { activityId: activity.id, month: 5, year: 2026, target: 20 },
            });

            // Act: try to create another log for the same activity/month/year via byLabel
            const result = await testCreateActivityLogByLabel({
                label: "Skateboarding",
                month: 5,
                year: 2026,
                target: 25,
            });

            // Assert: returns an error result, not a success
            expect(result.ok).toBe(false);

            if (result.ok) { throw new Error("Expected an error result, but got success") }

            expect(result.error.status).toBe(409);
            expect(result.error.message).toMatch(LOG_ALREADY_EXISTS_MESSAGE);


            // Assert: still only one log (no partial state)
            const logs = await prisma.activityLog.findMany();
            expect(logs).toHaveLength(1);
        });

        describe("input validation", () => {
            const validInput = {
                label: "Valid Activity",
                month: 5,
                year: 2026,
                target: 10,
            };

            it.each([
                ["empty label", { label: "" }],
                ["whitespace-only label", { label: "   " }],
                ["label too long", { label: "x".repeat(MAX_ACTIVITY_LABEL_LENGTH + 1) }],
            ])("rejects %s", async (_, override) => {
                const result = await testCreateActivityLogByLabel({ ...validInput, ...override });
                expect(result.ok).toBe(false);
                if (result.ok) throw new Error("Expected error");
                expect(result.error.code).toBe("BAD_REQUEST");
            });

            it.each([
                ["month 0", { month: 0 }],
                ["month 13", { month: 13 }],
                ["negative month", { month: -1 }],
            ])("rejects %s", async (_, override) => {
                const result = await testCreateActivityLogByLabel({ ...validInput, ...override });
                expect(result.ok).toBe(false);
                if (result.ok) throw new Error("Expected error");
                expect(result.error.code).toBe("BAD_REQUEST");
            });

            it.each([
                ["target 0", { target: 0 }],
                ["negative target", { target: -5 }],
            ])("rejects %s", async (_, override) => {
                const result = await testCreateActivityLogByLabel({ ...validInput, ...override });
                expect(result.ok).toBe(false);
                if (result.ok) throw new Error("Expected error");
                expect(result.error.code).toBe("BAD_REQUEST");
            });
        });
    })

    describe("By Id", () => {
        // setup analogous to byLabel — user, helper, beforeEach truncate

        it("creates a log on an existing activity", async () => {
            const activity = await prisma.activity.create({
                data: { userId: user.id, label: "My Activity" },
            });

            const result = await testCreateActivityLogById({
                activityId: activity.id,
                month: 5, year: 2026, target: 15,
            });

            expect(result.ok).toBe(true);
            if (!result.ok) throw new Error(result.error.message);

            expect(result.data.activityLabel).toBe("My Activity");
            expect(result.data.month).toBe(5);
            expect(result.data.year).toBe(2026);
            expect(result.data.target).toBe(15);

            // Verify it persisted
            const log = await prisma.activityLog.findUnique({ where: { id: result.data.id } });
            expect(log).toBeTruthy();
            expect(log!.activityId).toBe(activity.id);

            // Verify no new activity was created — byId should NEVER create activities
            const activityCount = await prisma.activity.count();
            expect(activityCount).toBe(1);
        });

        it("returns not found if activity does not exist", async () => {
            const result = await testCreateActivityLogById({
                activityId: "nonexistent-id-12345",
                month: 5, year: 2026, target: 10,
            });

            expect(result.ok).toBe(false);
            if (result.ok) throw new Error("Expected error");
            expect(result.error.code).toBe("NOT_FOUND");

            const logs = await prisma.activityLog.findMany();
            expect(logs).toHaveLength(0);
        });

        it("returns not found if activity belongs to another user", async () => {
            const otherUsersActivity = await prisma.activity.create({
                data: { userId: otherUser.id, label: "Their Activity" },
            });

            const result = await testCreateActivityLogById({
                activityId: otherUsersActivity.id,
                month: 5, year: 2026, target: 10,
            });

            expect(result.ok).toBe(false);
            if (result.ok) throw new Error("Expected error");
            expect(result.error.code).toBe("NOT_FOUND");

            // Critical: no log was created on the other user's activity
            const logs = await prisma.activityLog.findMany();
            expect(logs).toHaveLength(0);
        });

        it("returns conflict if log already exists for that month/year", async () => {
            const activity = await prisma.activity.create({
                data: { userId: user.id, label: "My Activity" },
            });
            await prisma.activityLog.create({
                data: { activityId: activity.id, month: 5, year: 2026, target: 10 },
            });

            const result = await testCreateActivityLogById({
                activityId: activity.id,
                month: 5, year: 2026, target: 20,
            });

            expect(result.ok).toBe(false);
            if (result.ok) throw new Error("Expected error");
            expect(result.error.code).toBe("CONFLICT");

            const logs = await prisma.activityLog.findMany();
            expect(logs).toHaveLength(1);
        });
    })
})


