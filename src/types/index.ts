/**
 * Database schema and types for:
 * Hệ thống quản lý khu vực thể thao của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.
 *
 * 1. vaiTro
 * 2. nguoiDung
 * 3. khuVuc
 * 4. dangKy
 */

export type VaiTroId = 'admin' | 'bgh' | 'giao_vien' | 'hoc_sinh';

export interface VaiTro {
  id: VaiTroId;
  tenVaiTro: 'Quản trị viên' | 'Ban giám hiệu' | 'Giáo viên' | 'Học sinh';
}

export type TrangThaiNguoiDung = 'hoạt động' | 'bị khóa';

export interface NguoiDung {
  id: string;
  tenDangNhap: string;
  idVaiTro: VaiTroId;
  matKhau: string;
  hoTen: string;
  lop?: string; // Lớp của học sinh (khối 10, 11, 12: Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn); để trống với vai trò khác
  trangThai: TrangThaiNguoiDung;
  ngayTao: string; // dd/mm/yyyy
  soDienThoai?: string;
  email?: string;
}

export type TrangThaiKhuVuc = 'hoạt động' | 'bảo trì' | 'ngừng sử dụng';

export interface KhuVuc {
  id: string;
  tenKhuVuc: string; // Sân bóng đá, Sân Pickleball, Sân cầu lông, Khu vực chơi bóng bàn
  giaThueGio: number; // đồng/giờ dành cho học sinh vào thứ 7, CN
  trangThai: TrangThaiKhuVuc;
  moTa?: string;
  hinhAnh?: string;
  viTri?: string;
}

export type ThuTrongTuan = 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7' | 'Chủ nhật';
export type BuoiTrongNgay = 'sáng' | 'chiều';
export type TietHoc = 1 | 2 | 3 | 4 | 5;
export type TrangThaiDangKy = 'đã đăng ký' | 'đang sử dụng' | 'đã trả' | 'đã hủy';

export interface DangKy {
  id: string;
  idNguoiDung: string;
  idKhuVuc: string;
  ngaySuDung: string; // dd/mm/yyyy
  thu: ThuTrongTuan;
  buoi?: BuoiTrongNgay; // sáng, chiều (cho T2 - T6)
  tiet?: TietHoc; // 1, 2, 3, 4, 5 (cho giáo viên T2 - T6)
  lop?: string; // Lớp sử dụng (khối 10, 11, 12: Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn) - giáo viên chọn khi đăng ký theo tiết hoặc lấy từ tài khoản HS
  gioBatDau?: string; // HH:mm (cho học sinh T7, CN)
  gioKetThuc?: string; // HH:mm (cho học sinh T7, CN)
  trangThai: TrangThaiDangKy;
  thoiGianTra?: string | null; // Thời điểm thực tế trả khu vực (VD: "10:35 18/10/2026")
  mucDichSuDung?: string; // VD: Giảng dạy môn Bóng đá lớp 11 Toán, Tập luyện giải đấu
  tongTien?: number; // Giá thuê tính theo giờ cho học sinh
}

// Aggregated statistical summaries
export interface ThongKeKhuVuc {
  idKhuVuc: string;
  tenKhuVuc: string;
  soLuotDangKy: number;
  tongThoiGianGio: number;
  tongTienThu: number;
  soLuotDangSuDung: number;
  soLuotDaTra: number;
}

export interface ThongKeNguoiDung {
  idNguoiDung: string;
  hoTen: string;
  tenVaiTro: string;
  lop?: string;
  soLuotDangKy: number;
  tongThoiGianGio: number;
  tongChiPhi: number;
}
