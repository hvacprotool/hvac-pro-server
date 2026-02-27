import prisma from "./src/prisma.js";

const email = "test+20260227080252@hvacpro.com";

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { entitlements: ["hvac_assistant"] },
    select: { email: true, entitlements: true },
  });

  console.log("Updated user:", user);
}

main()
  .catch((err) => {
    console.error("Failed to update entitlement:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });