
require("dotenv").config();

const prisma = require("./db");

async function testPrisma() {
  try {
    const userCount = await prisma.user.count();

    console.log("SUCCESS: Prisma is communicating with PostgreSQL.");
    console.log("Current users:", userCount);
  } catch (error) {
    console.error("Prisma test failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
