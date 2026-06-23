const db = require("../config/db");

exports.getDeletedItems = async (req, res) => {
  try {
    const aid = req.admin.id;

    // Fetch deleted items from each table
    const [students] = await db.query("SELECT * FROM students WHERE admin_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [aid]);
    const [teachers] = await db.query("SELECT * FROM teachers WHERE admin_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [aid]);
    const [inquiries] = await db.query("SELECT * FROM inquiries WHERE admin_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [aid]);
    const [appointments] = await db.query("SELECT * FROM appointments WHERE admin_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [aid]);
    const [invoices] = await db.query("SELECT * FROM invoices WHERE admin_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [aid]);
    const [finance] = await db.query("SELECT * FROM finance_records WHERE admin_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [aid]);
    const [updates] = await db.query("SELECT * FROM teacher_updates WHERE admin_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC", [aid]);

    res.json({
      success: true,
      data: {
        students,
        teachers,
        inquiries,
        appointments,
        invoices,
        finance,
        updates
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.restoreItem = async (req, res) => {
  try {
    const aid = req.admin.id;
    const { type, id } = req.body;

    if (!type || !id) {
      return res.status(400).json({ success: false, message: "Type and ID are required" });
    }

    let tableName = "";
    switch (type) {
      case "student":
        tableName = "students";
        break;
      case "teacher":
        tableName = "teachers";
        break;
      case "inquiry":
        tableName = "inquiries";
        break;
      case "appointment":
        tableName = "appointments";
        break;
      case "invoice":
        tableName = "invoices";
        break;
      case "finance":
        tableName = "finance_records";
        break;
      case "update":
        tableName = "teacher_updates";
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid item type" });
    }

    const [result] = await db.query(
      `UPDATE \`${tableName}\` SET deleted_at = NULL WHERE id = ? AND admin_id = ?`,
      [id, aid]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Item not found or already active" });
    }

    res.json({ success: true, message: `${type} restored successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.permanentlyDeleteItem = async (req, res) => {
  try {
    const aid = req.admin.id;
    const { type, id } = req.body;

    if (!type || !id) {
      return res.status(400).json({ success: false, message: "Type and ID are required" });
    }

    let tableName = "";
    switch (type) {
      case "student":
        tableName = "students";
        break;
      case "teacher":
        tableName = "teachers";
        break;
      case "inquiry":
        tableName = "inquiries";
        break;
      case "appointment":
        tableName = "appointments";
        break;
      case "invoice":
        tableName = "invoices";
        break;
      case "finance":
        tableName = "finance_records";
        break;
      case "update":
        tableName = "teacher_updates";
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid item type" });
    }

    const [result] = await db.query(
      `DELETE FROM \`${tableName}\` WHERE id = ? AND admin_id = ?`,
      [id, aid]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, message: `${type} permanently deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
