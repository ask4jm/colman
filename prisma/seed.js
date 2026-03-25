const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient, DueStatus, BillingFrequency, SubmissionCycle, UserRole } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const station = await prisma.station.upsert({
    where: { code: "THB-MAIN" },
    update: {
      name: "Thoubal Main Station",
      address: "Thoubal Bazar Road, Thoubal",
    },
    create: {
      code: "THB-MAIN",
      name: "Thoubal Main Station",
      address: "Thoubal Bazar Road, Thoubal",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { userId: "ADMIN1" },
    update: {
      passwordHash: "ADMIN123",
      role: UserRole.ADMIN,
    },
    create: {
      userId: "ADMIN1",
      passwordHash: "ADMIN123",
      role: UserRole.ADMIN,
    },
  });

  const collectorUser = await prisma.user.upsert({
    where: { userId: "COLL17" },
    update: {
      passwordHash: "COLL123",
      role: UserRole.COLLECTOR,
    },
    create: {
      userId: "COLL17",
      passwordHash: "COLL123",
      role: UserRole.COLLECTOR,
    },
  });

  const subscriberUser = await prisma.user.upsert({
    where: { userId: "SUB001" },
    update: {
      passwordHash: "PASS123",
      role: UserRole.SUBSCRIBER,
    },
    create: {
      userId: "SUB001",
      passwordHash: "PASS123",
      role: UserRole.SUBSCRIBER,
    },
  });

  const collector = await prisma.collector.upsert({
    where: { code: "COLL17" },
    update: {
      name: "Biren Singh",
      phone: "7005011122",
      settlementCycle: SubmissionCycle.DAILY,
      stationId: station.id,
      userId: collectorUser.id,
    },
    create: {
      code: "COLL17",
      name: "Biren Singh",
      phone: "7005011122",
      settlementCycle: SubmissionCycle.DAILY,
      stationId: station.id,
      userId: collectorUser.id,
    },
  });

  const services = await Promise.all([
    prisma.service.upsert({
      where: { code: "WATER" },
      update: { name: "Water Supply", amount: 90, frequency: BillingFrequency.MONTHLY },
      create: { code: "WATER", name: "Water Supply", amount: 90, frequency: BillingFrequency.MONTHLY },
    }),
    prisma.service.upsert({
      where: { code: "WASTE" },
      update: { name: "Waste Collection", amount: 60, frequency: BillingFrequency.MONTHLY },
      create: { code: "WASTE", name: "Waste Collection", amount: 60, frequency: BillingFrequency.MONTHLY },
    }),
    prisma.service.upsert({
      where: { code: "LIGHT" },
      update: { name: "Street Light", amount: 75, frequency: BillingFrequency.MONTHLY },
      create: { code: "LIGHT", name: "Street Light", amount: 75, frequency: BillingFrequency.MONTHLY },
    }),
  ]);

  const waterService = services.find((service) => service.code === "WATER");
  const wasteService = services.find((service) => service.code === "WASTE");
  const lightService = services.find((service) => service.code === "LIGHT");

  const villagers = await Promise.all([
    prisma.villager.upsert({
      where: { code: "SUB001" },
      update: {
        name: "Ramesh Kumar",
        phone: "9876543210",
        ward: "Ward 1",
        stationId: station.id,
        collectorId: collector.id,
        userId: subscriberUser.id,
      },
      create: {
        code: "SUB001",
        name: "Ramesh Kumar",
        phone: "9876543210",
        ward: "Ward 1",
        stationId: station.id,
        collectorId: collector.id,
        userId: subscriberUser.id,
      },
    }),
    prisma.villager.upsert({
      where: { code: "SUB014" },
      update: {
        name: "Anita Devi",
        phone: "9362014782",
        ward: "Ward 2",
        stationId: station.id,
        collectorId: collector.id,
      },
      create: {
        code: "SUB014",
        name: "Anita Devi",
        phone: "9362014782",
        ward: "Ward 2",
        stationId: station.id,
        collectorId: collector.id,
      },
    }),
    prisma.villager.upsert({
      where: { code: "SUB024" },
      update: {
        name: "Mohan Singh",
        phone: "8794412568",
        ward: "Ward 3",
        stationId: station.id,
        collectorId: collector.id,
      },
      create: {
        code: "SUB024",
        name: "Mohan Singh",
        phone: "8794412568",
        ward: "Ward 3",
        stationId: station.id,
        collectorId: collector.id,
      },
    }),
  ]);

  const [ramesh, anita, mohan] = villagers;

  const subscriptions = await Promise.all([
    prisma.serviceSubscription.upsert({
      where: { villagerId_serviceId: { villagerId: ramesh.id, serviceId: waterService.id } },
      update: { active: true, endedAt: null },
      create: { villagerId: ramesh.id, serviceId: waterService.id, active: true },
    }),
    prisma.serviceSubscription.upsert({
      where: { villagerId_serviceId: { villagerId: ramesh.id, serviceId: wasteService.id } },
      update: { active: true, endedAt: null },
      create: { villagerId: ramesh.id, serviceId: wasteService.id, active: true },
    }),
    prisma.serviceSubscription.upsert({
      where: { villagerId_serviceId: { villagerId: anita.id, serviceId: lightService.id } },
      update: { active: true, endedAt: null },
      create: { villagerId: anita.id, serviceId: lightService.id, active: true },
    }),
    prisma.serviceSubscription.upsert({
      where: { villagerId_serviceId: { villagerId: mohan.id, serviceId: wasteService.id } },
      update: { active: true, endedAt: null },
      create: { villagerId: mohan.id, serviceId: wasteService.id, active: true },
    }),
  ]);

  const waterSubscription = subscriptions[0];
  const wasteSubscription = subscriptions[1];
  const lightSubscription = subscriptions[2];
  const mohanWasteSubscription = subscriptions[3];

  const submission = await prisma.submission.upsert({
    where: { referenceNumber: "SUBM-2026-001" },
    update: {
      cycle: SubmissionCycle.DAILY,
      amount: 150,
      collectionCount: 2,
      stationId: station.id,
      collectorId: collector.id,
      receivedBy: adminUser.userId,
      notes: "Morning station handover",
    },
    create: {
      referenceNumber: "SUBM-2026-001",
      cycle: SubmissionCycle.DAILY,
      amount: 150,
      collectionCount: 2,
      stationId: station.id,
      collectorId: collector.id,
      receivedBy: adminUser.userId,
      notes: "Morning station handover",
    },
  });

  await prisma.collection.upsert({
    where: { receiptNumber: "RCPT-1001" },
    update: {
      amount: 90,
      billingPeriod: "Mar 2026",
      status: DueStatus.SUBMITTED,
      collectedAt: new Date("2026-03-24T10:00:00.000Z"),
      submittedAt: new Date("2026-03-24T16:30:00.000Z"),
      notes: "Water supply collected from home visit",
      villagerId: ramesh.id,
      collectorId: collector.id,
      serviceId: waterService.id,
      subscriptionId: waterSubscription.id,
      submissionId: submission.id,
    },
    create: {
      receiptNumber: "RCPT-1001",
      amount: 90,
      billingPeriod: "Mar 2026",
      status: DueStatus.SUBMITTED,
      collectedAt: new Date("2026-03-24T10:00:00.000Z"),
      submittedAt: new Date("2026-03-24T16:30:00.000Z"),
      notes: "Water supply collected from home visit",
      villagerId: ramesh.id,
      collectorId: collector.id,
      serviceId: waterService.id,
      subscriptionId: waterSubscription.id,
      submissionId: submission.id,
    },
  });

  await prisma.collection.upsert({
    where: { receiptNumber: "RCPT-1002" },
    update: {
      amount: 60,
      billingPeriod: "Mar 2026",
      status: DueStatus.SUBMITTED,
      collectedAt: new Date("2026-03-24T11:10:00.000Z"),
      submittedAt: new Date("2026-03-24T16:30:00.000Z"),
      notes: "Waste collection settled during route",
      villagerId: ramesh.id,
      collectorId: collector.id,
      serviceId: wasteService.id,
      subscriptionId: wasteSubscription.id,
      submissionId: submission.id,
    },
    create: {
      receiptNumber: "RCPT-1002",
      amount: 60,
      billingPeriod: "Mar 2026",
      status: DueStatus.SUBMITTED,
      collectedAt: new Date("2026-03-24T11:10:00.000Z"),
      submittedAt: new Date("2026-03-24T16:30:00.000Z"),
      notes: "Waste collection settled during route",
      villagerId: ramesh.id,
      collectorId: collector.id,
      serviceId: wasteService.id,
      subscriptionId: wasteSubscription.id,
      submissionId: submission.id,
    },
  });

  await prisma.collection.upsert({
    where: { receiptNumber: "RCPT-1003" },
    update: {
      amount: 75,
      billingPeriod: "Mar 2026",
      status: DueStatus.PENDING,
      notes: "Pending street light dues",
      villagerId: anita.id,
      collectorId: collector.id,
      serviceId: lightService.id,
      subscriptionId: lightSubscription.id,
      submissionId: null,
      collectedAt: null,
      submittedAt: null,
    },
    create: {
      receiptNumber: "RCPT-1003",
      amount: 75,
      billingPeriod: "Mar 2026",
      status: DueStatus.PENDING,
      notes: "Pending street light dues",
      villagerId: anita.id,
      collectorId: collector.id,
      serviceId: lightService.id,
      subscriptionId: lightSubscription.id,
    },
  });

  await prisma.collection.upsert({
    where: { receiptNumber: "RCPT-1004" },
    update: {
      amount: 60,
      billingPeriod: "Mar 2026",
      status: DueStatus.PENDING,
      notes: "Pending waste collection dues",
      villagerId: mohan.id,
      collectorId: collector.id,
      serviceId: wasteService.id,
      subscriptionId: mohanWasteSubscription.id,
      submissionId: null,
      collectedAt: null,
      submittedAt: null,
    },
    create: {
      receiptNumber: "RCPT-1004",
      amount: 60,
      billingPeriod: "Mar 2026",
      status: DueStatus.PENDING,
      notes: "Pending waste collection dues",
      villagerId: mohan.id,
      collectorId: collector.id,
      serviceId: wasteService.id,
      subscriptionId: mohanWasteSubscription.id,
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
