/**
 * add_creator_updater_columns.js
 * Safely adds created_by and updated_by columns to existing database tables.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const db = require("../config/db");

async function run() {
  const tables = [
    { name: "students", columns: ["created_by", "updated_by"] },
    { name: "teachers", columns: ["created_by", "updated_by"] },
    { name: "inquiries", columns: ["created_by", "updated_by"] },
    { name: "appointments", columns: ["created_by", "updated_by"] },
    { name: "invoices", columns: ["created_by", "updated_by"] },
    { name: "finance_records", columns: ["created_by"] }, // no update flow, only created_by
    { name: "teacher_updates", columns: ["created_by", "updated_by"] }
  ];

  console.log("🛠️  Altering tables to add tracking columns (created_by, updated_by)...");

  for (const t of tables) {
    for (const col of t.columns) {
      try {
        const [columns] = await db.query(`SHOW COLUMNS FROM \`${t.name}\` LIKE '${col}'`);
        if (columns.length === 0) {
          await db.query(`ALTER TABLE \`${t.name}\` ADD COLUMN \`${col}\` VARCHAR(100) NULL DEFAULT NULL`);
          console.log(`✅ Added column '${col}' to table '${t.name}'`);
        } else {
          console.log(`ℹ️  Column '${col}' already exists in table '${t.name}'`);
        }
      } catch (err) {
        console.error(`❌ Error altering table '${t.name}' for column '${col}':`, err.message);
      }
    }
  }

  console.log("\n🎉 Tracking columns migration finished!\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Migration execution failed:", err.message);
  process.exit(1);
});
