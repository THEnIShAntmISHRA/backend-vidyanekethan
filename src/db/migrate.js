/**
 *  * migrate.js
  * Run once:  node src/db/migrate.js
   * Creates the database (if missing) and all tables.
    */

    require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
    const mysql = require("mysql2/promise");

    const {
    DB_HOST = "localhost",
    DB_PORT = "3306",
    DB_USER = "root",
    DB_PASSWORD = "",
    DB_NAME = "institutems",
    } = process.env;

    const DDL = `
    -- ─────────────────────────────────────────────────────────
    -- 1. admins  (login accounts for institute owners / staff)
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS admins (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    role       VARCHAR(255) NOT NULL DEFAULT '',
    address     TEXT,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- ─────────────────────────────────────────────────────────
    -- 2. students
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS students (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id     INT UNSIGNED NOT NULL,
    name         VARCHAR(100) NOT NULL,
    gender       ENUM('Male','Female', '') DEFAULT '',
    academic_year VARCHAR(50)  DEFAULT '',
    email        VARCHAR(150) DEFAULT NULL,
    phone        VARCHAR(20)  DEFAULT '',
    father_name  VARCHAR(100) DEFAULT '',
    father_phone VARCHAR(20)  DEFAULT '',
    mother_name  VARCHAR(100) DEFAULT '',
    school_name  VARCHAR(200) DEFAULT '',
    course        VARCHAR(100) DEFAULT '',
    standard     VARCHAR(50)  DEFAULT '',
    branch       VARCHAR(100) DEFAULT '',
    hostel       ENUM('Yes','No', '')      DEFAULT '',
    school_fee          DECIMAL(10,2) DEFAULT 0.00,
    hostel_fee          DECIMAL(10,2) DEFAULT 0.00,
    academy_fee          DECIMAL(10,2) DEFAULT 0.00,
    fee          DECIMAL(10,2) DEFAULT 0.00,
    paid_fee     DECIMAL(10,2) DEFAULT 0.00,
    scholarship_type     ENUM('Flat','Percent','None') DEFAULT 'None',
    scholarship_value    DECIMAL(10,2) DEFAULT 0.00,
    scholarship_amount   DECIMAL(10,2) DEFAULT 0.00,
    scholarship_applied_to VARCHAR(255) DEFAULT '',
    dob         DATE         DEFAULT NULL,
    address     TEXT         ,
    aadhar      VARCHAR(20)  ,
    caste_religion VARCHAR(100) DEFAULT '',
    photo         LONGTEXT     DEFAULT NULL,
    admission_type VARCHAR(100) DEFAULT '',
    admission_date DATE         DEFAULT NULL,
    deleted_at   DATETIME     DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- ─────────────────────────────────────────────────────────
    -- 3. teachers
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS teachers (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id   INT UNSIGNED NOT NULL,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) DEFAULT NULL,
    phone      VARCHAR(20)  DEFAULT '',
    institute  VARCHAR(200) DEFAULT '',
    location   VARCHAR(100) DEFAULT '',
    subjects   JSON         DEFAULT NULL,   -- e.g. ["Math","Physics"]
    deleted_at DATETIME     DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- ─────────────────────────────────────────────────────────
    -- 4. inquiries
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS inquiries (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id     INT UNSIGNED NOT NULL,
    name         VARCHAR(100) NOT NULL,
    phone        VARCHAR(20)  NOT NULL,
    father_name  VARCHAR(100) DEFAULT '',
    father_phone VARCHAR(20)  DEFAULT '',
    course       VARCHAR(100) DEFAULT '',
    location     VARCHAR(100) DEFAULT '',
    board        VARCHAR(20)  DEFAULT '',
    standard     VARCHAR(50)  DEFAULT '',
    status       ENUM('New','Contacted','Follow Up','Admission Done','Not Interested') NOT NULL DEFAULT 'New',
    video        VARCHAR(500) DEFAULT '',
    inquiry_date DATE         NOT NULL DEFAULT (CURRENT_DATE),
    deleted_at   DATETIME     DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- ─────────────────────────────────────────────────────────
    -- 5. appointments
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS appointments (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id         INT UNSIGNED NOT NULL,
    name             VARCHAR(100) NOT NULL,
    standard         VARCHAR(50)  DEFAULT '',
    board            VARCHAR(20)  DEFAULT '',
    course           VARCHAR(100) DEFAULT '',
    appointment_date DATE         NOT NULL,
    appointment_time TIME         NOT NULL,
    location         VARCHAR(100) DEFAULT '',
    whatsapp         VARCHAR(25)  DEFAULT '',
    status           ENUM('Pending','Confirmed','Done','Cancelled') NOT NULL DEFAULT 'Pending',
    deleted_at       DATETIME     DEFAULT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- ─────────────────────────────────────────────────────────
    -- 6. invoices
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS invoices (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id     INT UNSIGNED NOT NULL,
    student_id   INT UNSIGNED DEFAULT NULL,
    student_name VARCHAR(100) NOT NULL,
    amount       DECIMAL(10,2) NOT NULL,
    paid_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    install_date DATE         DEFAULT NULL,
    transaction_type ENUM('Cash','Online','Cheque', '') NOT NULL DEFAULT '',
    due_date     DATE          DEFAULT NULL,
    status       ENUM('Paid','Partial','Pending','Overdue') NOT NULL DEFAULT 'Pending',
    description  VARCHAR(500)  DEFAULT '',
    deleted_at   DATETIME      DEFAULT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id)   REFERENCES admins(id)   ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- ─────────────────────────────────────────────────────────
    -- 7. finance_records  (payroll + expenses)
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS finance_records (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id     INT UNSIGNED NOT NULL,
    type         ENUM('Payroll','Expense') NOT NULL,
    name         VARCHAR(200) NOT NULL,
    amount       DECIMAL(10,2) NOT NULL,
    record_date  DATE          NOT NULL,
    category     VARCHAR(100)  DEFAULT '',
    deleted_at   DATETIME      DEFAULT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


    -- ─────────────────────────────────────────────────────────
    -- 8. branches
    -- ─────────────────────────────────────────────────────────

    -- 1. Branches (The parent entity)

    CREATE TABLE IF NOT EXISTS branches (
    branch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 2. Batches (Linked to a Branch)
    CREATE TABLE IF NOT EXISTS batches (
    batch_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id INT UNSIGNED NOT NULL, -- Identity: Which branch owns this batch?
    batch_name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    batch_start_date DATE NOT NULL,
    batch_end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_batch_branch 
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) 
    ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


    -- 2. Boards (Universal - defined once for the whole institute)
    CREATE TABLE IF NOT EXISTS boards (
    board_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


    CREATE TABLE IF NOT EXISTS standards (
    stand_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    board_id INT UNSIGNED NOT NULL,
    batch_id INT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT fk_std_board FOREIGN KEY (board_id) REFERENCES boards(board_id),
    CONSTRAINT fk_std_batch FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Subjects
    CREATE TABLE IF NOT EXISTS subjects (
    sub_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    stand_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    teacher_id INT UNSIGNED NULL,
    CONSTRAINT fk_sub_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT fk_sub_std FOREIGN KEY (stand_id) REFERENCES standards(stand_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



    -- Chapters table remains the same
    CREATE TABLE IF NOT EXISTS chapters (
    chap_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sub_id INT UNSIGNED NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    CONSTRAINT fk_chapter_subject FOREIGN KEY (sub_id) REFERENCES subjects(sub_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- New Topics table linked to Chapter
    CREATE TABLE IF NOT EXISTS topics (
    topic_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chap_id INT UNSIGNED NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_topic_chapter FOREIGN KEY (chap_id) REFERENCES chapters(chap_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Notes
    CREATE TABLE IF NOT EXISTS notes (
    note_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chap_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notes_chapter FOREIGN KEY (chap_id) REFERENCES chapters(chap_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- inquiry_extra
    CREATE TABLE IF NOT EXISTS inquiry_extra (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id     INT UNSIGNED DEFAULT NULL,
    name         VARCHAR(100) NOT NULL,
    phone        VARCHAR(20)  NOT NULL,
    father_name  VARCHAR(100) DEFAULT '',
    father_phone VARCHAR(20)  DEFAULT '',
    course       VARCHAR(100) DEFAULT '',
    location     VARCHAR(100) DEFAULT '',
    board        VARCHAR(20)  DEFAULT '',
    standard     VARCHAR(50)  DEFAULT '',
    status       VARCHAR(50)  DEFAULT 'New',
    video        VARCHAR(500) DEFAULT '',
    dob          VARCHAR(50)  DEFAULT '',
    email        VARCHAR(150) DEFAULT '',
    address      TEXT,
    college_name VARCHAR(200) DEFAULT '',
    college_timing VARCHAR(100) DEFAULT '',
    last_exam_marks VARCHAR(50) DEFAULT '',
    father_occupation VARCHAR(100) DEFAULT '',
    mother_occupation VARCHAR(100) DEFAULT '',
    future_plans VARCHAR(200) DEFAULT '',
    reference    VARCHAR(200) DEFAULT '',
    sibling_name VARCHAR(100) DEFAULT '',
    sex          VARCHAR(50)  DEFAULT '',
    taking_coaching VARCHAR(50) DEFAULT '',
    hostel_required VARCHAR(50) DEFAULT '',
    inquiry_date DATE         DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- ─────────────────────────────────────────────────────────
    -- 9. teacher_updates
    -- ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS teacher_updates (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id     INT UNSIGNED NOT NULL,
    teacher_name VARCHAR(100) NOT NULL,
    batch        VARCHAR(255) NOT NULL,
    subject      VARCHAR(255) NOT NULL,
    chapter      VARCHAR(255) NOT NULL,
    topic        VARCHAR(255) NOT NULL,
    branch       VARCHAR(255) NOT NULL,
    class_date   DATE NOT NULL,
    class_time   VARCHAR(50) NOT NULL,
    remarks      TEXT DEFAULT NULL,
    deleted_at   DATETIME     DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;



    async function migrate() {
    // Connect WITHOUT specifying a database so we can CREATE it
    const conn = await mysql.createConnection({
    host: DB_HOST, port: parseInt(DB_PORT),
    user: DB_USER, password: DB_PASSWORD,
    multipleStatements: true,
    });

    console.log("📦 Connected to MySQL as root");

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${DB_NAME}' ready`);

    await conn.query(`USE \`${DB_NAME}\``);

    // Run all CREATE TABLE statements
    await conn.query(DDL);
    console.log("✅ All tables created (or already existed)");

    // DYNAMIC ALTER FOR NEW COLUMNS & SOF BRANCH UPDATE
    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM students");
      const columnNames = columns.map(c => c.Field);
      
      const expectedColumns = [
        { name: "mother_name", definition: "VARCHAR(100) DEFAULT ''" },
        { name: "school_name", definition: "VARCHAR(200) DEFAULT ''" },
        { name: "school_fee", definition: "DECIMAL(10,2) DEFAULT 0.00" },
        { name: "hostel_fee", definition: "DECIMAL(10,2) DEFAULT 0.00" },
        { name: "academy_fee", definition: "DECIMAL(10,2) DEFAULT 0.00" },
        { name: "scholarship_type", definition: "ENUM('Flat','Percent','None') DEFAULT 'None'" },
        { name: "scholarship_value", definition: "DECIMAL(10,2) DEFAULT 0.00" },
        { name: "scholarship_amount", definition: "DECIMAL(10,2) DEFAULT 0.00" },
        { name: "scholarship_applied_to", definition: "VARCHAR(255) DEFAULT ''" }
      ];

      for (const col of expectedColumns) {
        if (!columnNames.includes(col.name)) {
          await conn.query(`ALTER TABLE students ADD COLUMN \`${col.name}\` ${col.definition}`);
          console.log(`➕ Added column '${col.name}' to students table`);
        }
      }

      // Also migrate branches and existing data to 'SOF Branch'
      await conn.query("UPDATE branches SET branch_name = 'SOF Branch' WHERE branch_name = 'SOF (School of Foundation)'");
      await conn.query("UPDATE students SET branch = 'SOF Branch' WHERE branch = 'SOF (School of Foundation)'");
      await conn.query("UPDATE inquiries SET location = 'SOF Branch' WHERE location = 'SOF (School of Foundation)'");
      await conn.query("UPDATE appointments SET location = 'SOF Branch' WHERE location = 'SOF (School of Foundation)'");
      await conn.query("UPDATE teacher_updates SET branch = 'SOF Branch' WHERE branch = 'SOF (School of Foundation)'");
      console.log("🔄 Migrated 'SOF (School of Foundation)' to 'SOF Branch' in DB tables");

    } catch (alterErr) {
      console.error("⚠️ Alter column check or branch rename failed:", alterErr.message);
    }

    await conn.end();
    console.log("\n🎉 Migration complete!\n");
    }

    migrate().catch((err) => {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
    });

 