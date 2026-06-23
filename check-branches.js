const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mysql = require("mysql2/promise");

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "vidyaniketan",
  });
  console.log("Connected to DB:", process.env.DB_NAME);

  const [branches] = await conn.query("SELECT * FROM branches");
  console.log("Branches in database:");
  console.log(JSON.stringify(branches, null, 2));

  await conn.end();
}
run().catch(console.error);
