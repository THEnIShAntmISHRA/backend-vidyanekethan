/**
 * add_soft_delete_columns.js
 * Alter existing database tables to add the deleted_at column safely.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const db = require("../config/db");

async function addColumns() {
  const tables = [
    "students",
    "teachers",
    "inquiries",
    "appointments",
    "invoices",
    "finance_records",
    "teacher_updates"
  ];

  console.log("🛠️  Altering tables to add 'deleted_at' column...");

  for (const table of tables) {
    try {
      const [columns] = await db.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'deleted_at'`);
      if (columns.length === 0) {
        await db.query(`ALTER TABLE \`${table}\` ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL`);
        console.log(`✅ Added deleted_at column to '${table}' table`);
      } else {
        console.log(`ℹ️  deleted_at already exists in '${table}' table`);
      }
    } catch (err) {
      console.error(`❌ Error altering table '${table}':`, err.message);
    }
  }

  console.log("\n🎉 Schema alter script finished!\n");
  process.exit(0);
}

addColumns().catch((err) => {
  console.error("❌ Alter execution failed:", err.message);
  process.exit(1);
});
