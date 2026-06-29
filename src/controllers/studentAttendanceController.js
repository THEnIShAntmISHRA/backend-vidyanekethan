const db = require("../config/db");

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      student_id INT NOT NULL,
      period_label VARCHAR(120) NOT NULL,
      attendance_percentage DECIMAL(5,2) NOT NULL,
      record_date DATE NOT NULL,
      notes VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admin_student (admin_id, student_id),
      INDEX idx_record_date (record_date)
    )
  `);
}

exports.getByStudent = async (req, res) => {
  try {
    await ensureTable();
    const studentId = Number(req.params.studentId);
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Valid student id is required" });
    }

    const [rows] = await db.query(
      `
      SELECT id, student_id, period_label, attendance_percentage, record_date, notes, created_at
      FROM student_attendance
      WHERE admin_id = ? AND student_id = ?
      ORDER BY record_date DESC, id DESC
      `,
      [req.admin.id, studentId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createByStudent = async (req, res) => {
  try {
    await ensureTable();
    const studentId = Number(req.params.studentId);
    const { period_label, attendance_percentage, record_date, notes } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Valid student id is required" });
    }
    if (!period_label || !record_date) {
      return res.status(400).json({
        success: false,
        message: "Period label and record date are required",
      });
    }

    const pct = Number(attendance_percentage);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({
        success: false,
        message: "Attendance must be between 0 and 100",
      });
    }

    const [studentRows] = await db.query("SELECT id FROM students WHERE id = ?", [studentId]);
    if (!studentRows.length) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    await db.query(
      `
      INSERT INTO student_attendance
        (admin_id, student_id, period_label, attendance_percentage, record_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        req.admin.id,
        studentId,
        String(period_label).trim(),
        pct,
        record_date,
        notes ? String(notes).trim() : null,
      ]
    );

    res.status(201).json({ success: true, message: "Attendance recorded" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
