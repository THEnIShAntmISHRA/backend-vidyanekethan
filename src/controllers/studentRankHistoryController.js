const db = require("../config/db");
const { ensureRankTable, snapshotRanksForAdmin } = require("../services/performanceSnapshotService");

exports.getByStudent = async (req, res) => {
  try {
    await ensureRankTable();
    const studentId = Number(req.params.studentId);
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Valid student id is required" });
    }

    const [rows] = await db.query(
      `
      SELECT id, student_id, class_rank, total_students, average_percentage, standard, snapshot_date, created_at
      FROM student_rank_history
      WHERE admin_id = ? AND student_id = ?
      ORDER BY snapshot_date DESC, id DESC
      `,
      [req.admin.id, studentId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.snapshotAll = async (req, res) => {
  try {
    const result = await snapshotRanksForAdmin(req.admin.id);
    res.json({
      success: true,
      message: "Rank snapshot saved",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
