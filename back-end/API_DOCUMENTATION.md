# Bookstore API - Authentication

API สำหรับระบบ Login/Register โดยใช้ JWT และรองรับ Multi-roles

## 🚀 การติดตั้งและรัน

### 1. ติดตั้ง Dependencies
```bash
cd back-end
go mod tidy
```

### 2. ตั้งค่า Environment Variables
แก้ไขไฟล์ `.env`:
```env
DB_HOST=db
DB_PORT=5432
DB_USER=bookstore_user
DB_PASSWORD=1234
DB_NAME=bookstore
JWT_SECRET=your-super-secret-key
PORT=8080
```

### 3. รัน Database (Docker Compose)
```bash
cd ..
docker-compose up -d
```

### 4. รัน API Server
```bash
cd back-end
go run main.go
```

Server จะรันที่: `http://localhost:8080`

---

## 📡 API Endpoints

### Public Endpoints (ไม่ต้อง login)

#### 1. Register - สมัครสมาชิก
```http
POST /api/register
Content-Type: application/json

{
  "username": "boss47",
  "email": "boss@example.com",
  "password": "password123",
  "full_name": "Boss Nattawut",
  "phone": "0812345678"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "username": "boss47",
    "email": "boss@example.com"
  }
}
```

#### 2. Login - เข้าสู่ระบบ
```http
POST /api/login
Content-Type: application/json

{
  "email": "boss@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "boss47",
      "email": "boss@example.com",
      "full_name": "Boss Nattawut",
      "phone": "0812345678",
      "is_active": true,
      "email_verified": false,
      "roles": ["user", "seller"]
    }
  }
}
```

---

### Protected Endpoints (ต้อง login)

ใช้ Header: `Authorization: Bearer <token>`

#### 3. Get Profile
```http
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "user_id": 1,
  "email": "boss@example.com",
  "roles": ["user", "seller"]
}
```

#### 4. Seller Dashboard (ต้องมี role "seller" หรือ "admin")
```http
GET /api/seller/dashboard
Authorization: Bearer <token>
```

#### 5. Admin Panel (ต้องมี role "admin" เท่านั้น)
```http
GET /api/admin/users
Authorization: Bearer <token>
```

---

## 🔐 การทำงานของระบบ Authentication

### 1. Register Flow
```
User -> POST /api/register
  ├─ ตรวจสอบ email/username ซ้ำ
  ├─ Hash password ด้วย bcrypt
  ├─ สร้าง user ใน database
  ├─ Assign role "user" (default)
  └─ Response success
```

### 2. Login Flow
```
User -> POST /api/login
  ├─ ค้นหา user จาก email
  ├─ ตรวจสอบ password
  ├─ ตรวจสอบ account active
  ├─ ดึง roles จาก user_roles table
  ├─ สร้าง JWT token (มี user_id, email, roles)
  └─ Response token + user data
```

### 3. Protected Route Flow
```
Request -> Protected Endpoint
  ├─ Middleware: AuthMiddleware
  │   ├─ ดึง token จาก Authorization header
  │   ├─ Validate JWT token
  │   ├─ ดึงข้อมูล user จาก token claims
  │   └─ Set user_id, email, roles ใน context
  │
  ├─ Middleware: RequireRole (optional)
  │   ├─ ตรวจสอบว่ามี role ที่ต้องการหรือไม่
  │   └─ Reject ถ้าไม่มี role
  │
  └─ Handler function
```

---

## 🗄️ Database Schema

ตาม `schematest.sql`:

### Tables:
- `users` - ข้อมูล user
- `roles` - ชื่อ role (user, seller, admin, moderator)
- `user_roles` - ความสัมพันธ์ระหว่าง users และ roles (many-to-many)
- `permissions` - สิทธิ์ต่างๆ (optional)
- `role_permissions` - ความสัมพันธ์ระหว่าง roles และ permissions
- `refresh_tokens` - เก็บ refresh tokens

### Default Roles:
- `user` - ผู้ใช้ทั่วไป (สามารถซื้อหนังสือ)
- `seller` - ผู้ขาย (สามารถขายหนังสือ)
- `admin` - ผู้ดูแลระบบ (มีสิทธิ์เต็ม)

---

## 🧪 ทดสอบ API ด้วย cURL

### Register:
```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (ใช้ token ที่ได้จาก login):
```bash
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 โครงสร้างโปรเจกต์

```
back-end/
├── main.go              # Entry point
├── .env                 # Environment variables
├── go.mod              # Go dependencies
├── config/
│   └── database.go     # Database connection
├── models/
│   └── user.go         # User models & DTOs
├── handlers/
│   ├── auth.go         # Login handler
│   └── register.go     # Register handler
├── middleware/
│   └── auth.go         # JWT & Role middleware
└── utils/
    ├── jwt.go          # JWT utilities
    └── password.go     # Password hashing
```

---

## 🔧 เพิ่ม Role ให้ User (ผ่าน Database)

```sql
-- 1. สร้าง role ใหม่ (ถ้ายังไม่มี)
INSERT INTO roles (name, description) 
VALUES ('seller', 'User can sell books');

-- 2. Assign role ให้ user
INSERT INTO user_roles (user_id, role_id)
VALUES (
  1,  -- user_id
  (SELECT id FROM roles WHERE name = 'seller')
);

-- 3. ตรวจสอบ roles ของ user
SELECT u.username, r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.id = 1;
```

---

## 🚨 Error Handling

API จะ return error codes ดังนี้:

- `400 Bad Request` - ข้อมูลไม่ถูกต้อง
- `401 Unauthorized` - ไม่ได้ login หรือ token ไม่ถูกต้อง
- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง (ไม่มี role ที่ต้องการ)
- `409 Conflict` - Email/Username ซ้ำ
- `500 Internal Server Error` - Database error หรือ server error

---

## 🔒 Security Features

✅ Password hashing ด้วย bcrypt  
✅ JWT token-based authentication  
✅ Role-based access control (RBAC)  
✅ Multi-role support (user สามารถมีหลาย roles)  
✅ Protected endpoints with middleware  
✅ CORS enabled  

---

## 📝 TODO / Future Improvements

- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] Password reset
- [ ] Rate limiting
- [ ] Logging
- [ ] Unit tests
- [ ] API documentation (Swagger)
