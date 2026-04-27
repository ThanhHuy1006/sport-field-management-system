# HCMUT Sport Field Management System

Hệ thống quản lý và đặt sân thể thao trực tuyến, hỗ trợ người dùng tìm kiếm sân, xem lịch trống, đặt sân; hỗ trợ chủ sân quản lý sân, lịch hoạt động, đơn đặt sân; và hỗ trợ quản trị viên giám sát toàn bộ hệ thống.

> Project môn Đồ án chuyên ngành / Đồ án tốt nghiệp - HCMUT.

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu cài đặt](#yêu-cầu-cài-đặt)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Chạy project ở local](#chạy-project-ở-local)
- [Database và Prisma](#database-và-prisma)
- [Một số API chính](#một-số-api-chính)
- [Quy trình Git đề xuất](#quy-trình-git-đề-xuất)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Thành viên](#thành-viên)

## Giới thiệu

HCMUT Sport Field Management System là một nền tảng web giúp kết nối khách hàng có nhu cầu thuê sân thể thao với các chủ sân. Hệ thống tập trung giải quyết các vấn đề thường gặp khi đặt sân thủ công như trùng lịch, khó theo dõi trạng thái đặt sân, khó quản lý doanh thu và thiếu dữ liệu tập trung.

Hệ thống có 3 nhóm người dùng chính:

- **User / Customer**: tìm kiếm sân, xem chi tiết sân, đặt sân, thanh toán, xem lịch sử đặt sân.
- **Owner**: quản lý sân thuộc sở hữu, quản lý giờ hoạt động, blackout date, đơn đặt sân, báo cáo doanh thu.
- **Admin**: quản lý người dùng, duyệt chủ sân, duyệt sân, theo dõi booking, thống kê toàn hệ thống.

## Tính năng chính

### Public / Customer

- Xem trang chủ và danh sách sân.
- Tìm kiếm, lọc sân theo loại sân, khu vực, giá, trạng thái.
- Xem chi tiết sân, hình ảnh, tiện ích, địa chỉ, giá thuê.
- Xem lịch trống theo ngày và khung giờ.
- Đăng ký, đăng nhập tài khoản.
- Tạo đơn đặt sân.
- Theo dõi lịch sử đặt sân.
- Thanh toán mô phỏng bằng chuyển khoản ngân hàng hoặc thanh toán tại sân.
- Nhận thông báo liên quan đến booking và thanh toán.

### Owner

- Đăng ký hồ sơ chủ sân.
- Thêm, sửa, xem danh sách sân thuộc quyền sở hữu.
- Quản lý trạng thái sân: pending, active, hidden, maintenance.
- Quản lý giờ hoạt động theo ngày trong tuần.
- Quản lý ngày/khung giờ không hoạt động bằng blackout date.
- Xem, duyệt, từ chối đơn đặt sân.
- Theo dõi doanh thu và báo cáo theo sân.
- Quản lý đánh giá và phản hồi khách hàng.

### Admin

- Quản lý tài khoản người dùng.
- Khóa, mở khóa hoặc xóa tài khoản.
- Duyệt hoặc từ chối hồ sơ chủ sân.
- Duyệt, ẩn hoặc theo dõi sân trong hệ thống.
- Theo dõi toàn bộ đơn đặt sân.
- Theo dõi giao dịch thanh toán.
- Xem báo cáo tổng hợp.
- Ghi nhận lịch sử hành động quản trị.

## Công nghệ sử dụng

### Frontend

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI**
- **Lucide React**
- **React Hook Form**
- **Zod**
- **Recharts**
- **Sonner**

### Backend

- **Node.js**
- **Express.js**
- **JavaScript ESM**
- **Prisma ORM 6**
- **MySQL**
- **JWT Authentication**
- **Bcrypt**
- **Multer**

### Tools

- **Git / GitHub**
- **Postman**
- **Vercel** cho frontend
- **Railway / Render / VPS** cho backend và database nếu triển khai production

## Kiến trúc tổng quan

Project được tổ chức theo hướng **Modular Monolith**. Backend là một ứng dụng Express thống nhất, nhưng các nghiệp vụ được chia thành từng module riêng biệt.

Luồng xử lý tổng quát:

```txt
Frontend Next.js
   ↓ gọi API qua api-client.ts
Backend Express /api/v1
   ↓ route
Middleware: auth, role, validate, logger, error handler
   ↓ controller
Service / Policy / Mapper
   ↓
Prisma ORM
   ↓
MySQL Database
```

Các module backend chính:

- `auth`: đăng ký, đăng nhập, xác thực token.
- `users`: quản lý người dùng.
- `owners`: hồ sơ chủ sân và duyệt owner.
- `fields`: quản lý sân.
- `schedules`: lịch hoạt động, availability, blackout.
- `bookings`: tạo và xử lý đơn đặt sân.
- `payments`: thanh toán và trạng thái giao dịch.
- `notifications`: thông báo hệ thống.
- `reviews`: đánh giá sân.
- `reports`: báo cáo doanh thu/thống kê.
- `admin`: chức năng quản trị.
- `vouchers`: mã giảm giá.
- `uploads`: upload hình ảnh/giấy tờ.

## Cấu trúc thư mục

```txt
sport-field-management-system/
├── DoAnTotNghiep/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── core/
│   │   │   │   └── middlewares/
│   │   │   ├── jobs/
│   │   │   ├── modules/
│   │   │   │   ├── admin/
│   │   │   │   ├── audit-logs/
│   │   │   │   ├── auth/
│   │   │   │   ├── bookings/
│   │   │   │   ├── fields/
│   │   │   │   ├── notifications/
│   │   │   │   ├── owners/
│   │   │   │   ├── payments/
│   │   │   │   ├── reports/
│   │   │   │   ├── reviews/
│   │   │   │   ├── schedules/
│   │   │   │   ├── sport-types/
│   │   │   │   ├── time-slots/
│   │   │   │   ├── uploads/
│   │   │   │   ├── users/
│   │   │   │   └── vouchers/
│   │   │   ├── routes/
│   │   │   ├── app.js
│   │   │   └── server.js
│   │   └── package.json
│   │
│   └── frontend/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── lib/
│       │   └── api-client.ts
│       ├── public/
│       ├── styles/
│       ├── types/
│       └── package.json
│
├── .gitignore
└── README.md
```

## Yêu cầu cài đặt

Cần cài trước:

- Node.js >= 20
- npm >= 10
- MySQL >= 8
- Git
- Postman hoặc Thunder Client để test API

Kiểm tra version:

```bash
node -v
npm -v
mysql --version
```

## Cấu hình môi trường

### Backend `.env`

Tạo file:

```txt
DoAnTotNghiep/backend/.env
```

Nội dung mẫu:

```env
PORT=8080
DATABASE_URL="mysql://root:your_password@localhost:3306/sfms_db"
JWT_SECRET="change-this-secret-in-production"
JWT_EXPIRES_IN="7d"
```

Trong đó:

- `PORT`: cổng chạy backend.
- `DATABASE_URL`: chuỗi kết nối MySQL cho Prisma.
- `JWT_SECRET`: khóa bí mật để ký access token.
- `JWT_EXPIRES_IN`: thời gian hết hạn token.

### Frontend `.env.local`

Tạo file:

```txt
DoAnTotNghiep/frontend/.env.local
```

Nội dung mẫu:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api/v1"
```

Biến này phải trỏ đúng về backend. Nếu backend deploy online thì thay bằng URL backend production.

## Chạy project ở local

### 1. Clone project

```bash
git clone https://github.com/ThanhHuy1006/sport-field-management-system.git
cd sport-field-management-system
```

### 2. Chạy backend

```bash
cd DoAnTotNghiep/backend
npm install
```

Tạo database MySQL:

```sql
CREATE DATABASE sfms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Generate Prisma Client:

```bash
npx prisma generate
```

Chạy migration:

```bash
npx prisma migrate deploy
```

Nếu đang ở môi trường dev và chưa có migration phù hợp, có thể dùng:

```bash
npx prisma db push
```

Seed dữ liệu mẫu:

```bash
npm run seed
```

Chạy backend:

```bash
npm run dev
```

Backend mặc định chạy tại:

```txt
http://localhost:8080
```

Health check:

```txt
GET http://localhost:8080/health
GET http://localhost:8080/health/live
GET http://localhost:8080/health/ready
```

### 3. Chạy frontend

Mở terminal mới:

```bash
cd DoAnTotNghiep/frontend
npm install
npm run dev
```

Frontend mặc định chạy tại:

```txt
http://localhost:3000
```

## Database và Prisma

Các bảng/nghiệp vụ chính trong database:

- `users`: tài khoản người dùng.
- `owner_profiles`: hồ sơ chủ sân.
- `fields`: thông tin sân thể thao.
- `field_images`: hình ảnh sân.
- `facilities`, `field_facilities`: tiện ích sân.
- `operating_hours`: giờ hoạt động theo ngày trong tuần.
- `blackout_dates`: ngày/khung giờ sân không hoạt động.
- `bookings`: đơn đặt sân.
- `booking_status_history`: lịch sử thay đổi trạng thái booking.
- `payments`: giao dịch thanh toán.
- `refunds`: hoàn tiền.
- `reviews`: đánh giá sân.
- `notifications`: thông báo.
- `vouchers`, `user_vouchers`: mã giảm giá.
- `reports_daily`: báo cáo ngày.
- `admin_actions`: lịch sử hành động admin.
- `system_policies`: chính sách hệ thống.

Một số lệnh Prisma thường dùng:

```bash
# Generate Prisma Client
npx prisma generate

# Tạo migration mới trong quá trình dev
npx prisma migrate dev --name init

# Apply migration trên production/server
npx prisma migrate deploy

# Đồng bộ schema nhanh trong dev
npx prisma db push

# Mở giao diện xem DB
npx prisma studio
```

## Một số API chính

Base URL backend:

```txt
http://localhost:8080/api/v1
```

Một số nhóm API thường dùng:

```txt
POST   /auth/register
POST   /auth/login
GET    /fields
GET    /fields/:fieldId
GET    /fields/:fieldId/availability
POST   /bookings
GET    /bookings/my
GET    /owner/fields
POST   /owner/fields
PUT    /owner/fields/:fieldId
GET    /owner/schedule
GET    /admin/users
GET    /admin/fields
GET    /admin/schedule
```

Lưu ý: tên endpoint cụ thể có thể thay đổi theo file route hiện tại. Khi test, nên kiểm tra trực tiếp trong `backend/src/routes/index.js` và các route của từng module.

## Quy trình Git đề xuất

Không code trực tiếp trên `main`. Mỗi chức năng nên tách branch riêng:

```bash
git checkout main
git pull origin main
git checkout -b feat/owner-field-crud
```

Sau khi code:

```bash
git status
git add .
git commit -m "feat(owner): implement field CRUD"
git push origin feat/owner-field-crud
```

Sau đó tạo Pull Request vào `main`.

Một số prefix commit nên dùng:

```txt
feat: thêm chức năng mới
fix: sửa lỗi
refactor: chỉnh code không đổi nghiệp vụ
style: chỉnh giao diện/format
chore: cấu hình, cài package, update README
docs: tài liệu
```

Ví dụ commit cho README:

```bash
git add README.md
git commit -m "docs: add project README"
git push origin main
```

Nếu đang làm theo branch:

```bash
git checkout -b docs/project-readme
git add README.md
git commit -m "docs: add project README"
git push origin docs/project-readme
```

## Troubleshooting

### 1. Frontend gọi API không được

Kiểm tra file:

```txt
DoAnTotNghiep/frontend/.env.local
```

Đảm bảo biến sau đúng URL backend:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api/v1"
```

Sau khi sửa `.env.local`, cần tắt và chạy lại frontend:

```bash
npm run dev
```

### 2. Backend báo lỗi `DATABASE_URL`

Kiểm tra file:

```txt
DoAnTotNghiep/backend/.env
```

Đảm bảo có:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/sfms_db"
```

Sau đó chạy lại:

```bash
npx prisma generate
npm run dev
```

### 3. Prisma Client chưa generate

Chạy:

```bash
cd DoAnTotNghiep/backend
npx prisma generate
```

### 4. Lỗi CORS khi frontend gọi backend

Backend đang dùng `cors()`. Nếu deploy production, nên cấu hình lại CORS chỉ cho phép domain frontend chính thức thay vì mở toàn bộ.

### 5. Login thành công nhưng frontend chưa đổi trạng thái

Kiểm tra:

- Token đã lưu vào `localStorage` chưa.
- Header có gửi `Authorization: Bearer <token>` chưa.
- Component header/navbar có đọc lại trạng thái auth sau khi login chưa.
- Có cần refresh lại user profile từ API `/auth/me` hoặc endpoint tương đương không.

## Roadmap

Các chức năng nên tiếp tục hoàn thiện:

- Hoàn thiện CRUD sân cho Owner.
- Hoàn thiện schedule/availability theo giờ hoạt động và blackout date.
- Hoàn thiện booking transaction để tránh trùng lịch.
- Hoàn thiện payment mode: onsite, bank transfer, online gateway.
- Hoàn thiện owner approval và field approval.
- Hoàn thiện dashboard report cho Owner/Admin.
- Thêm notification real-time hoặc polling.
- Thêm test case Postman theo từng module.
- Chuẩn hóa error response và API documentation.
- Tối ưu bảo mật khi deploy production.

## Thành viên

- Đặng Thanh Huy
- Trần Khôi

## License

Project phục vụ học tập và báo cáo đồ án. Chưa khai báo giấy phép thương mại.
