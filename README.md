#  HCMUTSFMS – Sport Field Management System

##  Giới thiệu
Dự án **HCMUTSFMS** là hệ thống web cho phép người dùng **đặt sân thể thao trực tuyến** (bóng đá, cầu lông, tennis, v.v.).  
Chủ sân có thể **quản lý sân, lịch đặt, doanh thu và khách hàng** dễ dàng.  
Hệ thống được xây dựng bằng **Node.js + Express + MySQL**, theo mô hình **MVC**.

---

## ⚙️ Cách chạy dự án

### 1️⃣ Cài đặt các gói cần thiết
```bash
npm install
```
### 2️⃣ Cấu hình file .env

Tạo file .env trong thư mục gốc và thêm nội dung:
```bash
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=hcmutsfms
```
3️⃣ Chạy server
```bash
npm run dev
