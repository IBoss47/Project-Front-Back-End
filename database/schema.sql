
-- สร้างตารางผู้ใช้งาน (users) สำหรับผู้ขาย
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(100) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL UNIQUE,
	full_name VARCHAR(255),
	phone VARCHAR(20),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตารางวิชา (courses)
CREATE TABLE IF NOT EXISTS courses (
	id SERIAL PRIMARY KEY,
	course_code VARCHAR(50) NOT NULL UNIQUE,
	course_name VARCHAR(255) NOT NULL,
	course_year INTEGER NOT NULL,
	department VARCHAR(100),
	description TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตารางหนังสือมือสองที่จะขาย (books_for_sale)
CREATE TABLE IF NOT EXISTS books_for_sale (
	id SERIAL PRIMARY KEY,
	book_title VARCHAR(255) NOT NULL,
	book_code VARCHAR(50) NOT NULL UNIQUE,
	price DECIMAL(10,2) NOT NULL,
	seller_id INTEGER NOT NULL,
	course_id INTEGER,
	semester VARCHAR(20),
	description TEXT,
	condition VARCHAR(50) DEFAULT 'ดี',
	book_cover VARCHAR(500),
	book_image VARCHAR(500),
	status VARCHAR(20) DEFAULT 'available',
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- สร้าง function สำหรับอัพเดท updated_at โดยอัตโนมัติ
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับตาราง users
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- สร้าง trigger สำหรับตาราง courses
CREATE TRIGGER update_courses_modtime
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- สร้าง trigger สำหรับตาราง books_for_sale
CREATE TRIGGER update_books_for_sale_modtime
BEFORE UPDATE ON books_for_sale
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_books_title ON books_for_sale(book_title);
CREATE INDEX idx_books_code ON books_for_sale(book_code);
CREATE INDEX idx_books_seller ON books_for_sale(seller_id);
CREATE INDEX idx_books_course ON books_for_sale(course_id);
CREATE INDEX idx_books_status ON books_for_sale(status);
CREATE INDEX idx_courses_year ON courses(course_year);
CREATE INDEX idx_courses_code ON courses(course_code);

-- เพิ่มข้อมูลตัวอย่างผู้ใช้งาน
INSERT INTO users (username, email, full_name, phone) VALUES
    ('boss47', 'boss@example.com', 'Boss Nattawut', '0812345678'),
    ('student01', 'student01@example.com', 'นักศึกษา ชั้นปี 1', '0823456789'),
    ('student02', 'student02@example.com', 'นักศึกษา ชั้นปี 2', '0834567890')
ON CONFLICT (username) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่างวิชา
INSERT INTO courses (course_code, course_name, course_year, department) VALUES
    -- ชั้นปี 1
    ('CS101', 'Introduction to Programming', 1, 'Computer Science'),
    ('MATH101', 'Calculus I', 1, 'Mathematics'),
    ('PHY101', 'General Physics I', 1, 'Physics'),
    ('STAT101', 'Introduction to Statistics', 1, 'Statistics'),
    ('MATH102', 'Discrete Mathematics', 1, 'Mathematics'),
    
    -- ชั้นปี 2
    ('CS201', 'Data Structures and Algorithms', 2, 'Computer Science'),
    ('CS202', 'Web Development', 2, 'Computer Science'),
    ('CS203', 'Mobile Application Development', 2, 'Computer Science'),
    ('MATH201', 'Linear Algebra', 2, 'Mathematics'),
    
    -- ชั้นปี 3
    ('CS301', 'Human-Computer Interaction', 3, 'Computer Science'),
    ('CS302', 'Database Management Systems', 3, 'Computer Science'),
    ('CS303', 'Operating Systems', 3, 'Computer Science'),
    ('CS304', 'Computer Networks', 3, 'Computer Science'),
    ('CS305', 'Algorithm Design and Analysis', 3, 'Computer Science'),
    ('CS306', 'Software Engineering', 3, 'Computer Science'),
    
    -- ชั้นปี 4
    ('CS401', 'Artificial Intelligence', 4, 'Computer Science'),
    ('CS402', 'Machine Learning', 4, 'Computer Science'),
    ('CS403', 'Cloud Computing', 4, 'Computer Science')
ON CONFLICT (course_code) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่างหนังสือ
INSERT INTO books_for_sale (book_title, book_code, price, seller_id, course_id, semester, description, condition, status) VALUES
    ('Final HCI', 'HCI-FINAL-2024', 89.00, 1, 
        (SELECT id FROM courses WHERE course_code = 'CS301'), 
        'Final', 'หนังสือสรุป Final สำหรับวิชา Human-Computer Interaction', 'ดีมาก', 'available'),
    ('Midterm Data Structures', 'DS-MID-2024', 120.00, 2, 
        (SELECT id FROM courses WHERE course_code = 'CS201'), 
        'Midterm', 'หนังสือ Data Structures และ Algorithms', 'ดี', 'available'),
    ('Database Systems Final', 'DB-FINAL-2024', 150.00, 1, 
        (SELECT id FROM courses WHERE course_code = 'CS302'), 
        'Final', 'หนังสือสรุป Database Systems', 'ดี', 'available'),
    ('Calculus I Midterm', 'MATH101-MID', 95.00, 3, 
        (SELECT id FROM courses WHERE course_code = 'MATH101'), 
        'Midterm', 'หนังสือแคลคูลัส 1', 'พอใช้', 'available'),
    ('Programming Fundamentals', 'PROG-101-2024', 110.00, 2, 
        (SELECT id FROM courses WHERE course_code = 'CS101'), 
        'Final', 'หนังสือพื้นฐานการเขียนโปรแกรม', 'ดีมาก', 'sold')
ON CONFLICT (book_code) DO NOTHING;
    
