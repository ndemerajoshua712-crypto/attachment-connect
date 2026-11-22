
require("dotenv").config();

const prisma = require("./db");

async function testDatabase() {
  try {
    await prisma.$connect();

    console.log("SUCCESS: Connected to PostgreSQL!");
    console.log("Database: attachment_connect");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
