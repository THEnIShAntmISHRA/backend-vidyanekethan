/**
 * add_deleted_at_indexes.js
 * Creates composite indexes on (admin_id, deleted_at) for optimized soft delete queries.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const db = require("../config/db");

async function addIndexes() {
  const tables = [
    "students",
    "teachers",
    "inquiries",
    "appointments",
    "invoices",
    "finance_records",
    "teacher_updates"
  ];

  console.log("🛠️  Adding composite index (admin_id, deleted_at) for optimized soft deletes...");

  for (const table of tables) {
    try {
      const [indexes] = await db.query(`SHOW INDEX FROM \`${table}\` WHERE Key_name = 'idx_admin_deleted'`);
      if (indexes.length === 0) {
        await db.query(`ALTER TABLE \`${table}\` ADD INDEX idx_admin_deleted (admin_id, deleted_at)`);
        console.log(`✅ Created index idx_admin_deleted on '${table}'`);
      } else {
        console.log(`ℹ️  Index idx_admin_deleted already exists on '${table}'`);
      }
    } catch (err) {
      console.error(`❌ Error indexing table '${table}':`, err.message);
    }
  }

  console.log("\n🎉 Index migration complete!\n");
  process.exit(0);
}

addIndexes().catch((err) => {
  console.error("❌ Indexing execution failed:", err.message);
  process.exit(1);
});
