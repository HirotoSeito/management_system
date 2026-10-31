# HỒ SƠ DỰ ÁN
## HỆ THỐNG QUẢN LÝ KHU VỰC THỂ THAO
### Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang

---

## 1. Tên dự án
**Hệ thống quản lý khu vực thể thao của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.**

---

## 2. Mục đích
Kiểm soát thời gian mượn và trả các khu vực thể thao của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang bởi giáo viên bộ môn và phục vụ học sinh của trường trong mục đích học tập và giải trí. Qua đó giúp quản lý và sử dụng hiệu quả các khu vực thể thao của nhà trường, đảm bảo nề nếp kỷ cương, minh bạch tài chính và hỗ trợ Ban giám hiệu phân bổ tối ưu cơ sở vật chất.

---

## 3. Mô tả bài toán
Mỗi người dùng khi được cung cấp tài khoản web có thể đăng ký được những khu vực có thể mượn hoặc thuê. Hệ thống áp dụng riêng cho Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang; người dùng gồm người quản trị, Ban giám hiệu, giáo viên và học sinh của trường (thuộc các khối 10, 11, 12; mỗi khối gồm 8 lớp chuyên: Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn).

Nhà trường có các khu vực thể thao gồm:
- **Sân bóng đá**: Sân cỏ nhân tạo 7 người, hệ thống chiếu sáng ban đêm.
- **Sân Pickleball**: Mặt sân sơn Acrylic tiêu chuẩn thi đấu.
- **Sân cầu lông**: Sàn gỗ chuyên dụng trong nhà đa năng tầng 1.
- **Khu vực chơi bóng bàn**: Phòng 4 bàn thi đấu Double Fish tầng 2.

**Quy chế hoạt động:**
- **Từ thứ 2 đến thứ 6**: Nhà trường không bố trí tiết Thể dục vào buổi sáng (dành cho các môn văn hóa). Toàn bộ các tiết Thể dục được xếp vào **Buổi Chiều (Tiết 1 – 5 từ 13:30 đến 17:35; 45 phút/tiết, nghỉ giải lao 5 phút)**; giáo viên bộ môn mượn và trả khu vực theo tiết học để dạy học chính khóa theo lớp; học sinh không được đại diện đăng ký theo tiết trong tuần.
- **Vào thứ 7 và Chủ nhật**: Học sinh thuê và trả khu vực theo giờ để vui chơi, giải trí (khung giờ quy định: Sáng: 07:00 – 10:00, Chiều: 13:00 – 16:30).
- **Kiểm soát thời gian thực**: Đồng hồ thời gian thực (Live clock) hiển thị liên tục; các tiết học hoặc khung giờ đã trôi qua trong quá khứ so với thời điểm hiện tại sẽ bị khóa, không cho phép đăng ký.
- **Tìm kiếm người đại diện kiểu Google**: Khi đăng ký, người dùng nhập tên/username hoặc lớp của học sinh đại diện; hệ thống tự động kiểm tra và gợi ý trực tiếp (autocomplete), đồng thời tự động điền lớp học sinh, loại bỏ thao tác chọn lớp thủ công.
- Giúp Ban giám hiệu quản lý chặt chẽ cơ sở vật chất, giá thuê và thống kê chi tiết dữ liệu sử dụng khu vực.

---

## 4. Các chức năng có trong dự án
1. Đăng ký mượn / thuê khu vực thể thao.
2. Hiển thị lịch thể thao theo thời gian thực (Ma trận thời khóa biểu).
3. Quản lý lịch cá nhân, chỉnh sửa, hủy và trả sân.
4. Thống kê & Xuất dữ liệu Excel (.xlsx).
5. Quản trị người dùng & Phân quyền (Quản trị viên).
6. Quản lý cơ sở vật chất & Cấu hình giá thuê (Ban giám hiệu).
7. Xác thực đăng nhập nội bộ bảo mật theo phân quyền.

---

## 5. Dữ liệu: Cơ sở dữ liệu

### Mô hình quan hệ giữa các bảng:
- **`vaiTro` (1) — (N) `nguoiDung`**: Một vai trò có nhiều người dùng (`idVaiTro`).
- **`nguoiDung` (1) — (N) `dangKy`**: Một người dùng có thể tạo nhiều lượt đăng ký mượn/thuê (`idNguoiDung`).
- **`khuVuc` (1) — (N) `dangKy`**: Một khu vực thể thao có nhiều lượt đăng ký theo thời gian (`idKhuVuc`).

### Bảng `nguoiDung`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã người dùng duy nhất (VD: `u_admin`, `u_gv_nam`, `u_hs_an`) |
| 2 | `tenDangNhap` | | Tên đăng nhập duy nhất vào hệ thống |
| 3 | `idVaiTro` | Khóa ngoại | Liên kết đến bảng `vaiTro` |
| 4 | `matKhau` | | Mật khẩu xác thực tài khoản |
| 5 | `hoTen` | | Họ và tên đầy đủ của người dùng |
| 6 | `lop` | | Lớp chuyên của học sinh (khối 10, 11, 12); để trống với vai trò khác |
| 7 | `trangThai` | | Trạng thái tài khoản (`hoạt động`, `bị khóa`) |
| 8 | `ngayTao` | | Ngày khởi tạo tài khoản (`dd/mm/yyyy`) |
| 9 | `soDienThoai` | | Số điện thoại liên hệ (tùy chọn) |
| 10 | `email` | | Email nhà trường `@lequydon-nt.edu.vn` (tùy chọn) |

### Bảng `vaiTro`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã vai trò (`admin`, `bgh`, `giao_vien`, `hoc_sinh`) |
| 2 | `tenVaiTro` | | Tên vai trò (Quản trị viên, Ban giám hiệu, Giáo viên, Học sinh) |

### Bảng `khuVuc`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã khu vực (VD: `kv_bong_da`, `kv_pickleball`, `kv_cau_long`, `kv_bong_ban`) |
| 2 | `tenKhuVuc` | | Tên khu vực thể thao |
| 3 | `giaThueGio` | | Giá thuê mỗi giờ dành cho học sinh vào thứ 7, CN (đồng/giờ) |
| 4 | `trangThai` | | Trạng thái khu vực (`hoạt động`, `bảo trì`, `ngừng sử dụng`) |
| 5 | `moTa` | | Thông số kỹ thuật, quy mô và trang thiết bị khu vực |
| 6 | `viTri` | | Vị trí thực tế trong khuôn viên trường |

### Bảng `dangKy`:
| TT | Trường | Khóa | Giải thích |
| :--- | :--- | :--- | :--- |
| 1 | `id` | Khóa chính | Mã lượt đăng ký duy nhất |
| 2 | `idNguoiDung` | Khóa ngoại | Liên kết đến `nguoiDung` (người tạo lượt đăng ký) |
| 3 | `idKhuVuc` | Khóa ngoại | Liên kết đến `khuVuc` (khu vực thể thao được mượn/thuê) |
| 4 | `ngaySuDung` | | Ngày sử dụng theo định dạng `dd/mm/yyyy` |
| 5 | `thu` | | Thứ trong tuần (`Thứ 2` đến `Chủ nhật`) |
| 6 | `buoi` | | Buổi trong ngày (`sáng`, `chiều`) |
| 7 | `tiet` | | Tiết học (`1`, `2`, `3`, `4`, `5`) dành cho giáo viên T2 đến T6 |
| 8 | `lop` | | Lớp học sinh sử dụng sân (tự động điền từ học sinh đại diện) |
| 9 | `nguoiDaiDienTen` | | Tên học sinh hoặc người đại diện nhận sân |
| 10 | `nguoiDaiDienId` | | ID tài khoản người đại diện |
| 11 | `gioBatDau` | | Giờ bắt đầu thuê vào T7, CN (07:00–10:00 hoặc 13:00–16:30) |
| 12 | `gioKetThuc` | | Giờ kết thúc thuê vào T7, CN |
| 13 | `trangThai` | | Trạng thái lượt đăng ký (`đã đăng ký`, `đang sử dụng`, `đã trả`, `đã hủy`) |
| 14 | `thoiGianTra` | | Mốc thời gian thực tế người dùng xác nhận trả sân (VD: `16:45 25/10/2026`) |
| 15 | `mucDichSuDung` | | Mục đích sử dụng (dạy học chính khóa, tập luyện CLB, thi đấu) |
| 16 | `tongTien` | | Tổng chi phí thuê theo giờ cuối tuần (đồng) |

---

## 6. Mô tả chi tiết các chức năng

### 6.1. Đăng ký khu vực thể thao:
- **Đối với giáo viên**: Mượn và trả khu vực theo tiết học chiều thứ 2 đến thứ 6 (Tiết 1: 13:30–14:15, Tiết 2: 14:20–15:05, Tiết 3: 15:10–15:55, Tiết 4: 16:00–16:45, Tiết 5: 16:50–17:35).
- **Đối với học sinh**: Thuê và trả theo khung giờ quy định vào Thứ 7 và Chủ nhật (Sáng: 07:00 – 10:00, Chiều: 13:00 – 16:30).
- **Các thông tin đăng ký**:
  + Tên khu vực: Sân bóng đá, Sân Pickleball, Sân cầu lông, Khu vực chơi bóng bàn.
  + Ngày sử dụng (`dd/mm/yyyy`), Buổi (`chiều` trong tuần), Thứ (`Thứ 2` đến `Chủ nhật`).
  + Tiết học (1 đến 5) hoặc khoảng giờ bắt đầu - kết thúc.
  + Người đại diện & Lớp sử dụng: Tìm kiếm người đại diện kiểu Google thông minh, tự động truy xuất lớp của học sinh (thuộc 24 lớp chuyên khối 10, 11, 12).
  + Tự động tính tiền thuê theo đơn giá giờ của từng khu vực.
- **Quy tắc kiểm soát**:
  + Chỉ người dùng có tài khoản hợp lệ do nhà trường cấp mới được đăng ký.
  + Chỉ đăng ký được khu vực đang ở trạng thái `hoạt động` (chặn khu vực `bảo trì`, `ngừng sử dụng`).
  + Chặn tuyệt đối trùng lịch: mỗi khu vực chỉ có 1 lượt đăng ký trong cùng một tiết hoặc khoảng giờ trùng lặp.
  + Chặn đặt lịch trong quá khứ so với thời gian thực tế.

### 6.2. Hiển thị ma trận thời khóa biểu theo thời gian thực:
- Giao diện ma trận trực quan theo ngày được chọn.
- Phân biệt rõ các trạng thái ô:
  + Ô màu xanh lá: Đang trống, cho phép bấm để đăng ký ngay.
  + Ô màu xám/xanh đậm: Đã có người đăng ký hoặc đang sử dụng (hiển thị thông tin lớp, người mượn, mục đích).
  + Ô màu cam: Khu vực đang bảo trì.
  + Ô gạch chéo xám: Khung giờ đã trôi qua so với thời gian thực tế (Live Clock).
- Bộ lọc linh hoạt theo ngày, buổi và khu vực thể thao.

### 6.3. Quản lý lịch cá nhân, chỉnh sửa, hủy và trả sân:
- Người dùng theo dõi toàn bộ lịch mượn/thuê của chính mình.
- **Chỉnh sửa**: Cập nhật thông tin hoặc đổi giờ/tiết nếu khung giờ mới còn trống và chưa đến giờ sử dụng.
- **Hủy lịch**: Hủy lượt đăng ký chưa sử dụng để mở lại khu vực cho người khác.
- **Trả sân**: Xác nhận kết thúc sử dụng; hệ thống tự động ghi nhận thời điểm hoàn trả thực tế để giám sát thời gian bàn giao.

### 6.4. Thống kê & Xuất báo cáo Excel (.xlsx):
- Dành cho Ban giám hiệu và Quản trị viên theo dõi công tác sử dụng tài sản nhà trường.
- Thống kê chi tiết theo ngày, tuần, tháng, học kỳ theo từng khu vực và từng người dùng:
  + Số lượt đăng ký, số lượt đã hoàn trả, số lượt đang sử dụng.
  + Tổng số giờ sử dụng thực tế.
  + Doanh thu tiền thuê sân cuối tuần từ học sinh.
- **Xuất tệp Excel chuyên nghiệp**: Tải báo cáo đa sheet gồm tổng quan khu vực, chi tiết theo từng người dùng và danh sách toàn bộ các lượt mượn sân.

### 6.5. Quản trị người dùng & Phân quyền (Admin):
- Quản trị viên cấp tài khoản mới và gán vai trò: Quản trị viên, Ban giám hiệu, Giáo viên, Học sinh.
- Khóa / mở khóa tài khoản người dùng vi phạm quy chế.
- **Nhập hàng loạt từ tệp Excel (.xlsx)**: Hỗ trợ nạp hàng trăm tài khoản học sinh, giáo viên từ file Excel chỉ bằng 1 thao tác; tự động bắt lỗi trùng tên đăng nhập, thiếu dữ liệu, sai lớp.
- Cung cấp tính năng tải file Excel mẫu chuẩn quy cách nhà trường và xuất danh sách người dùng ra Excel.

### 6.6. Quản lý cơ sở vật chất (Ban giám hiệu):
- Chuyển đổi trạng thái khu vực: Đang hoạt động, Tạm bảo trì sửa chữa, Ngừng sử dụng.
- Cập nhật đơn giá thuê mỗi giờ cho từng khu vực khi nhà trường điều chỉnh quy chế.
- Thêm mới khu vực thể thao hoặc loại bỏ khu vực không còn vận hành.

---

## 7. Dữ liệu

### 7.1. Dữ liệu thực tế thu thập được:
- **Khu vực thể thao**: 4 khu vực chính thức tại trường (`Sân bóng đá`, `Sân Pickleball`, `Sân cầu lông`, `Khu vực chơi bóng bàn`).
- **Danh sách lớp chuyên**: 24 lớp chuyên của THPT Chuyên Lê Quý Đôn:
  + Khối 10: 10 Toán, 10 Lý, 10 Hóa, 10 Sinh, 10 Tin, 10 Anh 1, 10 Anh 2, 10 Văn.
  + Khối 11: 11 Toán, 11 Lý, 11 Hóa, 11 Sinh, 11 Tin, 11 Anh 1, 11 Anh 2, 11 Văn.
  + Khối 12: 12 Toán, 12 Lý, 12 Hóa, 12 Sinh, 12 Tin, 12 Anh 1, 12 Anh 2, 12 Văn.
- **Số lượng tài khoản mẫu**: 7 tài khoản chuẩn đại diện đầy đủ các nhóm đối tượng (Admin, Ban giám hiệu, Giáo viên thể dục, Học sinh các lớp chuyên).
- **Số lượng bản ghi đăng ký**: 11 bản ghi khởi tạo sẵn mô phỏng đầy đủ các tình huống: dạy học chính khóa theo tiết của giáo viên các buổi chiều trong tuần, các ca thuê sân giao lưu bóng đá, pickleball, cầu lông của học sinh vào thứ 7 và Chủ nhật.
- **Tệp dữ liệu mẫu**: Tích hợp sẵn chức năng tải file Excel mẫu nhập tài khoản `Mau_Nhap_Tai_Khoan_LeQuyDon.xlsx` và xuất dữ liệu báo cáo `Bao_Cao_Su_Dung_CSVC_LeQuyDon.xlsx`.

### 7.2. Các trường hợp dữ liệu cụ thể cần giải quyết trong thực tế & Cách giải quyết:

| STT | Vấn đề / Trường hợp thực tế | Cách giải quyết trong hệ thống |
| :---: | :--- | :--- |
| **1** | **Hai giáo viên hoặc học sinh cùng đăng ký 1 sân trong cùng khoảng thời gian.** | Thuật toán kiểm tra xung đột thời gian (`checkBookingConflict`) đối chiếu ngày, tiết học (với T2-T6) và kiểm tra giao nhau giữa các khoảng giờ `[gioBatDau, gioKetThuc]` (với T7, CN). Nếu phát hiện trùng, hệ thống từ chối lưu và đưa ra thông báo rõ ràng về lượt đang chiếm sân. |
| **2** | **Người dùng cố tình đăng ký lùi ngày/giờ về quá khứ.** | Hệ thống gắn kết với đồng hồ thời gian thực (Live System Clock). Bất kỳ yêu cầu đăng ký nào có mốc thời gian trước thời điểm hiện tại đều bị vô hiệu hóa trên giao diện và chặn ở tầng xử lý logic. |
| **3** | **Học sinh đăng ký mượn sân trong tuần (T2 đến T6) làm ảnh hưởng tiết dạy của giáo viên.** | Quy chế vận hành phân quyền chặt chẽ: Hệ thống kiểm tra vai trò người dùng (`idVaiTro`). Nếu là học sinh, hệ thống chỉ mở giao diện chọn khung giờ vào Thứ 7 và Chủ nhật, chặn hoàn toàn việc chọn tiết học từ Thứ 2 đến Thứ 6. |
| **4** | **Người dùng nhập sai hoặc nhầm lẫn tên lớp của học sinh.** | Tích hợp cơ chế tìm kiếm Google Autocomplete: Khi người dùng gõ tên học sinh hoặc tên đăng nhập, hệ thống tự động gợi ý danh sách học sinh tương ứng kèm lớp chuyên chính xác và tự động gán vào phiếu đăng ký, không cần nhập tay. |
| **5** | **File Excel nạp tài khoản hàng loạt bị trùng lặp, sai vai trò hoặc thiếu dữ liệu.** | Module nạp dữ liệu Excel kiểm tra hợp lệ từng dòng: chuẩn hóa tên vai trò, kiểm tra trùng lặp `tenDangNhap` so với cơ sở dữ liệu hiện có và trong chính file tải lên. Nếu có dòng lỗi, hệ thống thông báo chi tiết số dòng vi phạm và chỉ nạp các dòng hợp lệ. |
| **6** | **Khu vực thể thao đang bảo trì hoặc hỏng hóc thiết bị.** | Ban giám hiệu có quyền chuyển trạng thái khu vực sang `bảo trì` hoặc `ngừng sử dụng`. Hệ thống lập tức hiển thị cảnh báo màu cam và khóa tính năng đăng ký trên toàn bộ ma trận thời khóa biểu của khu vực đó. |

---

## 8. Lợi ích sản phẩm
- **Nâng cao hiệu quả quản trị**: Giúp Ban giám hiệu giám sát trực quan 24/7 tần suất sử dụng và hiện trạng của toàn bộ cơ sở vật chất thể thao của trường.
- **Xóa bỏ tranh chấp sân bãi**: Giáo viên bộ môn Thể dục chủ động đăng ký và nắm chắc lịch sân còn trống, chấm dứt hoàn toàn tình trạng trùng lịch học giữa các lớp chuyên.
- **Tạo sân chơi lành mạnh cho học sinh**: Học sinh các khối 10, 11, 12 có không gian rèn luyện thể chất, tổ chức giải đấu thể thao an toàn, đúng khung giờ quy định vào cuối tuần.
- **Minh bạch hóa tài chính**: Mọi chi phí thuê sân cuối tuần đều được tự động tính toán chính xác theo đơn giá/giờ và tổng hợp báo cáo doanh thu rõ ràng, hỗ trợ xuất file Excel phục vụ kiểm toán và lưu trữ.
- **Tiết kiệm thời gian và công sức**: Tự động hóa khâu cấp phát tài khoản thông qua import file Excel, thay thế hoàn toàn sổ sách ghi chép thủ công dễ thất lạc.

---

## 9. Hạn chế
- Ứng dụng hiện tại áp dụng chuyên biệt theo đặc thù phân bổ tiết học và quy chế của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.
- Chưa tích hợp cổng thanh toán trực tuyến tự động (học sinh nộp tiền mặt hoặc chuyển khoản thủ công cho nhà trường).
- Chưa có hệ thống gửi tin nhắn SMS Brandname hoặc Email tự động nhắc nhở lịch mượn sắp đến.

---

## 10. Hướng phát triển
- Tích hợp cổng thanh toán trực tuyến qua mã QR động (VietQR / Napas247 / MoMo) để tự động xác nhận phí thuê ngay khi đăng ký.
- Xây dựng ứng dụng di động Progressive Web App (PWA) có tính năng gửi thông báo (Push Notification) cho giáo viên và học sinh trước giờ nhận sân 15 phút.
- Mở rộng kết nối API với hệ thống quản lý học sinh và thời khóa biểu chung của trường (SMAS / vnEdu).
- Tích hợp hệ thống khóa cổng thông minh (IoT Smart Lock) mở cửa tự động bằng mã QR hoặc thẻ học sinh khi đến đúng giờ đăng ký.

---

## 11. Sản phẩm xây dựng được
- **Chương trình đóng gói**: Mã nguồn hoàn chỉnh của ứng dụng web được lưu trữ và quản lý phiên bản trên Git.
- **Đường link sản phẩm (Web App trực tuyến)**: [https://ais-pre-2oz4h4thuwu6d4yb32xxxl-292545762994.asia-east1.run.app](https://ais-pre-2oz4h4thuwu6d4yb32xxxl-292545762994.asia-east1.run.app)
- **Kho lưu trữ mã nguồn GitHub**: [https://github.com/HirotoSeito/management_system.git](https://github.com/HirotoSeito/management_system.git)

---

### Hướng dẫn cài đặt và chạy thử nghiệm trên máy tính cá nhân:
```bash
# 1. Clone mã nguồn từ GitHub
git clone https://github.com/HirotoSeito/management_system.git
cd management_system

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Chạy môi trường phát triển
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

### Danh sách tài khoản thử nghiệm nội bộ:
| Vai trò | Tên đăng nhập | Mật khẩu | Họ và tên | Chức danh / Đơn vị |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Quản Trị Viên CNTT | Tổ CNTT Nhà trường |
| **Ban giám hiệu** | `bgh_minh` | `bgh123` | Thầy Nguyễn Văn Minh | Phó Hiệu Trưởng |
| **Giáo viên** | `gv_nam` | `gv123` | Thầy Nguyễn Văn Nam | Tổ Thể dục - GDQP |
| **Giáo viên** | `gv_mai` | `gv123` | Cô Trần Thị Mai | Tổ Thể dục - GDQP |
| **Học sinh** | `hs_an` | `hs123` | Lê Văn An | Lớp 11 Toán |
| **Học sinh** | `hs_binh` | `hs123` | Phạm Thị Bình | Lớp 12 Lý |
| **Học sinh** | `hs_dung` | `hs123` | Đỗ Hoàng Dũng | Lớp 10 Tin |
| **Học sinh** | `hs_anh` | `hs123` | Nguyễn Quỳnh Anh | Lớp 11 Anh 1 |
