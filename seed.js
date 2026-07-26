const mysql = require("mysql2/promise");
const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const SEED_COUNT = Number(process.env.SEED_COUNT || 50);

function buildUser() {
  return [
    uuidv4(),
    faker.internet.userName().slice(0, 40) + "_" + faker.string.alphanumeric(4),
    faker.internet.email().toLowerCase(),
    faker.internet.password({ length: 10 }),
  ];
}

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "delta_app",
  });

  try {
    const users = Array.from({ length: SEED_COUNT }, buildUser);
    const sql =
      "INSERT INTO user (id, username, email, password) VALUES ?";
    const [result] = await connection.query(sql, [users]);
    console.log(`Seeded ${result.affectedRows} users successfully.`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

seed();
