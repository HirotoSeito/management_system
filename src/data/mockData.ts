import { VaiTro, NguoiDung, KhuVuc, DangKy } from '../types/index.ts';
import { formatDateToVN, getThuTrongTuan } from '../utils/bookingRules.ts';

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
    soDienThoai: '0901234567',
  },
  {
    id: 'u_bgh',
    tenDangNhap: 'bgh_minh',
    idVaiTro: 'bgh',
    matKhau: 'bgh123',
    hoTen: 'Thầy Nguyễn Văn Minh (Phó Hiệu Trưởng)',
    trangThai: 'hoạt động',
    ngayTao: '15/08/2026',
    soDienThoai: '0912345678',
  },
  {
    id: 'u_gv_nam',
    tenDangNhap: 'gv_nam',
    idVaiTro: 'giao_vien',
    matKhau: 'gv123',
    hoTen: 'Thầy Nguyễn Văn Nam (GV Thể dục)',
    trangThai: 'hoạt động',
    ngayTao: '20/08/2026',
    soDienThoai: '0987654321',
  },
  {
    id: 'u_gv_mai',
    tenDangNhap: 'gv_mai',
    idVaiTro: 'giao_vien',
    matKhau: 'gv123',
    hoTen: 'Cô Trần Thị Mai (GV Thể chất)',
    trangThai: 'hoạt động',
    ngayTao: '20/08/2026',
    soDienThoai: '0978901234',
  },
  {
    id: 'u_hs_an',
    tenDangNhap: 'hs_an',
    idVaiTro: 'hoc_sinh',
    matKhau: 'hs123',
    hoTen: 'Lê Văn An',
    lop: '11A1',
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
    lop: '12A2',
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
    lop: '10A3',
    trangThai: 'hoạt động',
    ngayTao: '06/09/2026',
    soDienThoai: '0856789012',
  },
];

export const INITIAL_KHU_VUC: KhuVuc[] = [
  {
    id: 'kv_bong_da',
    tenKhuVuc: 'Sân bóng đá',
    giaThueGio: 150000,
    trangThai: 'hoạt động',
    moTa: 'Sân cỏ nhân tạo chất lượng cao 7 người, hệ thống chiếu sáng ban đêm tiêu chuẩn thi đấu.',
    viTri: 'Khu A - Phía sau dãy phòng học đa năng',
    hinhAnh: '/src/assets/images/facility_football_pitch_1792291598957.jpg',
  },
  {
    id: 'kv_pickleball',
    tenKhuVuc: 'Sân Pickleball',
    giaThueGio: 80000,
    trangThai: 'hoạt động',
    moTa: 'Mặt sân phủ sơn Acrylic chống trơn trượt tiêu chuẩn thi đấu môn Pickleball mới nhất.',
    viTri: 'Khu B - Cạnh nhà tập bóng rổ',
    hinhAnh: '/src/assets/images/facility_pickleball_court_1792291599694.jpg',
  },
  {
    id: 'kv_cau_long',
    tenKhuVuc: 'Sân cầu lông',
    giaThueGio: 60000,
    trangThai: 'hoạt động',
    moTa: 'Sàn gỗ chuyên dụng trong nhà thể thao đa năng, kín gió, đèn chống lóa.',
    viTri: 'Nhà thi đấu thể dục thể thao tầng 1',
    hinhAnh: '/src/assets/images/facility_badminton_court_1792291600254.jpg',
  },
  {
    id: 'kv_bong_ban',
    tenKhuVuc: 'Khu vực chơi bóng bàn',
    giaThueGio: 40000,
    trangThai: 'hoạt động',
    moTa: 'Phòng 4 bàn bóng bàn tiêu chuẩn kèm vợt và bóng tập luyện, có quạt thông gió thoáng mát.',
    viTri: 'Nhà thi đấu thể dục thể thao tầng 2',
    hinhAnh: '/src/assets/images/facility_table_tennis_1792291599618.jpg',
  },
];

// Helper to generate dynamic dates relative to current date (e.g. today, this week)
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
    // Thứ 2: GV Nam dạy bóng đá buổi sáng tiết 1, 2
    {
      id: 'bk_001',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(monday),
      thu: 'Thứ 2',
      buoi: 'sáng',
      tiet: 1,
      trangThai: 'đã trả',
      thoiGianTra: `07:50 ${formatDateToVN(monday)}`,
      mucDichSuDung: 'Dạy thể dục kỹ thuật chuyền bóng lớp 11A1',
      tongTien: 0,
    },
    {
      id: 'bk_002',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(monday),
      thu: 'Thứ 2',
      buoi: 'sáng',
      tiet: 2,
      trangThai: 'đã trả',
      thoiGianTra: `08:40 ${formatDateToVN(monday)}`,
      mucDichSuDung: 'Dạy thể dục kỹ thuật chuyền bóng lớp 11A2',
      tongTien: 0,
    },
    // Thứ 2: Cô Mai dạy cầu lông buổi sáng tiết 3
    {
      id: 'bk_003',
      idNguoiDung: 'u_gv_mai',
      idKhuVuc: 'kv_cau_long',
      ngaySuDung: formatDateToVN(monday),
      thu: 'Thứ 2',
      buoi: 'sáng',
      tiet: 3,
      trangThai: 'đã trả',
      thoiGianTra: `09:40 ${formatDateToVN(monday)}`,
      mucDichSuDung: 'Dạy kỹ thuật đập cầu lớp 12A2',
      tongTien: 0,
    },
    // Thứ 3: GV Nam dạy bóng bàn buổi chiều tiết 2
    {
      id: 'bk_004',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_ban',
      ngaySuDung: formatDateToVN(tuesday),
      thu: 'Thứ 3',
      buoi: 'chiều',
      tiet: 2,
      trangThai: 'đã trả',
      thoiGianTra: `14:40 ${formatDateToVN(tuesday)}`,
      mucDichSuDung: 'Kiểm tra đánh bóng bàn lớp 10A3',
      tongTien: 0,
    },
    // Thứ 4: Cô Mai mượn sân Pickleball buổi sáng tiết 4
    {
      id: 'bk_005',
      idNguoiDung: 'u_gv_mai',
      idKhuVuc: 'kv_pickleball',
      ngaySuDung: formatDateToVN(wednesday),
      thu: 'Thứ 4',
      buoi: 'sáng',
      tiet: 4,
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Lớp chuyên đề thể thao tự chọn môn Pickleball',
      tongTien: 0,
    },
    // Thứ 5: GV Nam mượn sân bóng đá buổi chiều tiết 3, 4
    {
      id: 'bk_006',
      idNguoiDung: 'u_gv_nam',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(thursday),
      thu: 'Thứ 5',
      buoi: 'chiều',
      tiet: 3,
      trangThai: 'đang sử dụng',
      thoiGianTra: null,
      mucDichSuDung: 'Đội tuyển bóng đá trường tập luyện chuẩn bị giải Quận',
      tongTien: 0,
    },
    // Thứ 6: Cô Mai mượn sân cầu lông tiết 2 buổi sáng
    {
      id: 'bk_007',
      idNguoiDung: 'u_gv_mai',
      idKhuVuc: 'kv_cau_long',
      ngaySuDung: formatDateToVN(friday),
      thu: 'Thứ 6',
      buoi: 'sáng',
      tiet: 2,
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Học thể dục khối 10 tiết giao lưu',
      tongTien: 0,
    },
    // Thứ 7: Học sinh An thuê sân bóng đá 08:00 - 10:00 (2 tiếng = 300.000đ)
    {
      id: 'bk_008',
      idNguoiDung: 'u_hs_an',
      idKhuVuc: 'kv_bong_da',
      ngaySuDung: formatDateToVN(saturday),
      thu: 'Thứ 7',
      gioBatDau: '08:00',
      gioKetThuc: '10:00',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Giao lưu bóng đá lớp 11A1 và 11A2',
      tongTien: 300000,
    },
    // Thứ 7: Học sinh Bình thuê sân Pickleball 15:00 - 17:00 (2 tiếng = 160.000đ)
    {
      id: 'bk_009',
      idNguoiDung: 'u_hs_binh',
      idKhuVuc: 'kv_pickleball',
      ngaySuDung: formatDateToVN(saturday),
      thu: 'Thứ 7',
      gioBatDau: '15:00',
      gioKetThuc: '17:00',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Tập luyện câu lạc bộ Pickleball học sinh',
      tongTien: 160000,
    },
    // Chủ nhật: Học sinh Dũng thuê bàn bóng bàn 09:00 - 11:00 (2 tiếng = 80.000đ)
    {
      id: 'bk_010',
      idNguoiDung: 'u_hs_dung',
      idKhuVuc: 'kv_bong_ban',
      ngaySuDung: formatDateToVN(sunday),
      thu: 'Chủ nhật',
      gioBatDau: '09:00',
      gioKetThuc: '11:00',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'Học sinh tập bóng bàn giải trí cuối tuần',
      tongTien: 80000,
    },
    // Chủ nhật: Học sinh An thuê sân cầu lông 16:00 - 18:00 (2 tiếng = 120.000đ)
    {
      id: 'bk_011',
      idNguoiDung: 'u_hs_an',
      idKhuVuc: 'kv_cau_long',
      ngaySuDung: formatDateToVN(sunday),
      thu: 'Chủ nhật',
      gioBatDau: '16:00',
      gioKetThuc: '18:00',
      trangThai: 'đã đăng ký',
      thoiGianTra: null,
      mucDichSuDung: 'CLB cầu lông học sinh rèn luyện thể lực',
      tongTien: 120000,
    },
  ];
}
