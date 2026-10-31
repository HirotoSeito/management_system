import { VaiTro, NguoiDung, KhuVuc, DangKy } from '../types/index.ts';
import { formatDateToVN } from '../utils/bookingRules.ts';

export const INITIAL_VAI_TRO: VaiTro[] = [
  { id: 'admin', tenVaiTro: 'Quản trị viên' },
  { id: 'bgh', tenVaiTro: 'Ban giám hiệu' },
  { id: 'giao_vien', tenVaiTro: 'Giáo viên' },
  { id: 'hoc_sinh', tenVaiTro: 'Học sinh' },
];

export const INITIAL_NGUOI_DUNG: NguoiDung[] = [
  {
    id: 'u_admin',
    tenDangNhap: 'admin',
    idVaiTro: 'admin',
    matKhau: 'admin123',
    hoTen: 'Quản Trị Viên CNTT',
    trangThai: 'hoạt động',
    ngayTao: '15/08/2026',
    soDienThoai: '0905123456',
    email: 'admin@lequydon-nt.edu.vn',
  },
  {
    id: 'u_bgh_minh',
    tenDangNhap: 'bgh_minh',
    idVaiTro: 'bgh',
    matKhau: 'bgh123',
    hoTen: 'Thầy Nguyễn Văn Minh (Phó Hiệu Trưởng)',
    trangThai: 'hoạt động',
    ngayTao: '15/08/2026',
    soDienThoai: '0913456789',
    email: 'minhnv@lequydon-nt.edu.vn',
  },
  {
    id: 'u_gv_nam',
    tenDangNhap: 'gv_nam',
    idVaiTro: 'giao_vien',
    matKhau: 'gv123',
    hoTen: 'Thầy Nguyễn Văn Nam (Tổ Thể dục - GDQP)',
    trangThai: 'hoạt động',
    ngayTao: '20/08/2026',
    soDienThoai: '0987654321',
    email: 'namnv@lequydon-nt.edu.vn',
  },
  {
    id: 'u_gv_mai',
    tenDangNhap: 'gv_mai',
    idVaiTro: 'giao_vien',
    matKhau: 'gv123',
    hoTen: 'Cô Trần Thị Mai (Tổ Thể dục - GDQP)',
    trangThai: 'hoạt động',
    ngayTao: '20/08/2026',
    soDienThoai: '0978901234',
    email: 'maitt@lequydon-nt.edu.vn',
  },
  {
    id: 'u_hs_an',
    tenDangNhap: 'hs_an',
    idVaiTro: 'hoc_sinh',
    matKhau: 'hs123',
    hoTen: 'Lê Văn An',
    lop: '11 Toán',
    trangThai: 'hoạt động',
    ngayTao: '05/09/2026',
    soDienThoai: '0834567890',
  },
  {
    id: 'u_hs_binh',
    tenDangNhap: 'hs_binh',
    idVaiTro: 'hoc_sinh',
    matKhau: 'hs123',
    hoTen: 'Phạm Thị Bình',
    lop: '12 Lý',
    trangThai: 'hoạt động',
    ngayTao: '05/09/2026',
    soDienThoai: '0845678901',
  },
  {
    id: 'u_hs_dung',
    tenDangNhap: 'hs_dung',
    idVaiTro: 'hoc_sinh',
    matKhau: 'hs123',
    hoTen: 'Đỗ Hoàng Dũng',
    lop: '10 Tin',
    trangThai: 'hoạt động',
    ngayTao: '06/09/2026',
    soDienThoai: '0856789012',
  },
  {
    id: 'u_hs_anh',
    tenDangNhap: 'hs_anh',
    idVaiTro: 'hoc_sinh',
    matKhau: 'hs123',
    hoTen: 'Nguyễn Quỳnh Anh',
    lop: '11 Anh 1',
    trangThai: 'hoạt động',
    ngayTao: '06/09/2026',
    soDienThoai: '0867890123',
  },
];

export const INITIAL_KHU_VUC: KhuVuc[] = [
  {
    id: 'kv_bong_da',
    tenKhuVuc: 'Sân bóng đá',
    giaThueGio: 150000,
    trangThai: 'hoạt động',
    moTa: 'Sân cỏ nhân tạo 7 người chất lượng cao của trường, dàn đèn LED chiếu sáng đêm tiêu chuẩn.',
    viTri: 'Khu A - Sau nhà hiệu bộ THPT chuyên Lê Quý Đôn',
    hinhAnh: '/src/assets/images/facility_football_pitch_1792291598957.jpg',
  },
  {
    id: 'kv_pickleball',
    tenKhuVuc: 'Sân Pickleball',
    giaThueGio: 80000,
    trangThai: 'hoạt động',
    moTa: 'Sân Pickleball mới lát sơn Acrylic tiêu chuẩn thi đấu cho giáo viên và học sinh trường.',
    viTri: 'Khu B - Phía đông sân thể thao ngoài trời',
    hinhAnh: '/src/assets/images/facility_pickleball_court_1792291599694.jpg',
  },
  {
    id: 'kv_cau_long',
    tenKhuVuc: 'Sân cầu lông',
    giaThueGio: 60000,
    trangThai: 'hoạt động',
    moTa: 'Sàn gỗ chuyên dụng trong nhà thi đấu đa năng của trường, chống trơn trượt, đèn chống lóa.',
    viTri: 'Nhà thi đấu đa năng tầng 1',
    hinhAnh: '/src/assets/images/facility_badminton_court_1792291600254.jpg',
  },
  {
    id: 'kv_bong_ban',
    tenKhuVuc: 'Khu vực chơi bóng bàn',
    giaThueGio: 40000,
    trangThai: 'hoạt động',
    moTa: 'Phòng tập bóng bàn 4 bàn thi đấu Double Fish tiêu chuẩn, thông gió thoáng mát.',
    viTri: 'Nhà thi đấu đa năng tầng 2',
    hinhAnh: '/src/assets/images/facility_table_tennis_1792291599618.jpg',
  },
];

export function generateInitialBookings(): DangKy[] {
  const now = new Date();

  // Find Monday of current week
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const tuesday = new Date(monday);
  tuesday.setDate(monday.getDate() + 1);

  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);

  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return [
    // Thứ 2: Thầy Nam dạy thể dục bóng đá cho lớp 11 Toán buổi chiều tiết 1, 2
    {
      id: 'bk_001',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(monday),
      thu: 'Thứ 2',
      buoi: 'chiều',
      tiet: 1,
      lop: '11 Toán',
      trangThai: 'đã trả',
      thoiGianTra: `14:15 ${formatDateToVN(monday)}`,
      mucDichSuDung: 'Dạy thể dục kỹ thuật chuyền bóng lớp 11 Toán',
      tongTien: 0,
    },
    {
      id: 'bk_002',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(monday),
      thu: 'Thứ 2',
      buoi: 'chiều',
      tiet: 2,
      lop: '11 Lý',
      trangThai: 'đã trả',
      thoiGianTra: `15:05 ${formatDateToVN(monday)}`,
      mucDichSuDung: 'Dạy thể dục kỹ thuật dẫn bóng lớp 11 Lý',
      tongTien: 0,
    },
    // Thứ 2: Cô Mai dạy cầu lông cho lớp 12 Anh 1 buổi chiều tiết 3
    {
      id: 'bk_003',
      idNguoiDung: 'u_gv_mai',
      idKhuVuc: 'kv_cau_long',
      ngaySuDung: formatDateToVN(monday),
      thu: 'Thứ 2',
      buoi: 'chiều',
      tiet: 3,
      lop: '12 Anh 1',
      trangThai: 'đã trả',
      thoiGianTra: `15:55 ${formatDateToVN(monday)}`,
      mucDichSuDung: 'Dạy kỹ thuật đập cầu lớp 12 Anh 1',
      tongTien: 0,
    },
    // Thứ 3: Thầy Nam dạy bóng bàn cho lớp 10 Tin buổi chiều tiết 2
    {
      id: 'bk_004',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_ban',
      ngaySuDung: formatDateToVN(tuesday),
      thu: 'Thứ 3',
      buoi: 'chiều',
      tiet: 2,
      lop: '10 Tin',
      trangThai: 'đã trả',
      thoiGianTra: `15:05 ${formatDateToVN(tuesday)}`,
      mucDichSuDung: 'Kiểm tra đánh bóng bàn lớp 10 Tin',
      tongTien: 0,
    },
    // Thứ 4: Cô Mai mượn sân Pickleball cho lớp 10 Văn buổi chiều tiết 4
    {
      id: 'bk_005',
      idNguoiDung: 'u_gv_mai',
      idKhuVuc: 'kv_pickleball',
      ngaySuDung: formatDateToVN(wednesday),
      thu: 'Thứ 4',
      buoi: 'chiều',
      tiet: 4,
      lop: '10 Văn',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Chuyên đề tự chọn thể thao môn Pickleball',
      tongTien: 0,
    },
    // Thứ 5: Thầy Nam mượn sân bóng đá cho lớp 12 Hóa buổi chiều tiết 3
    {
      id: 'bk_006',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(thursday),
      thu: 'Thứ 5',
      buoi: 'chiều',
      tiet: 3,
      lop: '12 Hóa',
      trangThai: 'đang sử dụng',
      thoiGianTra: null,
      mucDichSuDung: 'Đội tuyển thể thao trường luyện tập thi đấu giải ngành',
      tongTien: 0,
    },
    // Thứ 6: Cô Mai mượn sân cầu lông cho lớp 10 Sinh buổi chiều tiết 2
    {
      id: 'bk_007',
      idNguoiDung: 'u_gv_mai',
      idKhuVuc: 'kv_cau_long',
      ngaySuDung: formatDateToVN(friday),
      thu: 'Thứ 6',
      buoi: 'chiều',
      tiet: 2,
      lop: '10 Sinh',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Giáo dục thể chất học kỳ môn Cầu lông',
      tongTien: 0,
    },
    // Thứ 7: Học sinh Lê Văn An (11 Toán) thuê sân bóng đá
    {
      id: 'bk_008',
      idNguoiDung: 'u_hs_an',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(saturday),
      thu: 'Thứ 7',
      lop: '11 Toán',
      nguoiDaiDienTen: 'Lê Văn An',
      nguoiDaiDienId: 'u_hs_an',
      gioBatDau: '08:00',
      gioKetThuc: '10:00',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Giao lưu bóng đá khối 11 chuyên Toán và chuyên Lý',
      tongTien: 300000,
    },
    // Thứ 7: Học sinh Phạm Thị Bình (12 Lý) thuê sân Pickleball
    {
      id: 'bk_009',
      idNguoiDung: 'u_hs_binh',
      idKhuVuc: 'kv_pickleball',
      ngaySuDung: formatDateToVN(saturday),
      thu: 'Thứ 7',
      lop: '12 Lý',
      nguoiDaiDienTen: 'Phạm Thị Bình',
      nguoiDaiDienId: 'u_hs_binh',
      gioBatDau: '14:00',
      gioKetThuc: '16:00',
      trangThai: 'đang sử dụng',
      thoiGianTra: null,
      mucDichSuDung: 'CLB Pickleball học sinh tập luyện rèn sức khỏe',
      tongTien: 160000,
    },
    // Chủ nhật: Học sinh Đỗ Hoàng Dũng (10 Tin) thuê phòng bóng bàn
    {
      id: 'bk_010',
      idNguoiDung: 'u_hs_dung',
      idKhuVuc: 'kv_bong_ban',
      ngaySuDung: formatDateToVN(sunday),
      thu: 'Chủ nhật',
      lop: '10 Tin',
      nguoiDaiDienTen: 'Đỗ Hoàng Dũng',
      nguoiDaiDienId: 'u_hs_dung',
      gioBatDau: '08:00',
      gioKetThuc: '10:00',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Học sinh tập bóng bàn giải trí sau giờ học',
      tongTien: 80000,
    },
    // Chủ nhật: Học sinh Nguyễn Quỳnh Anh (11 Anh 1) thuê sân cầu lông
    {
      id: 'bk_011',
      idNguoiDung: 'u_hs_anh',
      idKhuVuc: 'kv_cau_long',
      ngaySuDung: formatDateToVN(sunday),
      thu: 'Chủ nhật',
      lop: '11 Anh 1',
      nguoiDaiDienTen: 'Nguyễn Quỳnh Anh',
      nguoiDaiDienId: 'u_hs_anh',
      gioBatDau: '14:00',
      gioKetThuc: '16:00',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Rèn luyện thể lực cuối tuần cùng các bạn trong lớp',
      tongTien: 120000,
    },
  ];
}
