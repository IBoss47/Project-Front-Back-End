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

-- กำหนด role admin ให้กับ admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- เพิ่ม Mock Seller Account
-- Username: seller1, Password: admin123
INSERT INTO users (username, email, password_hash, fullname, phone)
VALUES ('seller1', 'seller1@noteshop.com', '$2a$10$b9cFEv4vEHJbOI45107YSuF4VEFDEubi5N8SGlXYAfBU9bVnkjGAG', 'ผู้ขายตัวอย่าง', '0811111111')
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


-- ตาราง user_roles (Many-to-Many: user สามารถมีหลาย role)
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);



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
