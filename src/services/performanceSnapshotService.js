const db = require("../config/db");

async function ensureRankTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_rank_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      student_id INT NOT NULL,
      class_rank INT NOT NULL,
      total_students INT NOT NULL DEFAULT 0,
      average_percentage DECIMAL(10,2) NOT NULL DEFAULT 0,
      standard VARCHAR(50) NULL,
      snapshot_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_admin_student_date (admin_id, student_id, snapshot_date),
      INDEX idx_admin_student (admin_id, student_id)
    )
  `);
}

function averagePctFromRows(subjectRows) {
  let sum = 0;
  let count = 0;
  for (const row of subjectRows.values()) {
    const total = Number(row.total_marks) > 0 ? Number(row.total_marks) : 100;
    sum += (Number(row.marks) / total) * 100;
    count += 1;
  }
  return count > 0 ? sum / count : 0;
}

/**
 * Recompute class ranks from latest assessment per subject and persist one row per student per day.
 */
async function snapshotRanksForAdmin(adminId) {
  await ensureRankTable();
  await db.query(`
    CREATE TABLE IF NOT EXISTS teacher_student_assessments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      student_id INT NOT NULL,
      subject VARCHAR(120) NOT NULL,
      marks DECIMAL(10,2) NOT NULL DEFAULT 0,
      total_marks DECIMAL(10,2) NULL DEFAULT 100,
      examination VARCHAR(150) NOT NULL,
      exam_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await db.query(
    `
    SELECT student_id, subject, marks, total_marks, exam_date, id
    FROM teacher_student_assessments
    WHERE admin_id = ?
    ORDER BY exam_date DESC, id DESC
    `,
    [adminId]
  );

  const byStudent = new Map();
  for (const row of rows) {
    const sid = Number(row.student_id);
    if (!byStudent.has(sid)) byStudent.set(sid, new Map());
    const subjects = byStudent.get(sid);
    const key = String(row.subject || "").trim();
    if (key && !subjects.has(key)) subjects.set(key, row);
  }

  const scores = [];
  for (const [studentId, subjectMap] of byStudent.entries()) {
    scores.push({
      student_id: studentId,
      average_percentage: averagePctFromRows(subjectMap),
    });
  }

  scores.sort((a, b) => b.average_percentage - a.average_percentage);
  const totalStudents = scores.length;
  const snapshotDate = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < scores.length; i++) {
    const entry = scores[i];
    await db.query(
      `
      INSERT INTO student_rank_history
        (admin_id, student_id, class_rank, total_students, average_percentage, snapshot_date)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        class_rank = VALUES(class_rank),
        total_students = VALUES(total_students),
        average_percentage = VALUES(average_percentage)
      `,
      [
        adminId,
        entry.student_id,
        i + 1,
        totalStudents,
        Number(entry.average_percentage.toFixed(2)),
        snapshotDate,
      ]
    );
  }

  return { totalStudents, snapshotDate };
}

module.exports = {
  ensureRankTable,
  snapshotRanksForAdmin,
};
