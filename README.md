# BÁO CÁO HỒ SƠ DỰ ÁN

## 1. Tên dự án:
Hệ thống quản lý khu vực thể thao của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.

---

## 2. Mục đích:
Kiểm soát thời gian mượn và trả các khu vực thể thao của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang bởi giáo viên bộ môn và phục vụ học sinh của trường trong mục đích học tập và giải trí. Qua đó giúp quản lý và sử dụng hiệu quả các khu vực thể thao của nhà trường, đảm bảo nề nếp kỷ cương, minh bạch tài chính và hỗ trợ Ban giám hiệu phân bổ tối ưu cơ sở vật chất.

---

## 3. Mô tả bài toán:
Mỗi người dùng khi được cung cấp tài khoản web có thể đăng ký được những khu vực có thể mượn hoặc thuê. Hệ thống áp dụng riêng cho Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang; người dùng gồm người quản trị, Ban giám hiệu, giáo viên và học sinh của trường (thuộc các khối 10, 11, 12; mỗi khối gồm 8 lớp chuyên: Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn).

Nhà trường có các khu vực thể thao gồm:
- Sân bóng đá.
- Sân Pickleball.
- Sân cầu lông.
- Khu vực chơi bóng bàn.

**Quy chế hoạt động:**
- **Từ thứ 2 đến thứ 6**: Nhà trường không bố trí tiết Thể dục vào buổi sáng (dành cho các môn văn hóa). Toàn bộ các tiết Thể dục được xếp vào **Buổi Chiều (Tiết 1 – 5 từ 13:30 đến 17:35; 45 phút/tiết, nghỉ giải lao 5 phút)**; giáo viên bộ môn mượn và trả khu vực theo tiết học để dạy học chính khóa theo lớp; học sinh không được đại diện đăng ký theo tiết trong tuần.
- **Vào thứ 7 và Chủ nhật**: Học sinh thuê và trả khu vực theo giờ để vui chơi, giải trí (khung giờ quy định: Sáng: 07:00 – 10:00, Chiều: 13:00 – 16:30).

---

## 4. Các chức năng có trong dự án:
- Đăng ký mượn / thuê khu vực thể thao.
- Quản lý lịch cá nhân, chỉnh sửa, hủy và trả sân.
- Thống kê & Xuất dữ liệu Excel (.xlsx).
- Quản trị người dùng & Phân quyền (Quản trị viên).
- Quản lý cơ sở vật chất & Cấu hình giá thuê (Ban giám hiệu).

---

## 5. Dữ liệu: Cơ sở dữ liệu

### Bảng `nguoiDung`:
| TT | Trường | Khóa | Giải thích |
| :---: | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã định danh người dùng duy nhất (VD: `u_admin`, `u_gv_nam`, `u_hs_an`) |
| 2 | `tenDangNhap` | | Tên đăng nhập duy nhất vào hệ thống |
| 3 | `idVaiTro` | Khóa ngoại | Liên kết đến bảng `vaiTro` |
| 4 | `matKhau` | | Mật khẩu xác thực tài khoản |
| 5 | `hoTen` | | Họ và tên đầy đủ của người dùng |
| 6 | `lop` | | Lớp chuyên của học sinh (khối 10, 11, 12); để trống với vai trò khác |
| 7 | `trangThai` | | Trạng thái tài khoản (hoạt động, bị khóa) |
| 8 | `ngayTao` | | Ngày tạo tài khoản (dd/mm/yyyy) |
| 9 | `soDienThoai` | | Số điện thoại liên hệ |
| 10 | `email` | | Email nhà trường |

### Bảng `vaiTro`:
| TT | Trường | Khóa | Giải thích |
| :---: | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã vai trò (`admin`, `bgh`, `giao_vien`, `hoc_sinh`) |
| 2 | `tenVaiTro` | | Tên vai trò (Quản trị viên, Ban giám hiệu, Giáo viên, Học sinh) |

### Bảng `khuVuc`:
| TT | Trường | Khóa | Giải thích |
| :---: | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã khu vực (VD: `kv_bong_da`, `kv_pickleball`, `kv_cau_long`, `kv_bong_ban`) |
| 2 | `tenKhuVuc` | | Tên khu vực thể thao |
| 3 | `giaThueGio` | | Giá thuê mỗi giờ dành cho học sinh vào thứ 7, CN (đồng/giờ) |
| 4 | `trangThai` | | Trạng thái khu vực (hoạt động, bảo trì, ngừng sử dụng) |
| 5 | `moTa` | | Thông số kỹ thuật, quy mô và trang thiết bị khu vực |
| 6 | `viTri` | | Vị trí thực tế trong khuôn viên nhà trường |

### Bảng `dangKy`:
| TT | Trường | Khóa | Giải thích |
| :---: | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã lượt đăng ký duy nhất |
| 2 | `idNguoiDung` | Khóa ngoại | Liên kết đến `nguoiDung` (người tạo lượt đăng ký) |
| 3 | `idKhuVuc` | Khóa ngoại | Liên kết đến `khuVuc` (khu vực thể thao được mượn/thuê) |
| 4 | `ngaySuDung` | | Ngày sử dụng theo định dạng dd/mm/yyyy |
| 5 | `thu` | | Thứ trong tuần (Thứ 2 đến Chủ nhật) |
| 6 | `buoi` | | Buổi trong ngày (sáng, chiều) |
| 7 | `tiet` | | Tiết học (1, 2, 3, 4, 5) dành cho giáo viên T2 đến T6 |
| 8 | `lop` | | Lớp học sinh sử dụng sân (tự động điền từ học sinh đại diện) |
| 9 | `nguoiDaiDienTen` | | Tên học sinh hoặc người đại diện nhận sân |
| 10 | `nguoiDaiDienId` | | ID tài khoản người đại diện |
| 11 | `gioBatDau` | | Giờ bắt đầu thuê vào T7, CN (07:00–10:00 hoặc 13:00–16:30) |
| 12 | `gioKetThuc` | | Giờ kết thúc thuê vào T7, CN |
| 13 | `trangThai` | | Trạng thái lượt đăng ký (đã đăng ký, đang sử dụng, đã trả, đã hủy) |
| 14 | `thoiGianTra` | | Mốc thời gian thực tế người dùng xác nhận trả sân (VD: 16:45 25/10/2026) |
| 15 | `mucDichSuDung` | | Mục đích sử dụng (dạy học chính khóa, tập luyện CLB, thi đấu) |
| 16 | `tongTien` | | Tổng chi phí thuê theo giờ cuối tuần (đồng) |

---

## 6. Mô tả chi tiết các chức năng:

### Đăng ký mượn / thuê khu vực thể thao:
- **Đối với giáo viên**: Mượn và trả khu vực theo tiết học chiều thứ 2 đến thứ 6 (Tiết 1: 13:30–14:15, Tiết 2: 14:20–15:05, Tiết 3: 15:10–15:55, Tiết 4: 16:00–16:45, Tiết 5: 16:50–17:35).
- **Đối với học sinh**: Thuê và trả theo khung giờ quy định vào Thứ 7 và Chủ nhật (Sáng: 07:00 – 10:00, Chiều: 13:00 – 16:30).
- **Các thông tin đăng ký**: Tên khu vực, Ngày sử dụng (dd/mm/yyyy), Buổi, Thứ, Tiết học hoặc khoảng giờ thuê. Hệ thống tự động tính thành tiền thuê cuối tuần.
- **Quy tắc kiểm soát**: Chỉ người dùng có tài khoản hợp lệ do nhà trường cấp mới được đăng ký; chỉ đăng ký được khu vực đang hoạt động; ngăn chặn 100% việc trùng lịch và chặn đăng ký lùi ngày/giờ về quá khứ.

### Quản lý lịch cá nhân, chỉnh sửa, hủy và trả sân:
- Người dùng theo dõi danh sách các lượt mượn/thuê của chính mình.
- **Chỉnh sửa**: Đổi khu vực, ngày, buổi, tiết hoặc giờ sử dụng nếu thời điểm mới còn trống và chưa đến lúc bắt đầu.
- **Hủy đăng ký**: Hủy lượt đăng ký chưa sử dụng để mở lại khu vực cho người khác.
- **Trả sân**: Bấm xác nhận hoàn trả khi kết thúc sử dụng, hệ thống ghi nhận thời điểm trả thực tế.

### Thống kê & Xuất dữ liệu Excel (.xlsx):
- Dành cho Ban giám hiệu và Quản trị viên theo dõi công tác sử dụng cơ sở vật chất của toàn trường.
- Thống kê chi tiết theo ngày, tuần, tháng, học kỳ theo từng khu vực và từng người dùng: số lượt đăng ký, số lượt đã hoàn trả, tổng số giờ sử dụng thực tế, tổng doanh thu tiền thuê sân cuối tuần.
- Xuất báo cáo chuyên nghiệp ra file Excel.

### Quản trị người dùng & Phân quyền (Quản trị viên):
- Quản trị viên cấp tài khoản mới và gán vai trò: Quản trị viên, Ban giám hiệu, Giáo viên, Học sinh.
- Khóa / mở khóa tài khoản vi phạm quy chế hoặc xóa tài khoản.
- **Nhập hàng loạt từ Excel (.xlsx)**: Hỗ trợ nạp danh sách hàng trăm giáo viên, học sinh từ file Excel chỉ bằng 1 thao tác, tự động kiểm tra trùng lặp và loại bỏ dữ liệu lỗi. Hỗ trợ tải file Excel mẫu và xuất danh sách người dùng toàn trường.

### Quản lý cơ sở vật chất & Cấu hình giá thuê (Ban giám hiệu):
- Điều chỉnh trạng thái khu vực (hoạt động, bảo trì, ngừng sử dụng).
- Cập nhật đơn giá thuê theo giờ cho học sinh vào cuối tuần.
- Thêm mới hoặc gỡ bỏ khu vực thể thao theo hiện trạng thực tế của trường.

---

## 7. Dữ liệu:

### a) Dữ liệu thực tế thu thập được:
- **Số lượng**: 5
- **Thống kê sử dụng khu vực thể thao**: [https://drive.google.com/drive/folders/193Qf8aJpIqxS25_ARNiWWb9RUxkMDmcc](https://drive.google.com/drive/folders/193Qf8aJpIqxS25_ARNiWWb9RUxkMDmcc)
  - Tổng hợp.
  - Theo học kỳ.
  - Theo tháng.
  - Theo tuần.
  - Theo ngày.

### b) Các trường hợp dữ liệu cụ thể cần giải quyết trong thực tế & Cách giải quyết:
| STT | Vấn đề / Trường hợp thực tế | Cách giải quyết trong hệ thống |
| :---: | :--- | :--- |
| **1** | **Hai giáo viên hoặc học sinh cùng đăng ký 1 sân trong cùng khoảng thời gian.** | Thuật toán kiểm tra xung đột thời gian (`checkBookingConflict`) đối chiếu ngày, tiết học (với T2-T6) và kiểm tra giao nhau giữa các khoảng giờ `[gioBatDau, gioKetThuc]` (với T7, CN). Nếu phát hiện trùng, hệ thống từ chối lưu và đưa ra thông báo rõ ràng về lượt đang chiếm sân. |
| **2** | **Khu vực thể thao đang bảo trì hoặc hỏng hóc thiết bị.** | Ban giám hiệu có quyền chuyển trạng thái khu vực sang bảo trì hoặc ngừng sử dụng. Hệ thống lập tức hiển thị cảnh báo màu cam và khóa tính năng đăng ký trên toàn bộ ma trận thời khóa biểu của khu vực đó. |

---

## 8. Lợi ích sản phẩm:
- **Nâng cao hiệu quả quản trị**: Giúp Ban giám hiệu giám sát trực quan 24/7 tần suất sử dụng và hiện trạng của toàn bộ cơ sở vật chất thể thao của trường.
- **Xóa bỏ tranh chấp sân bãi**: Giáo viên bộ môn Thể dục chủ động đăng ký và nắm chắc lịch sân còn trống, chấm dứt hoàn toàn tình trạng trùng lịch học giữa các lớp chuyên.
- **Tạo sân chơi lành mạnh cho học sinh**: Học sinh các khối 10, 11, 12 có không gian rèn luyện thể chất, tổ chức giải đấu thể thao an toàn, đúng khung giờ quy định vào cuối tuần.
- **Minh bạch hóa tài chính**: Mọi chi phí thuê sân cuối tuần đều được tự động tính toán chính xác theo đơn giá/giờ và tổng hợp báo cáo doanh thu rõ ràng, hỗ trợ xuất file Excel phục vụ kiểm toán và lưu trữ.
- **Tiết kiệm thời gian và công sức**: Tự động hóa khâu cấp phát tài khoản thông qua import file Excel, thay thế hoàn toàn sổ sách ghi chép thủ công dễ thất lạc.

---

## 9. Hạn chế:
- Ứng dụng hiện tại áp dụng chuyên biệt theo đặc thù phân bổ tiết học và quy chế của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.
- Chưa tích hợp cổng thanh toán trực tuyến tự động (học sinh nộp tiền mặt hoặc chuyển khoản thủ công cho nhà trường).
- Chưa có hệ thống gửi tin nhắn SMS Brandname hoặc Email tự động nhắc nhở lịch mượn sắp đến.

---

## 10. Hướng phát triển:
- Tích hợp cổng thanh toán trực tuyến qua mã QR động (VietQR / Napas247 / MoMo) để tự động xác nhận phí thuê ngay khi đăng ký.
- Xây dựng ứng dụng di động Progressive Web App (PWA) có tính năng gửi thông báo (Push Notification) cho giáo viên và học sinh trước giờ nhận sân 15 phút.
- Mở rộng kết nối API với hệ thống quản lý học sinh và thời khóa biểu chung của trường (SMAS / vnEdu).
- Tích hợp hệ thống khóa cổng thông minh (IoT Smart Lock) mở cửa tự động bằng mã QR hoặc thẻ học sinh khi đến đúng giờ đăng ký.

---

## 11. Sản phẩm xây dựng được:
- **Kho lưu trữ mã nguồn GitHub**: [https://github.com/HirotoSeito/management_system.git](https://github.com/HirotoSeito/management_system.git)

---

## 12. Hướng dẫn cài đặt và sử dụng trên hệ điều hành Windows

### A. Yêu cầu chuẩn bị:
1. **Node.js**: Phiên bản Node.js 18.x, 20.x hoặc 22.x trở lên (tải bản LTS tại: [https://nodejs.org](https://nodejs.org)).
2. **Git for Windows** (khuyến nghị): Tải tại [https://git-scm.com/download/win](https://git-scm.com/download/win) (hoặc có thể tải file ZIP trực tiếp từ GitHub).
3. **Trình duyệt web**: Google Chrome, Microsoft Edge, Cốc Cốc hoặc Mozilla Firefox.

---

### B. Các bước cài đặt và khởi chạy:

#### Bước 1: Tải mã nguồn về máy tính Windows
- **Cách 1 (Dùng Git Bash / CMD / PowerShell)**:
  Mở PowerShell hoặc Command Prompt và chạy lệnh:
  ```powershell
  git clone https://github.com/HirotoSeito/management_system.git
  cd management_system
  ```
- **Cách 2 (Tải file ZIP)**:
  1. Truy cập [https://github.com/HirotoSeito/management_system.git](https://github.com/HirotoSeito/management_system.git).
  2. Bấm vào nút màu xanh **Code** -> chọn **Download ZIP**.
  3. Giải nén thư mục ZIP vừa tải về (ví dụ giải nén tại `D:\management_system`).

#### Bước 2: Mở Terminal tại thư mục dự án
1. Mở thư mục dự án vừa giải nén trên File Explorer của Windows.
2. Bấm vào thanh địa chỉ thư mục (Address bar), gõ `cmd` hoặc `powershell` rồi nhấn **Enter** để mở cửa sổ dòng lệnh ngay tại thư mục đó.

#### Bước 3: Cài đặt các gói thư viện
Trong cửa sổ CMD hoặc PowerShell, gõ lệnh sau và nhấn **Enter**:
```powershell
npm install
```
*(Chờ hệ thống tải và cài đặt các phụ thuộc trong khoảng 30s – 1 phút).*

#### Bước 4: Khởi chạy máy chủ phát triển (Dev Server)
Gõ lệnh sau và nhấn **Enter**:
```powershell
npm run dev
```
Khi màn hình hiển thị thông báo:
```text
  VITE v8.3.0  ready in ... ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```
Nghĩa là dự án đã được khởi chạy thành công!

#### Bước 5: Truy cập và sử dụng hệ thống
Mở trình duyệt web (Google Chrome hoặc Microsoft Edge) và truy cập đường dẫn:
**`http://localhost:3000`**

---

### C. Danh sách tài khoản thử nghiệm nội bộ:

Người dùng có thể bấm nút **Đăng Nhập** ở góc trên bên phải để đăng nhập vào các tài khoản thử nghiệm sau:

| Vai trò | Tên đăng nhập | Mật khẩu | Họ và tên | Chức danh / Đơn vị | Quyền hạn chính |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Quản Trị Viên CNTT | Tổ CNTT Nhà trường | Toàn quyền hệ thống, quản lý tài khoản, nhập Excel |
| **Ban giám hiệu** | `bgh_minh` | `bgh123` | Thầy Nguyễn Văn Minh | Phó Hiệu Trưởng | Xem thống kê, xuất Excel, quản lý cơ sở vật chất |
| **Giáo viên** | `gv_nam` | `gv123` | Thầy Nguyễn Văn Nam | Tổ Thể dục - GDQP | Đăng ký mượn sân theo tiết chiều T2 – T6 |
| **Giáo viên** | `gv_mai` | `gv123` | Cô Trần Thị Mai | Tổ Thể dục - GDQP | Đăng ký mượn sân theo tiết chiều T2 – T6 |
| **Học sinh** | `hs_an` | `hs123` | Lê Văn An | Lớp 11 Toán | Đăng ký thuê sân theo giờ Thứ 7, Chủ nhật |
| **Học sinh** | `hs_binh` | `hs123` | Phạm Thị Bình | Lớp 12 Lý | Đăng ký thuê sân theo giờ Thứ 7, Chủ nhật |
| **Học sinh** | `hs_dung` | `hs123` | Đỗ Hoàng Dũng | Lớp 10 Tin | Đăng ký thuê sân theo giờ Thứ 7, Chủ nhật |
| **Học sinh** | `hs_anh` | `hs123` | Nguyễn Quỳnh Anh | Lớp 11 Anh 1 | Đăng ký thuê sân theo giờ Thứ 7, Chủ nhật |

---

### D. Các thao tác chính khi sử dụng trên Windows:
1. **Xem lịch thể thao**: Người dùng xem ma trận thời khóa biểu theo ngày, kiểm tra các ô màu xanh (sân trống), ô màu xám (đã mượn), ô màu cam (bảo trì).
2. **Đăng ký mượn/thuê**: Bấm vào ô trống trên lịch hoặc bấm nút **Đăng Ký Mượn/Thuê** trên thanh menu; nhập thông tin lớp hoặc tìm kiếm tên học sinh đại diện; bấm Lưu.
3. **Quản lý lịch của tôi**: Bấm mục **Lịch Của Tôi** để chỉnh sửa, hủy lịch mượn hoặc bấm **Xác nhận trả sân** khi dùng xong.
4. **Thống kê & Xuất Excel** *(Dành cho BGH / Admin)*: Vào mục **Thống Kê & Báo Cáo** để xem biểu đồ, lọc theo ngày/tuần/tháng và bấm **Xuất Báo Cáo Excel (.xlsx)** để lưu file trực tiếp về máy tính Windows.
5. **Quản lý người dùng & Nhập Excel** *(Dành cho Admin)*: Vào mục **Tài Khoản (Admin)** để nạp danh sách tài khoản hàng loạt từ file Excel hoặc cấp tài khoản mới.
