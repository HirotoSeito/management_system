# HỆ THỐNG QUẢN LÝ KHU VỰC THỂ THAO
### Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang

---

## 1. Tên dự án
**Hệ thống quản lý khu vực thể thao của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.**

## 2. Mục đích
Kiểm soát thời gian mượn và trả các khu vực thể thao của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang bởi giáo viên bộ môn và phục vụ học sinh của trường trong mục đích học tập và giải trí. Qua đó giúp quản lý và sử dụng hiệu quả các khu vực thể thao của nhà trường.

## 3. Mô tả bài toán
Mỗi người dùng khi được cung cấp tài khoản web có thể đăng ký được những khu vực có thể mượn hoặc thuê. Hệ thống chỉ áp dụng cho Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang; người dùng gồm người quản trị, Ban giám hiệu, giáo viên, học sinh của trường (khối 10, 11, 12; mỗi khối gồm các lớp Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn) và nhân viên Bảo vệ trường. 

Nhà trường có các khu vực thể thao gồm:
- **Sân bóng đá**: Sân cỏ nhân tạo 7 người, hệ thống chiếu sáng ban đêm.
- **Sân Pickleball**: Mặt sân sơn Acrylic tiêu chuẩn thi đấu.
- **Sân cầu lông**: Sàn gỗ chuyên dụng trong nhà đa năng tầng 1.
- **Khu vực chơi bóng bàn**: Phòng 4 bàn thi đấu Double Fish tầng 2.

**Quy tắc vận hành theo thời gian:**
- **Từ thứ 2 đến thứ 6**: Giáo viên bộ môn mượn và trả khu vực theo tiết học (Tiết 1 – 5, Sáng 07:00 - 11:15, Chiều 13:00 - 17:15) để dạy học chính khóa. Học sinh không được đại diện đăng ký theo tiết trong tuần.
- **Vào thứ 7 và Chủ nhật**: Học sinh thuê và trả khu vực theo giờ để vui chơi, giải trí (khung giờ quy định: Sáng 07:00 – 10:00, Chiều 13:00 – 16:30).
- **Kiểm soát thời gian thực**: Hiển thị đồng hồ thời gian thực (Live clock). Các tiết học hoặc khung giờ đã trôi qua trong quá khứ so với thời điểm hiện tại sẽ bị khóa, không cho phép đăng ký.
- **Tìm kiếm người đại diện kiểu Google**: Khi đăng ký, người dùng nhập tên/username hoặc lớp của học sinh đại diện; hệ thống tự động kiểm tra và gợi ý trực tiếp (autocomplete), đồng thời tự động điền lớp học sinh, loại bỏ thao tác chọn lớp thủ công.
- **Bảo vệ trực cổng**: Quản lý học sinh vào trường cuối tuần, check-in mở cổng vào sân, thu tiền mặt trực tiếp tại trường, kiểm tra tình trạng cơ sở vật chất và xác nhận nhận lại sân.

---

## 4. Các chức năng trong dự án
1. **Hiển thị thời gian thực & Lịch thể thao**:
   - Đồng hồ thời gian thực hệ thống (giờ, phút, giây, thứ, ngày, tháng, năm).
   - Hiển thị ma trận thời khóa biểu theo ngày: phân biệt rõ ô còn trống, ô đã có người mượn, ô đang bảo trì và các khung giờ **đã qua giờ**.
2. **Đăng ký mượn / thuê khu vực**:
   - Phân quyền chặt chẽ: Giáo viên mượn theo tiết trong tuần; Học sinh chỉ thuê theo giờ cuối tuần (Sáng 07:00 – 10:00, Chiều 13:00 – 16:30).
   - Thanh tìm kiếm người đại diện thông minh dạng Google autocomplete.
   - Chặn tuyệt đối trùng lịch và chặn đăng ký lùi về thời gian quá khứ.
3. **Quản lý lịch cá nhân, chỉnh sửa, hủy và trả sân**:
   - Người dùng xem lịch của mình, hủy lịch chưa sử dụng, bấm xác nhận trả sân ghi nhận mốc thời gian thực tế.
4. **Bảng điều khiển Ca trực Bảo vệ**:
   - Theo dõi các ca mượn sân hôm nay tại trường.
   - Thao tác check-in mở cổng cho học sinh/giáo viên nhận sân.
   - Thu tiền thuê trực tiếp bằng tiền mặt tại cổng trường (ghi nhận đã thu, số tiền, người thu).
   - Kiểm tra tình trạng thiết bị (vợt, lưới, bóng, đèn) và ghi chú hoàn trả sân.
5. **Thống kê & Xuất Excel (.xlsx)**:
   - Thống kê theo ngày, tuần, tháng, học kỳ theo từng khu vực và từng người dùng (số lượt, thời gian, doanh thu).
   - Xuất dữ liệu thống kê ra file Excel đa sheet chuẩn đẹp.
6. **Quản trị người dùng & Phân quyền (Admin)**:
   - Cấp tài khoản mới, phân quyền: Quản trị viên, Ban giám hiệu, Giáo viên, Học sinh, Bảo vệ.
   - Khóa / mở khóa tài khoản, xóa tài khoản.
   - **Nhập hàng loạt tài khoản từ file Excel (.xlsx)** kèm tính năng tải file Excel mẫu và kiểm tra lỗi dữ liệu.
   - Xuất danh sách tài khoản toàn trường ra Excel.
7. **Quản lý cơ sở vật chất (Ban giám hiệu)**:
   - Thay đổi trạng thái khu vực (hoạt động, bảo trì, ngừng sử dụng).
   - Điều chỉnh giá thuê mỗi giờ, thêm khu vực mới, bỏ khu vực hiện có.

---

## 5. Cơ sở dữ liệu

### Bảng `nguoiDung`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã người dùng |
| 2 | `tenDangNhap` | | Tên đăng nhập (duy nhất) |
| 3 | `idVaiTro` | Khóa ngoại | Liên kết đến `vaiTro` |
| 4 | `matKhau` | | Mật khẩu tài khoản |
| 5 | `hoTen` | | Họ và tên người dùng |
| 6 | `lop` | | Lớp của học sinh (khối 10, 11, 12 chuyên); để trống với vai trò khác |
| 7 | `trangThai` | | Trạng thái tài khoản (hoạt động, bị khóa) |
| 8 | `ngayTao` | | Ngày tạo tài khoản (dd/mm/yyyy) |

### Bảng `vaiTro`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã vai trò (`admin`, `bgh`, `giao_vien`, `hoc_sinh`, `bao_ve`) |
| 2 | `tenVaiTro` | | Tên vai trò (Quản trị viên, Ban giám hiệu, Giáo viên, Học sinh, Bảo vệ) |

### Bảng `khuVuc`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã khu vực |
| 2 | `tenKhuVuc` | | Tên khu vực (sân bóng đá, sân Pickleball, sân cầu lông, khu vực bóng bàn) |
| 3 | `giaThueGio` | | Giá thuê mỗi giờ dành cho học sinh vào thứ 7, CN (đồng) |
| 4 | `trangThai` | | Trạng thái khu vực (hoạt động, bảo trì, ngừng sử dụng) |

### Bảng `dangKy`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã lượt đăng ký |
| 2 | `idNguoiDung` | Khóa ngoại | Liên kết đến `nguoiDung` (người tạo đăng ký) |
| 3 | `idKhuVuc` | Khóa ngoại | Liên kết đến `khuVuc` (khu vực được đăng ký) |
| 4 | `ngaySuDung` | | Ngày sử dụng (dd/mm/yyyy) |
| 5 | `thu` | | Thứ trong tuần (Thứ 2, 3, 4, 5, 6, 7, Chủ nhật) |
| 6 | `buoi` | | Buổi (sáng, chiều) |
| 7 | `tiet` | | Tiết học (1, 2, 3, 4, 5) dành cho giáo viên T2 - T6 |
| 8 | `lop` | | Lớp sử dụng (tự động nhận từ học sinh đại diện) |
| 9 | `nguoiDaiDienTen` | | Tên người/học sinh đại diện đăng ký (Google autocomplete) |
| 10 | `gioBatDau` | | Giờ bắt đầu dành cho học sinh thuê T7, CN (07:00–10:00 hoặc 13:00–16:30) |
| 11 | `gioKetThuc` | | Giờ kết thúc dành cho học sinh thuê T7, CN |
| 12 | `trangThai` | | Trạng thái đăng ký (đã đăng ký, đang sử dụng, đã trả, đã hủy) |
| 13 | `thoiGianTra` | | Thời điểm thực tế trả khu vực |
| 14 | `thoiGianNhanSan` | | Thời điểm bảo vệ mở cổng cho nhận sân |
| 15 | `daThuTien` | | Bảo vệ đã thu tiền mặt trực tiếp tại trường |
| 16 | `nguoiThuTien` | | Tên bảo vệ xác nhận thu tiền |
| 17 | `ghiChuBaoVe` | | Ghi chú kiểm tra tình trạng CSVC khi bàn giao |

---

## 6. Danh sách tài khoản thử nghiệm nội bộ

| Vai trò | Tên đăng nhập | Mật khẩu | Họ và tên | Chức danh / Đơn vị / Lớp |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Quản Trị Viên CNTT | Tổ CNTT Nhà trường |
| **Ban giám hiệu** | `bgh_minh` | `bgh123` | Thầy Nguyễn Văn Minh | Phó Hiệu Trưởng |
| **Giáo viên** | `gv_nam` | `gv123` | Thầy Nguyễn Văn Nam | Tổ Thể dục - GDQP |
| **Giáo viên** | `gv_mai` | `gv123` | Cô Trần Thị Mai | Tổ Thể dục - GDQP |
| **Bảo vệ** | `baove_tam` | `bv123` | Bác Lê Văn Tám | Tổ Bảo vệ nhà trường |
| **Học sinh** | `hs_an` | `hs123` | Lê Văn An | Lớp 11 Toán |
| **Học sinh** | `hs_binh` | `hs123` | Phạm Thị Bình | Lớp 12 Lý |
| **Học sinh** | `hs_dung` | `hs123` | Đỗ Hoàng Dũng | Lớp 10 Tin |
| **Học sinh** | `hs_anh` | `hs123` | Nguyễn Quỳnh Anh | Lớp 11 Anh 1 |

---

## 7. Hướng dẫn cài đặt và chạy trên Localhost

### Yêu cầu:
- Đã cài đặt **Node.js** (phiên bản 18, 20 hoặc 22 trở lên).
- Trình quản lý gói `npm`.

### Khởi chạy:
```bash
# 1. Di chuyển vào thư mục dự án
cd management_system

# 2. Cài đặt các thư viện (đã hỗ trợ esbuild 0.28.0)
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## 8. Lợi ích sản phẩm
- Giúp Ban giám hiệu quản lý chặt chẽ tài sản công và lịch sử dụng các khu vực thể thao.
- Hỗ trợ tổ Bảo vệ kiểm soát chặt chẽ an ninh cổng trường vào thứ 7 và Chủ nhật, thu đúng - đủ tiền thuê sân.
- Giúp giáo viên chủ động bố trí tiết dạy học thể chất theo lớp, tránh trùng lịch hoặc tranh chấp sân bãi.
- Tạo sân chơi lành mạnh, an toàn và rèn luyện thể chất bổ ích cho học sinh sau giờ học.
- Xuất báo cáo Excel chuyên nghiệp, phục vụ công tác thanh quyết toán và đánh giá cơ sở vật chất.

## 9. Hạn chế
- Hệ thống áp dụng riêng cho Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.
- Chưa tích hợp cổng thanh toán trực tuyến (việc thu tiền thuê của học sinh thực hiện trực tiếp qua tổ Bảo vệ trường).
- Chưa có hệ thống gửi SMS/Email tự động nhắc nhở lịch.

## 10. Phát triển tương lai
- Tích hợp cổng quét mã QR thanh toán (VietQR / MoMo) cho học sinh.
- Phát triển ứng dụng di động cho học sinh và bảo vệ quét mã QR tại cổng.
- Gửi thông báo tự động qua Zalo OA hoặc Email trường khi lịch được duyệt hoặc thay đổi.
