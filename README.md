# Hướng Dẫn Chạy Dự Án Trên Localhost

Để chạy dự án này trên máy tính cá nhân của bạn thông qua `localhost`, vui lòng thực hiện theo các bước sau:

---

## 🛠️ Các Bước Cài Đặt & Khởi Chạy

### Bước 1: Chuẩn bị môi trường máy tính

Đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Khuyên dùng phiên bản `18.x` trở lên (hoặc `20.x`, `22.x`). Tải tại: [nodejs.org](https://nodejs.org/).
- **npm**: Trình quản lý gói (tự động đi kèm khi bạn cài Node.js).

---

### Bước 2: Tải mã nguồn về máy

Sau khi bạn tải toàn bộ mã nguồn của dự án về máy tính hoặc giải nén vào một thư mục (ví dụ: `quan-ly-the-thao`), mở **Terminal / CMD** tại thư mục đó:

```bash
cd quan-ly-the-thao
```

---

### Bước 3: Cài đặt các thư viện cần thiết

Chạy lệnh sau để tải và cài đặt các thư viện phụ thuộc (`package.json`):

```bash
npm install
```

---

### Bước 4: Tạo tệp cấu hình môi trường (.env)

Dự án có sẵn tệp `.env.example`. Bạn có thể sao chép thành tệp `.env`:

- **Trên Windows (CMD / PowerShell):**
  ```powershell
  copy .env.example .env
  ```

- **Trên macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

---

### Bước 5: Khởi động máy chủ phát triển (Development Server)

Chạy lệnh sau:

```bash
npm run dev
```

Sau khi chạy lệnh, màn hình Terminal sẽ hiển thị thông báo tương tự:

```text
VITE v8.x.x ready in ... ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://...:3000/
```

---

### Bước 6: Mở ứng dụng trên trình duyệt

Mở trình duyệt web (*Chrome, Edge, Firefox, Cốc Cốc,...*) và truy cập vào địa chỉ:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 👥 Danh Sách Tài Khoản Mẫu Để Thử Nghiệm

Hệ thống đã có sẵn dữ liệu mẫu cho cả 4 vai trò *(có thanh chuyển nhanh ngay ở đầu trang)*:

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Quản trị tài khoản, tạo mới, khóa/mở khóa, xóa người dùng |
| **Ban giám hiệu** | `bgh_minh` | `bgh123` | Đổi trạng thái khu vực (hoạt động/bảo trì), thêm/bỏ sân, xuất Excel |
| **Giáo viên** | `gv_nam` | `gv123` | Đăng ký mượn sân theo tiết học (T2–T6), trả sân, quản lý lịch |
| **Học sinh** | `hs_an` *(Lớp 11A1)* | `hs123` | Đăng ký thuê sân theo giờ vào Thứ 7 & Chủ nhật |

---

## 🚀 Đóng Gói Và Chạy Bản Chính Thức (Production)

Nếu muốn đóng gói dự án thành bản web tĩnh tối ưu:

```bash
# 1. Đóng gói mã nguồn vào thư mục /dist
npm run build

# 2. Chạy thử bản đã đóng gói
npm run preview
```
