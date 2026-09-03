import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Bills",
  "Airtime",
  "Entertainment",
  "Miscellaneous",
];

async function main() {
  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, isSystem: true },
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
