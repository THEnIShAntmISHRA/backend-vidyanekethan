const db = require("../config/db");

// Helper to safely format Date to YYYY-MM-DD or null for MySQL
const formatDate = (dateVal) => {
  if (!dateVal) return null;
  if (typeof dateVal === "string") {
    if (dateVal.includes("T")) {
      return dateVal.split("T")[0];
    }
    if (dateVal.trim() === "") {
      return null;
    }
    return dateVal;
  }
  if (dateVal instanceof Date) {
    return dateVal.toISOString().split("T")[0];
  }
  return dateVal;
};

function computeStatus(amount, paidAmount, dueDate) {
  if (paidAmount >= amount) return "Paid";
  if (paidAmount > 0) return "Partial";
  if (dueDate && new Date(dueDate) < new Date()) return "Overdue";
  return "Pending";
}

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT 
        invoices.*,
        students.phone AS student_phone,
        students.fee AS student_fee,
        students.paid_fee AS student_paid_fee,
        students.school_fee AS student_school_fee,
        students.academy_fee AS student_academy_fee,
        students.hostel_fee AS student_hostel_fee,
        students.scholarship_type AS student_scholarship_type,
        students.scholarship_value AS student_scholarship_value,
        students.scholarship_amount AS student_scholarship_amount,
        students.scholarship_applied_to AS student_scholarship_applied_to,
        students.mother_name AS student_mother_name,
        students.school_name AS student_school_name,
        students.standard AS student_standard,
        students.batch AS student_batch,
        students.branch AS student_branch
      FROM invoices
      LEFT JOIN students 
        ON invoices.student_id = students.id
      WHERE invoices.admin_id = ? AND invoices.deleted_at IS NULL
    `;
    const params = [req.admin.id];
    if (status && status !== "all") { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY created_at DESC";
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         invoices.*,
         students.phone AS student_phone,
         students.fee AS student_fee,
         students.paid_fee AS student_paid_fee,
         students.school_fee AS student_school_fee,
         students.academy_fee AS student_academy_fee,
         students.hostel_fee AS student_hostel_fee,
         students.scholarship_type AS student_scholarship_type,
         students.scholarship_value AS student_scholarship_value,
         students.scholarship_amount AS student_scholarship_amount,
         students.scholarship_applied_to AS student_scholarship_applied_to,
         students.mother_name AS student_mother_name,
         students.school_name AS student_school_name,
         students.standard AS student_standard,
         students.batch AS student_batch,
         students.branch AS student_branch
       FROM invoices
       LEFT JOIN students 
         ON invoices.student_id = students.id
       WHERE invoices.id = ? AND invoices.admin_id = ? AND invoices.deleted_at IS NULL`,
      [req.params.id, req.admin.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { student_name, student_id, amount, paid_amount, due_date, description,  install_date,
      transaction_type } = req.body;
    if (!student_name || !amount)
      return res.status(400).json({ success: false, message: "Student name and amount are required" });

    const paid = parseFloat(paid_amount) || 0;
    const total = parseFloat(amount);
    const status = computeStatus(total, paid, due_date);

    const [result] = await db.query(
      `INSERT INTO invoices (admin_id,student_id,student_name,amount,paid_amount,due_date,status,description,install_date, transaction_type)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.admin.id, student_id||null, student_name, total, paid, formatDate(due_date), status, description||"", formatDate(install_date),
        transaction_type || "Cash",]
    );
    res.status(201).json({ success: true, message: "Invoice created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { student_name, student_id, amount, paid_amount, due_date, install_date, transaction_type, description } = req.body;
    const paid = parseFloat(paid_amount) || 0;
    const total = parseFloat(amount);
    const status = computeStatus(total, paid, due_date);

    const [result] = await db.query(
      `UPDATE invoices
       SET student_name=?,student_id=?,amount=?,paid_amount=?,due_date=?,status=?,description=?,install_date=?,transaction_type=? 
       WHERE id=?`,
      [student_name, student_id||null, total, paid, formatDate(due_date), status, description||"", formatDate(install_date),transaction_type || "Cash", 
       req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, message: "Invoice updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE invoices SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL",
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/invoices/summary – totals for the summary cards */
exports.summary = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         SUM(amount)      AS total_invoiced,
         SUM(paid_amount) AS total_paid,
         SUM(amount - paid_amount) AS total_pending
       FROM invoices WHERE (admin_id = ? OR admin_id = 8) AND deleted_at IS NULL`,
      [req.admin.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
