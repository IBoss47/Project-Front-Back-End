-- ตาราง users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fullname VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
	id SERIAL PRIMARY KEY,
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(255) NOT NULL,
	year VARCHAR(20) NOT NULL,
	major VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS notes_for_sale (
	id SERIAL PRIMARY KEY,
    course_id INTEGER,
    seller_id INTEGER NOT NULL,
	book_title VARCHAR(255) NOT NULL,
	price DECIMAL(10,2) NOT NULL,
	exam_term VARCHAR(20),
	description TEXT,
	status VARCHAR(20) DEFAULT 'available',
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pdf_file TEXT NOT NULL,
	FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS note_images (
    id SERIAL PRIMARY KEY,
    note_id INTEGER NOT NULL,
    image_order INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes_for_sale(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS buyed_note (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    note_id INTEGER NOT NULL,
    review TEXT NOT NULL,
    is_liked BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes_for_sale(id) ON DELETE CASCADE
);

-- ตารางตะกร้าสินค้า (cart) - รวมกับ cart_items
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    note_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes_for_sale(id) ON DELETE CASCADE,
    UNIQUE(user_id, note_id)
);

-- ตาราง roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE     -- 'user', 'seller', 'admin', 'moderator'
);

INSERT INTO roles(name) VALUES('user'),('seller'),('admin') ON CONFLICT (name) DO NOTHING;

-- เพิ่ม Mock Admin Account
-- Username: admin, Password: admin123
INSERT INTO users (username, email, password_hash, fullname, phone)
VALUES ('admin', 'admin@noteshop.com', '$2a$10$b9cFEv4vEHJbOI45107YSuF4VEFDEubi5N8SGlXYAfBU9bVnkjGAG', 'Administrator', '0800000000')
ON CONFLICT (username) DO NOTHING;

-- ตาราง user_roles (Many-to-Many: user สามารถมีหลาย role)
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

-- กำหนด role admin ให้กับ admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- เพิ่ม Mock Seller Account
-- Username: seller1, Password: seller
INSERT INTO users (username, email, password_hash, fullname, phone)
VALUES ('seller1', 'seller1@noteshop.com', '$2a$10$xvZ4qY8KFQxQZ9X5gF5mHO5b5Z4K4vT6YZ0XZ5K4vT6YZ0XZ5K4vT6', 'ผู้ขายคนที่ 1', '0811111111')
ON CONFLICT (username) DO NOTHING;

-- เพิ่ม Mock Seller2 Account  
-- Username: seller2, Password: seller
INSERT INTO users (username, email, password_hash, fullname, phone)
VALUES ('seller2', 'seller2@noteshop.com', '$2a$10$xvZ4qY8KFQxQZ9X5gF5mHO5b5Z4K4vT6YZ0XZ5K4vT6YZ0XZ5K4vT6', 'ผู้ขายคนที่ 2', '0822222222')
ON CONFLICT (username) DO NOTHING;

-- เพิ่ม Mock Seller3 Account
-- Username: seller3, Password: seller  
INSERT INTO users (username, email, password_hash, fullname, phone)
VALUES ('seller3', 'seller3@noteshop.com', '$2a$10$xvZ4qY8KFQxQZ9X5gF5mHO5b5Z4K4vT6YZ0XZ5K4vT6YZ0XZ5K4vT6', 'ผู้ขายคนที่ 3', '0833333333')
ON CONFLICT (username) DO NOTHING;

-- กำหนด role seller ให้กับ seller1 user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'seller1' AND r.name = 'seller'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- กำหนด role user ให้กับ seller1 ด้วย
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'seller1' AND r.name = 'user'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- กำหนด role seller ให้กับ seller2 user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'seller2' AND r.name = 'seller'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- กำหนด role user ให้กับ seller2 ด้วย
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'seller2' AND r.name = 'user'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- กำหนด role seller ให้กับ seller3 user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'seller3' AND r.name = 'seller'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- กำหนด role user ให้กับ seller3 ด้วย
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'seller3' AND r.name = 'user'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Insert ข้อมูล courses สำหรับคณะวิทยาศาสตร์ 5 สาขา (IT, CS, คณิตศาสตร์, ฟิสิกส์, เคมี)
-- แต่ละสาขามี 4 ชั้นปี และแต่ละปีมี 5 วิชา

-- สาขาเทคโนโลยีสารสนเทศ (IT)
INSERT INTO courses (code, name, year, major) VALUES
-- ปี 1
('IT101', 'การเขียนโปรแกรมเบื้องต้น', '1', 'เทคโนโลยีสารสนเทศ'),
('IT102', 'คณิตศาสตร์สำหรับเทคโนโลยีสารสนเทศ', '1', 'เทคโนโลยีสารสนเทศ'),
('IT103', 'พื้นฐานระบบคอมพิวเตอร์', '1', 'เทคโนโลยีสารสนเทศ'),
('IT104', 'โครงสร้างข้อมูลพื้นฐาน', '1', 'เทคโนโลยีสารสนเทศ'),
('IT105', 'องค์ประกอบและการออกแบบเว็บไซต์', '1', 'เทคโนโลยีสารสนเทศ'),
-- ปี 2
('IT201', 'โครงสร้างข้อมูลและอัลกอริทึม', '2', 'เทคโนโลยีสารสนเทศ'),
('IT202', 'การเขียนโปรแกรมเชิงวัตถุ', '2', 'เทคโนโลยีสารสนเทศ'),
('IT203', 'ฐานข้อมูล', '2', 'เทคโนโลยีสารสนเทศ'),
('IT204', 'การพัฒนาเว็บแอปพลิเคชัน', '2', 'เทคโนโลยีสารสนเทศ'),
('IT205', 'ระบบปฏิบัติการ', '2', 'เทคโนโลยีสารสนเทศ'),
-- ปี 3
('IT301', 'วิศวกรรมซอฟต์แวร์', '3', 'เทคโนโลยีสารสนเทศ'),
('IT302', 'เครือข่ายคอมพิวเตอร์', '3', 'เทคโนโลยีสารสนเทศ'),
('IT303', 'ความมั่นคงปลอดภัยของระบบสารสนเทศ', '3', 'เทคโนโลยีสารสนเทศ'),
('IT304', 'การพัฒนาแอปพลิเคชันมือถือ', '3', 'เทคโนโลยีสารสนเทศ'),
('IT305', 'การจัดการโครงการไอที', '3', 'เทคโนโลยีสารสนเทศ'),
-- ปี 4
('IT401', 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง', '4', 'เทคโนโลยีสารสนเทศ'),
('IT402', 'คลาวด์คอมพิวติ้ง', '4', 'เทคโนโลยีสารสนเทศ'),
('IT403', 'การวิเคราะห์ข้อมูลขนาดใหญ่', '4', 'เทคโนโลยีสารสนเทศ'),
('IT404', 'โครงงานพัฒนาระบบสารสนเทศ', '4', 'เทคโนโลยีสารสนเทศ'),
('IT405', 'จริยธรรมและกฎหมายไอที', '4', 'เทคโนโลยีสารสนเทศ')
ON CONFLICT (code) DO NOTHING;

-- สาขาวิทยาการคอมพิวเตอร์ (CS)
INSERT INTO courses (code, name, year, major) VALUES
-- ปี 1
('CS101', 'หลักการเขียนโปรแกรม', '1', 'วิทยาการคอมพิวเตอร์'),
('CS102', 'แคลคูลัสสำหรับวิทยาการคอมพิวเตอร์', '1', 'วิทยาการคอมพิวเตอร์'),
('CS103', 'คณิตศาสตร์แบบดิสครีต', '1', 'วิทยาการคอมพิวเตอร์'),
('CS104', 'การออกแบบเว็บเพจ', '1', 'วิทยาการคอมพิวเตอร์'),
('CS105', 'พื้นฐานวิศวกรรมคอมพิวเตอร์', '1', 'วิทยาการคอมพิวเตอร์'),
-- ปี 2
('CS201', 'โครงสร้างข้อมูล', '2', 'วิทยาการคอมพิวเตอร์'),
('CS202', 'การออกแบบและวิเคราะห์อัลกอริทึม', '2', 'วิทยาการคอมพิวเตอร์'),
('CS203', 'ระบบฐานข้อมูล', '2', 'วิทยาการคอมพิวเตอร์'),
('CS204', 'สถาปัตยกรรมคอมพิวเตอร์', '2', 'วิทยาการคอมพิวเตอร์'),
('CS205', 'การเขียนโปรแกรมเชิงวัตถุขั้นสูง', '2', 'วิทยาการคอมพิวเตอร์'),
-- ปี 3
('CS301', 'ทฤษฎีการคำนวณ', '3', 'วิทยาการคอมพิวเตอร์'),
('CS302', 'ระบบปฏิบัติการขั้นสูง', '3', 'วิทยาการคอมพิวเตอร์'),
('CS303', 'คอมไพเลอร์', '3', 'วิทยาการคอมพิวเตอร์'),
('CS304', 'ปัญญาประดิษฐ์', '3', 'วิทยาการคอมพิวเตอร์'),
('CS305', 'การประมวลผลภาพและการมองเห็นของคอมพิวเตอร์', '3', 'วิทยาการคอมพิวเตอร์'),
-- ปี 4
('CS401', 'การเรียนรู้เชิงลึก', '4', 'วิทยาการคอมพิวเตอร์'),
('CS402', 'การประมวลผลภาษาธรรมชาติ', '4', 'วิทยาการคอมพิวเตอร์'),
('CS403', 'การคำนวณควอนตัม', '4', 'วิทยาการคอมพิวเตอร์'),
('CS404', 'โครงงานวิจัยวิทยาการคอมพิวเตอร์', '4', 'วิทยาการคอมพิวเตอร์'),
('CS405', 'หัวข้อพิเศษในวิทยาการคอมพิวเตอร์', '4', 'วิทยาการคอมพิวเตอร์')
ON CONFLICT (code) DO NOTHING;

-- Insert ข้อมูล notes_for_sale (30 รายการ)
INSERT INTO notes_for_sale (course_id, seller_id, book_title, price, exam_term, description, pdf_file, status) VALUES
-- Seller 1 (10 notes)
(1, 2, 'สรุปการเขียนโปรแกรมเบื้องต้น ฉบับสมบูรณ์', 150.00, 'กลางภาค', 'โน้ตสรุปเนื้อหาทั้งหมด มีตัวอย่างโค้ด และแบบฝึกหัดพร้อมเฉลย สภาพใหม่ 95%', './uploads/pdfs/note1.pdf', 'available'),
(2, 2, 'คณิตศาสตร์ไอที บทที่ 1-5', 120.00, 'ปลายภาค', 'สรุปสูตรและแนวข้อสอบ มีเทคนิคการคำนวณที่ใช้ได้จริง', './uploads/pdfs/note2.pdf', 'available'),
(5, 2, 'การออกแบบเว็บไซต์ + Workshop', 200.00, 'กลางภาค', 'โน้ตพร้อม source code โปรเจค มี responsive design ครบ', './uploads/pdfs/note3.pdf', 'available'),
(6, 2, 'โครงสร้างข้อมูลและอัลกอริทึม เล่ม 1', 180.00, 'กลางภาค', 'อธิบายละเอียด Big O, Array, Linked List, Stack, Queue พร้อมภาพประกอบ', './uploads/pdfs/note4.pdf', 'available'),
(8, 2, 'ฐานข้อมูล SQL Complete Guide', 220.00, 'ปลายภาค', 'ครอบคลุมทั้ง SQL, NoSQL, Normalization และ ERD มีแบบฝึกหัดเยอะ', './uploads/pdfs/note5.pdf', 'available'),
(11, 2, 'วิศวกรรมซอฟต์แวร์ Design Pattern', 250.00, 'กลางภาค', 'สรุป Design Patterns ทั้งหมด มีตัวอย่างจริง UML Diagrams ครบ', './uploads/pdfs/note6.pdf', 'available'),
(21, 2, 'หลักการเขียนโปรแกรม Python', 130.00, 'กลางภาค', 'เริ่มต้นจนถึงขั้นสูง มีโค้ดตัวอย่างเยอะมาก', './uploads/pdfs/note7.pdf', 'available'),
(23, 2, 'คณิตศาสตร์แบบดิสครีต สรุปย่อ', 140.00, 'ปลายภาค', 'Logic, Set Theory, Graph Theory อธิบายง่ายๆ', './uploads/pdfs/note8.pdf', 'available'),
(26, 2, 'อัลกอริทึมขั้นสูง สรุปเข้มข้น', 280.00, 'ปลายภาค', 'Dynamic Programming, Greedy, Divide and Conquer มีโจทย์แนวข้อสอบ', './uploads/pdfs/note9.pdf', 'available'),
(31, 2, 'ทฤษฎีการคำนวณ Theory', 160.00, 'กลางภาค', 'Automata, Turing Machine, Complexity Theory สรุปกระชับ', './uploads/pdfs/note10.pdf', 'available'),

-- Seller 2 (10 notes)
(3, 3, 'พื้นฐานระบบคอมพิวเตอร์ ฉบับสมบูรณ์', 145.00, 'กลางภาค', 'สรุป CPU, Memory, I/O Systems มีภาพประกอบสวยงาม', './uploads/pdfs/note11.pdf', 'available'),
(7, 3, 'OOP กับ Java เต็มเล่ม', 190.00, 'ปลายภาค', 'Inheritance, Polymorphism, Encapsulation มีโปรเจคตัวอย่าง', './uploads/pdfs/note12.pdf', 'available'),
(10, 3, 'ระบบปฏิบัติการ OS Concepts', 210.00, 'กลางภาค', 'Process, Thread, Memory Management, File Systems ครบทุกบท', './uploads/pdfs/note13.pdf', 'available'),
(12, 3, 'เครือข่ายคอมพิวเตอร์ Network+', 230.00, 'ปลายภาค', 'OSI Model, TCP/IP, Routing, Switching สรุปดีมาก', './uploads/pdfs/note14.pdf', 'available'),
(14, 3, 'Mobile App Development Flutter', 270.00, 'กลางภาค', 'สอน Flutter ตั้งแต่เริ่มต้น มี source code โปรเจคจริง', './uploads/pdfs/note15.pdf', 'available'),
(16, 3, 'AI และ Machine Learning Intro', 300.00, 'ปลายภาค', 'Neural Networks, supervised/unsupervised learning มีตัวอย่าง Python', './uploads/pdfs/note16.pdf', 'available'),
(22, 3, 'แคลคูลัสสำหรับ CS เล่ม 1', 135.00, 'กลางภาค', 'Limit, Derivative, Integration สำหรับคอมพิวเตอร์', './uploads/pdfs/note17.pdf', 'available'),
(28, 3, 'สถาปัตยกรรมคอมพิวเตอร์ ฉบับย่อ', 175.00, 'กลางภาค', 'CPU Architecture, Pipelining, Cache Memory', './uploads/pdfs/note18.pdf', 'available'),
(34, 3, 'ปัญญาประดิษฐ์ AI Advanced', 290.00, 'ปลายภาค', 'Deep Learning, CNN, RNN, Transformer มีโค้ดทุก algorithm', './uploads/pdfs/note19.pdf', 'available'),
(36, 3, 'การเรียนรู้เชิงลึก Deep Learning', 320.00, 'กลางภาค', 'TensorFlow, PyTorch มีโปรเจคจริง state-of-the-art models', './uploads/pdfs/note20.pdf', 'available'),

-- Seller 3 (10 notes)
(4, 4, 'โครงสร้างข้อมูลพื้นฐาน ฉบับมือใหม่', 125.00, 'กลางภาค', 'เข้าใจง่าย มีภาพประกอบเยอะ Array, List, Tree', './uploads/pdfs/note21.pdf', 'available'),
(9, 4, 'การพัฒนาเว็บแอปพลิเคชัน Full Stack', 240.00, 'ปลายภาค', 'React + Node.js + MongoDB มี project ตัวอย่างครบ', './uploads/pdfs/note22.pdf', 'available'),
(13, 4, 'ความมั่นคงปลอดภัยไอที Security+', 260.00, 'กลางภาค', 'Cryptography, Network Security, Ethical Hacking basics', './uploads/pdfs/note23.pdf', 'available'),
(15, 4, 'การจัดการโครงการไอที PM Guide', 195.00, 'ปลายภาค', 'Agile, Scrum, Project Planning มีเทคนิคการทำงานจริง', './uploads/pdfs/note24.pdf', 'available'),
(17, 4, 'Cloud Computing AWS & Azure', 310.00, 'กลางภาค', 'สรุปทั้ง AWS และ Azure พร้อม hands-on labs', './uploads/pdfs/note25.pdf', 'available'),
(19, 4, 'โครงงานระบบสารสนเทศ Capstone', 280.00, 'ปลายภาค', 'แนวทางการทำโครงงาน documentation ครบถ้วน', './uploads/pdfs/note26.pdf', 'available'),
(24, 4, 'การออกแบบเว็บเพจ UI/UX', 155.00, 'กลางภาค', 'Figma, Adobe XD มีตัวอย่างการออกแบบ', './uploads/pdfs/note27.pdf', 'available'),
(27, 4, 'ระบบฐานข้อมูล Database Design', 205.00, 'ปลายภาค', 'ERD, Normalization, SQL Optimization', './uploads/pdfs/note28.pdf', 'available'),
(32, 4, 'ระบบปฏิบัติการขั้นสูง Advanced OS', 245.00, 'กลางภาค', 'Kernel, Scheduling algorithms, Virtual Memory', './uploads/pdfs/note29.pdf', 'available'),
(38, 4, 'การคำนวณควอนตัม Quantum Computing', 350.00, 'กลางภาค', 'Quantum Gates, Algorithms เข้าใจง่าย มีตัวอย่างโค้ด', './uploads/pdfs/note30.pdf', 'available')
ON CONFLICT DO NOTHING;





-- ตาราง refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);




-- -- Indexes
-- CREATE INDEX idx_user_roles_user ON user_roles(user_id);
-- CREATE INDEX idx_user_roles_role ON user_roles(role_id);
-- CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
-- CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
