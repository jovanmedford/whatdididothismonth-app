import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Activity, ActivityLog, ActivityTags, Category } from "@/generated/prisma/client";


const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // ── Users ──────────────────────────────────────────────────────────────
    const jovan = await prisma.user.upsert({
        where: { email: "jovan@wdidtm.com" },
        update: {},
        create: {
            email: "jovan@wdidtm.com",
            firstName: "Jovan",
            lastName: "Medford",
        },
    });

    const khadijah = await prisma.user.upsert({
        where: { email: "khadijah@wdidtm.com" },
        update: {},
        create: {
            email: "khadijah@wdidtm.com",
            firstName: "Khadijah",
            lastName: "Medford",
        },
    });

    const alex = await prisma.user.upsert({
        where: { email: "alex@wdidtm.com" },
        update: {},
        create: {
            email: "alex@wdidtm.com",
            firstName: "Alex",
            lastName: "Rivera",
        },
    });

    // ── Categories ─────────────────────────────────────────────────────────
    const jovanCategories = await Promise.all<Category>([
        prisma.category.upsert({
            where: { userId_label: { userId: jovan.id, label: "Health" } },
            update: {},
            create: { userId: jovan.id, label: "Health", color: "#4ade80", icon: "💪" },
        }),
        prisma.category.upsert({
            where: { userId_label: { userId: jovan.id, label: "Learning" } },
            update: {},
            create: { userId: jovan.id, label: "Learning", color: "#60a5fa", icon: "📚" },
        }),
        prisma.category.upsert({
            where: { userId_label: { userId: jovan.id, label: "Work" } },
            update: {},
            create: { userId: jovan.id, label: "Work", color: "#f59e0b", icon: "💼" },
        }),
    ]);

    const khadiahCategories = await Promise.all<Category>([
        prisma.category.upsert({
            where: { userId_label: { userId: khadijah.id, label: "Health" } },
            update: {},
            create: { userId: khadijah.id, label: "Health", color: "#f472b6", icon: "🧘" },
        }),
        prisma.category.upsert({
            where: { userId_label: { userId: khadijah.id, label: "Creative" } },
            update: {},
            create: { userId: khadijah.id, label: "Creative", color: "#a78bfa", icon: "🎨" },
        }),
    ]);

    const alexCategories = await Promise.all<Category>([
        prisma.category.upsert({
            where: { userId_label: { userId: alex.id, label: "Fitness" } },
            update: {},
            create: { userId: alex.id, label: "Fitness", color: "#fb923c", icon: "🏃" },
        }),
        prisma.category.upsert({
            where: { userId_label: { userId: alex.id, label: "Mindfulness" } },
            update: {},
            create: { userId: alex.id, label: "Mindfulness", color: "#34d399", icon: "🧠" },
        }),
    ]);

    // ── Activities ─────────────────────────────────────────────────────────
    const jovanActivities = await Promise.all<Activity>([
        prisma.activity.upsert({
            where: { userId_label: { userId: jovan.id, label: "Go to the gym" } },
            update: {},
            create: { userId: jovan.id, label: "Go to the gym" },
        }),
        prisma.activity.upsert({
            where: { userId_label: { userId: jovan.id, label: "Run 5k" } },
            update: {},
            create: { userId: jovan.id, label: "Run 5k" },
        }),
        prisma.activity.upsert({
            where: { userId_label: { userId: jovan.id, label: "Study algorithms" } },
            update: {},
            create: { userId: jovan.id, label: "Study algorithms" },
        }),
        prisma.activity.upsert({
            where: { userId_label: { userId: jovan.id, label: "Read engineering blogs" } },
            update: {},
            create: { userId: jovan.id, label: "Read engineering blogs" },
        }),
    ]);

    const khadiahActivities = await Promise.all<Activity>([
        prisma.activity.upsert({
            where: { userId_label: { userId: khadijah.id, label: "Morning yoga" } },
            update: {},
            create: { userId: khadijah.id, label: "Morning yoga" },
        }),
        prisma.activity.upsert({
            where: { userId_label: { userId: khadijah.id, label: "Journaling" } },
            update: {},
            create: { userId: khadijah.id, label: "Journaling" },
        }),
        prisma.activity.upsert({
            where: { userId_label: { userId: khadijah.id, label: "Sketch for 20 mins" } },
            update: {},
            create: { userId: khadijah.id, label: "Sketch for 20 mins" },
        }),
    ]);

    const alexActivities = await Promise.all<Activity>([
        prisma.activity.upsert({
            where: { userId_label: { userId: alex.id, label: "Evening run" } },
            update: {},
            create: { userId: alex.id, label: "Evening run" },
        }),
        prisma.activity.upsert({
            where: { userId_label: { userId: alex.id, label: "Meditate" } },
            update: {},
            create: { userId: alex.id, label: "Meditate" },
        }),
    ]);

    // ── ActivityTags ───────────────────────────────────────────────────────
    await Promise.all<ActivityTags>([
        // Jovan
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: jovanActivities[0].id, categoryId: jovanCategories[0].id } },
            update: {},
            create: { activityId: jovanActivities[0].id, categoryId: jovanCategories[0].id }, // gym -> Health
        }),
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: jovanActivities[1].id, categoryId: jovanCategories[0].id } },
            update: {},
            create: { activityId: jovanActivities[1].id, categoryId: jovanCategories[0].id }, // Run 5k -> Health
        }),
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: jovanActivities[2].id, categoryId: jovanCategories[1].id } },
            update: {},
            create: { activityId: jovanActivities[2].id, categoryId: jovanCategories[1].id }, // Study -> Learning
        }),
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: jovanActivities[2].id, categoryId: jovanCategories[2].id } },
            update: {},
            create: { activityId: jovanActivities[2].id, categoryId: jovanCategories[2].id }, // Study -> Work (multi-category)
        }),
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: jovanActivities[3].id, categoryId: jovanCategories[1].id } },
            update: {},
            create: { activityId: jovanActivities[3].id, categoryId: jovanCategories[1].id }, // Blogs -> Learning
        }),
        // Khadijah
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: khadiahActivities[0].id, categoryId: khadiahCategories[0].id } },
            update: {},
            create: { activityId: khadiahActivities[0].id, categoryId: khadiahCategories[0].id },
        }),
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: khadiahActivities[1].id, categoryId: khadiahCategories[1].id } },
            update: {},
            create: { activityId: khadiahActivities[1].id, categoryId: khadiahCategories[1].id },
        }),
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: khadiahActivities[2].id, categoryId: khadiahCategories[1].id } },
            update: {},
            create: { activityId: khadiahActivities[2].id, categoryId: khadiahCategories[1].id },
        }),
        // Alex
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: alexActivities[0].id, categoryId: alexCategories[0].id } },
            update: {},
            create: { activityId: alexActivities[0].id, categoryId: alexCategories[0].id },
        }),
        prisma.activityTags.upsert({
            where: { activityId_categoryId: { activityId: alexActivities[1].id, categoryId: alexCategories[1].id } },
            update: {},
            create: { activityId: alexActivities[1].id, categoryId: alexCategories[1].id },
        }),
    ]);

    // ── ActivityLogs (May 2026) ────────────────────────────────────────────
    const month = 5;
    const year = 2026;

    const jovanLogs = await Promise.all<ActivityLog>(
        jovanActivities.map((a) =>
            prisma.activityLog.upsert({
                where: { activityId_month_year: { activityId: a.id, month, year } },
                update: {},
                create: { activityId: a.id, month, year, target: 20 },
            })
        )
    );

    const khadiahLogs = await Promise.all<ActivityLog>(
        khadiahActivities.map((a) =>
            prisma.activityLog.upsert({
                where: { activityId_month_year: { activityId: a.id, month, year } },
                update: {},
                create: { activityId: a.id, month, year, target: 15 },
            })
        )
    );

    const alexLogs = await Promise.all<ActivityLog>(
        alexActivities.map((a) =>
            prisma.activityLog.upsert({
                where: { activityId_month_year: { activityId: a.id, month, year } },
                update: {},
                create: { activityId: a.id, month, year, target: 25 },
            })
        )
    );

    // ── SuccessLogs ────────────────────────────────────────────────────────
    // Helper to generate dates for specific days in May 2026
    const mayDate = (day: number) => new Date(2026, 4, day);

    // Jovan — gym and running on alternating days, studying more consistently
    const jovanSuccesses: { logIndex: number; days: number[] }[] = [
        { logIndex: 0, days: [1, 3, 5, 7, 9, 12, 14, 16, 19, 21, 23, 26, 28, 30] }, // gym
        { logIndex: 1, days: [2, 4, 8, 11, 15, 18, 22, 25, 29] },                    // run
        { logIndex: 2, days: [1, 2, 3, 4, 5, 8, 9, 10, 12, 14, 15, 16, 19, 20] },   // study
        { logIndex: 3, days: [1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30] },             // blogs
    ];

    for (const { logIndex, days } of jovanSuccesses) {
        for (const day of days) {
            await prisma.successLog.upsert({
                where: { activityLogId_date: { activityLogId: jovanLogs[logIndex].id, date: mayDate(day) } },
                update: {},
                create: { activityLogId: jovanLogs[logIndex].id, date: mayDate(day) },
            });
        }
    }

    // Khadijah — consistent yoga and journaling, less sketching
    const khadiahSuccesses: { logIndex: number; days: number[] }[] = [
        { logIndex: 0, days: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16, 18, 19, 20] }, // yoga
        { logIndex: 1, days: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23] },                // journaling
        { logIndex: 2, days: [4, 8, 14, 20, 26] },                                          // sketching
    ];

    for (const { logIndex, days } of khadiahSuccesses) {
        for (const day of days) {
            await prisma.successLog.upsert({
                where: { activityLogId_date: { activityLogId: khadiahLogs[logIndex].id, date: mayDate(day) } },
                update: {},
                create: { activityLogId: khadiahLogs[logIndex].id, date: mayDate(day) },
            });
        }
    }

    // Alex — solid running streak, steady meditation
    const alexSuccesses: { logIndex: number; days: number[] }[] = [
        { logIndex: 0, days: [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 21, 22] }, // run
        { logIndex: 1, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22] },            // meditate
    ];

    for (const { logIndex, days } of alexSuccesses) {
        for (const day of days) {
            await prisma.successLog.upsert({
                where: { activityLogId_date: { activityLogId: alexLogs[logIndex].id, date: mayDate(day) } },
                update: {},
                create: { activityLogId: alexLogs[logIndex].id, date: mayDate(day) },
            });
        }
    }

    console.log("✅ Seed complete");
    console.log(`   Users: Jovan, Khadijah, Alex`);
    console.log(`   Activities: ${jovanActivities.length + khadiahActivities.length + alexActivities.length}`);
    console.log(`   ActivityLogs: ${jovanLogs.length + khadiahLogs.length + alexLogs.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });