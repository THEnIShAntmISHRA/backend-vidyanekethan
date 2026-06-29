const path = require("path");
require("dotenv").config({ path: "c:/Users/admin/Desktop/vidyaniketan-academy/backend-vidyanekethan/.env" });
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

  const tablesToCheck = ["students", "inquiries", "appointments"];
  for (const table of tablesToCheck) {
    const [rows] = await conn.query(`SELECT DISTINCT standard FROM \`${table}\``);
    console.log(`Distinct standards in '${table}':`, rows.map(r => r.standard));
  }

  await conn.end();
}
run().catch(console.error);
