# HỆ THỐNG QUẢN LÝ KHU VỰC THỂ THAO
### Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang

---

## 1. Giới thiệu dự án
Hệ thống phần mềm quản lý nội bộ dành riêng cho **Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang** nhằm kiểm soát thời gian mượn và trả các khu vực thể thao của nhà trường bởi giáo viên bộ môn và phục vụ học sinh các khối chuyên (khối 10, 11, 12) cho mục đích học tập và rèn luyện thể chất.

### Các khu vực thể thao:
1. **Sân bóng đá**: Sân cỏ nhân tạo 7 người, hệ thống chiếu sáng ban đêm.
2. **Sân Pickleball**: Mặt sân Acrylic tiêu chuẩn thi đấu mới nhất.
3. **Sân cầu lông**: Sàn gỗ chuyên dụng trong nhà đa năng tầng 1.
4. **Khu vực chơi bóng bàn**: Phòng 4 bàn thi đấu Double Fish tầng 2.

---

## 2. Quy chế mượn & thuê khu vực
- **Từ Thứ 2 đến Thứ 6**: Giáo viên bộ môn đăng ký mượn và trả sân theo **tiết học (Tiết 1 – 5)** của **Buổi Sáng** (07:00 – 11:15) hoặc **Buổi Chiều** (13:00 – 17:15) phục vụ giảng dạy thể chất chính khóa theo từng lớp chuyên.
- **Thứ 7 & Chủ Nhật**: Học sinh các lớp chuyên (Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn) thuê và trả theo **khung giờ (giờ bắt đầu – giờ kết thúc)** để vui chơi, rèn luyện thể thao.
- **Chống trùng lịch thông minh**: Hệ thống tự động từ chối nếu khu vực đã có người đăng ký trong cùng một tiết hoặc khung giờ bị chồng lấn.
- **Ghi nhận thời điểm trả thực tế**: Khi kết thúc sử dụng, người dùng hoặc giáo viên xác nhận trả sân để hệ thống lưu chính xác mốc thời gian hoàn trả.

---

## 3. Danh sách tài khoản thử nghiệm nội bộ

| Vai trò | Tên đăng nhập | Mật khẩu | Họ và tên | Đơn vị / Lớp |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Quản Trị Viên CNTT | Tổ CNTT Nhà trường |
| **Ban giám hiệu** | `bgh_minh` | `bgh123` | Thầy Nguyễn Văn Minh | Phó Hiệu Trưởng |
| **Giáo viên** | `gv_nam` | `gv123` | Thầy Nguyễn Văn Nam | Tổ Thể dục - GDQP |
| **Giáo viên** | `gv_mai` | `gv123` | Cô Trần Thị Mai | Tổ Thể dục - GDQP |
| **Học sinh** | `hs_an` | `hs123` | Lê Văn An | Lớp 11 Toán |
| **Học sinh** | `hs_binh` | `hs123` | Phạm Thị Bình | Lớp 12 Lý |
| **Học sinh** | `hs_dung` | `hs123` | Đỗ Hoàng Dũng | Lớp 10 Tin |
| **Học sinh** | `hs_anh` | `hs123` | Nguyễn Quỳnh Anh | Lớp 11 Anh 1 |

---

## 4. Hướng dẫn cài đặt và chạy trên Localhost

### Yêu cầu hệ thống:
- Đã cài đặt **Node.js** (phiên bản 18.x hoặc 20.x, 22.x). Tải tại: [nodejs.org](https://nodejs.org/).
- Trình quản lý gói `npm`.

### Các bước khởi chạy:

1. **Mở thư mục dự án trong Terminal / Command Prompt:**
   ```bash
   cd management_system
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```
   *(Nếu hệ thống của bạn gặp cảnh báo về phiên bản peer dependency, chạy lệnh: `npm install --legacy-peer-deps`)*

3. **Khởi chạy máy chủ phát triển (Development Server):**
   ```bash
   npm run dev
   ```

4. **Truy cập ứng dụng trên trình duyệt:**
   Mở trình duyệt (Chrome, Edge, Firefox,...) và truy cập:
   👉 **`http://localhost:3000`**

---

## 5. Các tính năng nổi bật
- **Lịch thể thao tương tác**: Hiển thị lưới thời khóa biểu tiết học ngày trong tuần và timeline theo giờ cuối tuần; phân biệt rõ ô còn trống, ô đã mượn và ô đang bảo trì.
- **Đăng ký không trùng lịch**: Form đăng ký thông minh tự động nhận diện thứ trong tuần, tính phí thuê giờ cuối tuần, chọn lớp chuyên (10, 11, 12 Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn).
- **Quản lý & Hoàn trả**: Dễ dàng theo dõi lịch sử, bấm nhận sân và bấm xác nhận trả sân ghi nhận mốc thời gian thực tế.
- **Thống kê & Xuất Excel (.xlsx)**: Báo cáo theo ngày, tuần, tháng, học kỳ kèm chức năng tải file Excel đa sheet đầy đủ dữ liệu báo cáo Ban giám hiệu.
- **Quản trị người dùng (Admin)**: Cấp tài khoản, khóa / mở khóa tài khoản, phân vai trò.
- **Quản lý cơ sở vật chất (BGH)**: Cập nhật trạng thái sân (Hoạt động, Bảo trì, Ngừng dùng), điều chỉnh giá thuê, thêm hoặc bỏ sân.

---

## 6. Lệnh đóng gói xuất bản (Production Build)
```bash
# Đóng gói tối ưu hóa mã nguồn
npm run build

# Xem trước bản đã đóng gói
npm run preview
```
