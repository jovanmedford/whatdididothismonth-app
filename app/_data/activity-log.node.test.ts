import { beforeAll, describe, it, expect, beforeEach, afterAll, vi, Mock } from "vitest"
import { createActivityLogById, CreateActivityLogByIdInput, createActivityLogByLabel, CreateActivityLogByLabelInput, deleteActivityLogs, DeleteActivityLogsInput, editActivityLog, EditActivityLogInput } from "./activity-log"
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


// ---------------------------------------------------------------------------
// NOTE ON FILE STRUCTURE
//
// This block assumes shared lifecycle hooks live at FILE scope, not inside the
// "Create Activity Log" describe. Lift these three out of that describe so both
// suites share one cleanup path (and only ONE $disconnect runs, after both):
//
//   beforeAll  -> upsert testUser + otherUser, build getMockUser
//   beforeEach -> TRUNCATE activity_logs, activities RESTART IDENTITY CASCADE
//   afterAll   -> TRUNCATE users + logs + activities; prisma.$disconnect()
//
// If you instead keep hooks per-describe, the Edit block needs its OWN
// beforeEach truncate (shown below) or its tests will leak into each other.
// Pick one; don't run both a file-scope and a describe-scope truncate.
// ---------------------------------------------------------------------------

describe("Edit Activity Log", () => {
    let user: UserDto;
    let otherUser: UserDto;
    let getMockUser: () => Promise<UserDto>;
    let revalidatePaths: Mock<() => void>;
    let testEditActivityLog: (input: EditActivityLogInput) => Promise<Result<ActivityLogDto>>;

    beforeAll(async () => {
        user = await prisma.user.upsert({
            where: { email: testUserInput.email },
            create: testUserInput,
            update: {},
        });
        otherUser = await prisma.user.upsert({
            where: { email: otherUserInput.email },
            create: otherUserInput,
            update: {},
        });
        getMockUser = async () => user;
    });

    // If hooks are NOT hoisted to file scope, this keeps Edit tests isolated.
    beforeEach(async () => {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "activity_logs", "activities" RESTART IDENTITY CASCADE`
        );
        // Spy seam: capture revalidate calls per-test so we can assert on/off.
        revalidatePaths = vi.fn(() => { });
        testEditActivityLog = async (input: EditActivityLogInput) =>
            editActivityLog({
                ...input,
                sessionAuth: getMockUser,
                revalidateFn: revalidatePaths,
            });
    });

    afterAll(async () => {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "users", "activity_logs", "activities" RESTART IDENTITY CASCADE`
        );
        await prisma.$disconnect();
    });

    // -- seed helper: one activity + one log, owned by `owner` (defaults to test user)
    const seedActivityWithLog = async (
        opts: {
            label: string;
            target?: number;
            month?: number;
            year?: number;
            owner?: UserDto;
        }
    ) => {
        const activity = await prisma.activity.create({
            data: { userId: (opts.owner ?? user).id, label: opts.label },
        });
        const log = await prisma.activityLog.create({
            data: {
                activityId: activity.id,
                target: opts.target ?? 10,
                month: opts.month ?? 5,
                year: opts.year ?? 2026,
            },
        });
        return { activity, log };
    };

    it("changes label and target", async () => {
        const { activity, log } = await seedActivityWithLog({
            label: "Driving lesson",
            target: 10,
        });

        const result = await testEditActivityLog({
            activityLogId: log.id,
            label: "Driving Practice",
            target: 20,
        });

        expect(result.ok).toBe(true);
        if (!result.ok) throw new Error(result.error.message);

        const renamed = await prisma.activity.findUnique({ where: { id: activity.id } });
        expect(renamed!.label).toBe("Driving Practice");

        const persistedLog = await prisma.activityLog.findUnique({ where: { id: log.id } });
        expect(persistedLog!.target).toBe(20);

        // Revalidation
        expect(revalidatePaths).toHaveBeenCalled();
        expect(revalidatePaths).toHaveBeenCalledWith("/calendar");
    });

    it("writes the target even when the label is unchanged (rename-first must not eat this)", async () => {
        // The trap in rename-first-and-bail: editing to the SAME label must not
        // be treated as a self-collision that bails before the target write.
        const { log } = await seedActivityWithLog({ label: "Gym", target: 10 });

        const result = await testEditActivityLog({
            activityLogId: log.id,
            label: "Gym",
            target: 20,
        });

        expect(result.ok).toBe(true);
        if (!result.ok) throw new Error(result.error.message);

        const l = await prisma.activityLog.findUnique({ where: { id: log.id } });
        expect(l!.target).toBe(20);
    });

    it("returns conflict on rename-into-collision and bails before the target write", async () => {
        // user owns "Running" and "Jogging"; rename Jogging -> running (collides).
        await seedActivityWithLog({ label: "Running", month: 5, year: 2026 });
        const { log: joggingLog } = await seedActivityWithLog({
            label: "Jogging", target: 10, month: 6, year: 2026,
        });

        const result = await testEditActivityLog({
            activityLogId: joggingLog.id,
            label: "running",   // normalizes to collide with "Running"
            target: 25,         // different from stored 10
        });

        expect(result.ok).toBe(false);
        if (result.ok) throw new Error("Expected conflict");
        expect(result.error.code).toBe("CONFLICT");

        // PROOF the bail worked: the target write never landed.
        const persisted = await prisma.activityLog.findUnique({ where: { id: joggingLog.id } });
        expect(persisted!.target).toBe(10);

        // Neither side mutated; no new activity rows.
        const activities = await prisma.activity.findMany({ where: { userId: user.id } });
        expect(activities).toHaveLength(2);
        expect(activities.map((a) => a.label).sort()).toEqual(["Jogging", "Running"]);

        // The conflict payload should carry enough to render a flat-model message
        // ("You already have an activity called Running"), not a bare code.
        // expect(result.error.message).toContain("Running");
        expect(revalidatePaths).toHaveBeenCalledTimes(0);
    });

    it("validates BEFORE attempting the rename (bad target + collision -> BAD_REQUEST)", async () => {
        // Validation must short-circuit before any DB write, so a request that is
        // BOTH invalid and colliding returns BAD_REQUEST, not CONFLICT.
        await seedActivityWithLog({ label: "Running", month: 5, year: 2026 });
        const { log: joggingLog } = await seedActivityWithLog({
            label: "Jogging", target: 10, month: 6, year: 2026,
        });

        const result = await testEditActivityLog({
            activityLogId: joggingLog.id,
            label: "running",  // would collide...
            target: -1,        // ...but this is invalid and should win
        });

        expect(result.ok).toBe(false);
        if (result.ok) throw new Error("Expected error");
        expect(result.error.code).toBe("BAD_REQUEST");

        // No write of any kind.
        const persisted = await prisma.activityLog.findUnique({ where: { id: joggingLog.id } });
        expect(persisted!.target).toBe(10);
        const running = await prisma.activity.findFirst({ where: { userId: user.id, label: "Jogging" } });
        expect(running).toBeTruthy(); // still named Jogging
        expect(revalidatePaths).toHaveBeenCalledTimes(0);
    });

    it("returns not found for a nonexistent log and creates nothing", async () => {
        const result = await testEditActivityLog({
            activityLogId: "nonexistent-id-12345",
            label: "Whatever",
            target: 10,
        });

        expect(result.ok).toBe(false);
        if (result.ok) throw new Error("Expected error");
        expect(result.error.code).toBe("NOT_FOUND");

        expect(await prisma.activity.count()).toBe(0);
        expect(await prisma.activityLog.count()).toBe(0);
        expect(revalidatePaths).toHaveBeenCalledTimes(0);
    });

    it("returns not found for a log owned by another user and mutates nothing", async () => {
        const { activity, log } = await seedActivityWithLog({
            label: "Their Activity",
            target: 10,
            owner: otherUser,
        });

        const result = await testEditActivityLog({
            activityLogId: log.id,
            label: "Hijacked",
            target: 99,
        });

        expect(result.ok).toBe(false);
        if (result.ok) throw new Error("Expected error");
        expect(result.error.code).toBe("NOT_FOUND");

        // Foreign data untouched.
        const a = await prisma.activity.findUnique({ where: { id: activity.id } });
        expect(a!.label).toBe("Their Activity");
        const l = await prisma.activityLog.findUnique({ where: { id: log.id } });
        expect(l!.target).toBe(10);
        expect(revalidatePaths).toHaveBeenCalledTimes(0);
    });
});

describe("Delete Activity Logs", () => {
    let user: UserDto
    let otherUser: UserDto
    let getMockUser: () => Promise<UserDto>
    let revalidateSpy: Mock<() => void>;
    let testDeleteActivityLogs: (input: DeleteActivityLogsInput) => Promise<Result<{ count: number }>>

    beforeAll(async () => {
        user = await prisma.user.upsert({
            where: { email: testUserInput.email },
            create: testUserInput,
            update: {},
        })
        otherUser = await prisma.user.upsert({
            where: { email: otherUserInput.email },
            create: otherUserInput,
            update: {},
        })
        getMockUser = async () => user
    })

    beforeEach(async () => {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "activity_logs", "activities" RESTART IDENTITY CASCADE`
        )
        revalidateSpy = vi.fn()
        testDeleteActivityLogs = async (input: DeleteActivityLogsInput) =>
            deleteActivityLogs({ ...input, sessionAuth: getMockUser, revalidateFn: revalidateSpy })
    })

    // one activity + one log; owner defaults to the test user
    const seedActivityWithLog = async (opts: {
        label: string
        target?: number
        month?: number
        year?: number
        owner?: UserDto
    }) => {
        const activity = await prisma.activity.create({
            data: { userId: (opts.owner ?? user).id, label: opts.label },
        })
        const log = await prisma.activityLog.create({
            data: {
                activityId: activity.id,
                target: opts.target ?? 10,
                month: opts.month ?? 5,
                year: opts.year ?? 2026,
            },
        })
        return { activity, log }
    }

    // -- HAPPY PATH ----------------------------------------------------------

    it("deletes a single log and leaves its activity standing (decision A)", async () => {
        const { activity, log } = await seedActivityWithLog({ label: "Gym" })

        const result = await testDeleteActivityLogs({ activityLogIds: [log.id] })

        expect(result.ok).toBe(true)
        if (!result.ok) throw new Error(result.error.message)
        expect(result.data.count).toBe(1)

        // log gone, read back from the DB
        const remaining = await prisma.activityLog.findUnique({ where: { id: log.id } })
        expect(remaining).toBeNull()

        // activity row survives even with zero logs
        const stillThere = await prisma.activity.findUnique({ where: { id: activity.id } })
        expect(stillThere).toMatchObject(activity)
    })

    it("deletes multiple logs in one call with a matching count", async () => {
        const a = await seedActivityWithLog({ label: "Gym", month: 5 })
        const b = await seedActivityWithLog({ label: "Reading", month: 5 })
        const c = await seedActivityWithLog({ label: "Piano", month: 5 })

        const result = await testDeleteActivityLogs({
            activityLogIds: [a.log.id, b.log.id, c.log.id],
        })

        expect(result.ok).toBe(true)
        if (!result.ok) throw new Error(result.error.message)
        expect(result.data.count).toBe(3)

        const logCount = await prisma.activityLog.count()
        expect(logCount).toBe(0)

        const logs = await prisma.activityLog.findMany({ where: { id: { in: [a.log.id, b.log.id, c.log.id] } } })
        expect(logs).toHaveLength(0)
    })

    it("deletes some of an activity's logs and leaves the rest (decision A)", async () => {
        // one activity, two months; delete May, keep January
        const activity = await prisma.activity.create({
            data: { userId: user.id, label: "Gym" },
        })
        const may = await prisma.activityLog.create({
            data: { activityId: activity.id, target: 10, month: 5, year: 2026 },
        })
        const jan = await prisma.activityLog.create({
            data: { activityId: activity.id, target: 12, month: 1, year: 2026 },
        })

        const result = await testDeleteActivityLogs({ activityLogIds: [may.id] })

        expect(result.ok).toBe(true)
        if (!result.ok) throw new Error(result.error.message)
        expect(result.data.count).toBe(1)

        // May gone, January untouched
        expect(await prisma.activityLog.findUnique({ where: { id: may.id } })).toBeNull()
        const survivor = await prisma.activityLog.findUnique({ where: { id: jan.id } })
        expect(survivor).toMatchObject(jan)
    })

    it("revalidates exactly once on a real deletion", async () => {
        const { log } = await seedActivityWithLog({ label: "Gym" })

        await testDeleteActivityLogs({ activityLogIds: [log.id] })

        expect(revalidateSpy).toHaveBeenCalledTimes(1)
        expect(revalidateSpy).toHaveBeenCalledWith("/calendar")
    })

    // -- LIST EDGE CASES -----------------------------------------------------

    it("treats an empty list as a benign no-op (count 0, no revalidate)", async () => {
        const { log } = await seedActivityWithLog({ label: "Gym" })

        const result = await testDeleteActivityLogs({ activityLogIds: [] })

        expect(result.ok).toBe(true)
        if (!result.ok) throw new Error(result.error.message)
        expect(result.data.count).toBe(0)

        // nothing deleted, no revalidation
        expect(await prisma.activityLog.findUnique({ where: { id: log.id } })).toBeTruthy()
        expect(revalidateSpy).toHaveBeenCalledTimes(0)
    })

    it("deletes a duplicated id only once", async () => {
        const { log } = await seedActivityWithLog({ label: "Gym" })

        const result = await testDeleteActivityLogs({ activityLogIds: [log.id, log.id] })

        expect(result.ok).toBe(true)
        if (!result.ok) throw new Error(result.error.message)
        expect(result.data.count).toBe(1)
        expect(await prisma.activityLog.findUnique({ where: { id: log.id } })).toBeNull()
    })

    it("ignores nonexistent ids and deletes the valid ones (lenient)", async () => {
        const { log } = await seedActivityWithLog({ label: "Gym" })

        const result = await testDeleteActivityLogs({
            activityLogIds: [log.id, "nonexistent-id-12345"],
        })

        expect(result.ok).toBe(true)
        if (!result.ok) throw new Error(result.error.message)
        expect(result.data.count).toBe(1)
        expect(await prisma.activityLog.findUnique({ where: { id: log.id } })).toBeNull()
    })

    it("deletes only the caller's logs when foreign ids are mixed in (SECURITY)", async () => {
        const mine = await seedActivityWithLog({ label: "Gym" })
        const theirs = await seedActivityWithLog({ label: "Their Gym", owner: otherUser })

        const result = await testDeleteActivityLogs({
            activityLogIds: [mine.log.id, theirs.log.id],
        })

        expect(result.ok).toBe(true)
        if (!result.ok) throw new Error(result.error.message)
        // count reflects ONLY the caller's deletion
        expect(result.data.count).toBe(1)

        // mine gone, theirs survives untouched
        expect(await prisma.activityLog.findUnique({ where: { id: mine.log.id } })).toBeNull()
        expect(await prisma.activityLog.findUnique({ where: { id: theirs.log.id } })).toMatchObject(theirs.log)

        // a real deletion happened, so revalidate fires
        expect(revalidateSpy).toHaveBeenCalledTimes(1)
    })
})