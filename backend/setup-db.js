/**
 * Database Setup Script
 * Run this script to initialize the database
 * 
 * Usage: node setup-db.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log("Checking database connection...");
    
    // Test connection
    await prisma.$connect();
    console.log("✓ Database connection successful");
    
    // Check if we can query
    const userCount = await prisma.user.count();
    console.log(`✓ Database is accessible (${userCount} users found)`);
    
    console.log("\n✓ Database is ready!");
    console.log("\nYou can now:");
    console.log("1. Start the backend server: npm run dev");
    console.log("2. Register a new account through the frontend");
    
  } catch (error) {
    console.error("\n✗ Database setup failed:");
    console.error(error.message);
    console.error("\nPlease ensure:");
    console.error("1. PostgreSQL is installed and running");
    console.error("2. DATABASE_URL in .env file is correct");
    console.error("3. Database exists (create it if needed)");
    console.error("\nExample DATABASE_URL:");
    console.error('DATABASE_URL="postgresql://user:password@localhost:5432/legal_platform"');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
