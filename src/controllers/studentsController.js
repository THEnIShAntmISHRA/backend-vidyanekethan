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

/* GET /api/students?standard=&course=&branch=&search= */
exports.getAll = async (req, res) => {
  try {
    const { standard, course, branch, search } = req.query;
/*    let sql = "SELECT * FROM students WHERE admin_id = ? OR admin_id = 8";
    const params = [req.admin.id]; */

 let sql = "SELECT * FROM students WHERE deleted_at IS NULL";
    const params = [];

    if (standard) { sql += " AND standard = ?"; params.push(standard); }
    if (course)     { sql += " AND course LIKE ?"; params.push(`%${course}%`); }
    if (branch)  { sql += " AND branch = ?"; params.push(branch); }
    if (search) {
      sql += " AND (name LIKE ? OR phone LIKE ? OR father_phone LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    sql += " ORDER BY created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/students/:id */
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      "Select * from students WHERE id = ? AND (admin_id = ? OR admin_id IN (1,8)) AND deleted_at IS NULL",
      [req.params.id, req.admin.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/students */
exports.create = async (req, res) => {
  try {
    const {
      admin_id, name, email, phone, father_name, father_phone, gender, academic_year,
      standard, course, branch, hostel, fee, paid_fee, dob, address, aadhar,
      caste_religion, photo, admission_type, admission_date, school_fee, academy_fee, hostel_fee,
      scholarship_type, scholarship_value, scholarship_amount,
      mother_name, school_name, scholarship_applied_to
    } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const [result] = await db.query(
      `INSERT INTO students
         (admin_id, name, email, phone, father_name, father_phone, mother_name, school_name, gender, academic_year,
          standard, course, branch, hostel, fee, paid_fee, dob, address, aadhar,
          caste_religion, photo, admission_type, admission_date, school_fee, academy_fee, hostel_fee,
          scholarship_type, scholarship_value, scholarship_amount, scholarship_applied_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admin_id || req.admin?.id || null, name, email || null, phone || "", father_name || "", father_phone || "",
        mother_name || "", school_name || "",
        gender || "", academic_year || "", standard || "", course || "", branch || "", hostel || "",
        fee || 0, paid_fee || 0, formatDate(dob), address || "", aadhar || "",
        caste_religion || "", photo || null, admission_type || "", formatDate(admission_date),
        school_fee || 0, academy_fee || 0, hostel_fee || 0,
        scholarship_type || 'None', scholarship_value || 0, scholarship_amount || 0,
        scholarship_applied_to || ""
      ]
    );
    res.status(201).json({ success: true, message: "Student created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* PUT /api/students/:id */
exports.update = async (req, res) => {
  try {
    const {
      admin_id, name, id, email, phone, father_name, father_phone, gender, academic_year,
      standard, course, branch, hostel, academy_fee, school_fee, hostel_fee, fee, paid_fee,
      dob, address, aadhar, caste_religion, photo, admission_type, admission_date,
      scholarship_type, scholarship_value, scholarship_amount,
      mother_name, school_name, scholarship_applied_to
    } = req.body;
    const [result] = await db.query(
      `UPDATE students
       SET name=?,email=?,phone=?,father_name=?,father_phone=?,mother_name=?,school_name=?,standard=?,course=?,
       branch=?,academy_fee=?,school_fee=?,hostel_fee=?,fee=?,paid_fee=?,
       dob=?,address=?,aadhar=?,caste_religion=?,photo=?,admission_type=?,admission_date=?,
       gender=?,academic_year=?,hostel=?,scholarship_type=?,scholarship_value=?,scholarship_amount=?,scholarship_applied_to=?
       WHERE id=?`,
      [
        name, email || null, phone || "", father_name || "", father_phone || "",
        mother_name || "", school_name || "",
        standard || "", course || "", branch || "", academy_fee || 0, school_fee || 0, hostel_fee || 0, fee || 0, paid_fee || 0,
        formatDate(dob), address || "", aadhar || "", caste_religion || "", photo || null, admission_type || "", formatDate(admission_date),
        gender || "", academic_year || "", hostel || "",
        scholarship_type || 'None', scholarship_value || 0, scholarship_amount || 0,
        scholarship_applied_to || "",
        id || req.params.id
      ]
    );

    console.log("Admin id", result);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* DELETE /api/students/:id */
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE students SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND (admin_id = ? OR admin_id IN (1, 8)) AND deleted_at IS NULL",
      [req.params.id, req.admin.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
