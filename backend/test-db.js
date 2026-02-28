/**
 * Quick database test script
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("✓ Connected successfully");
    
    const count = await prisma.user.count();
    console.log(`✓ Database accessible (${count} users)`);
    
    await prisma.$disconnect();
    console.log("✓ Test completed");
  } catch (error) {
    console.error("✗ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

test();
