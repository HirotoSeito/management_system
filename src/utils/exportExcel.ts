import * as XLSX from 'xlsx';
import { DangKy, KhuVuc, NguoiDung } from '../types/index.ts';
import { aggregateStatistics, TIET_HOC_INFO } from './bookingRules.ts';

export function exportToExcelFile(
  bookings: DangKy[],
  areas: KhuVuc[],
  users: NguoiDung[],
  fileNamePrefix: string = 'Thong_Ke_Khu_Vuc_The_Thao'
) {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const areaMap = new Map(areas.map((a) => [a.id, a]));

  // Sheet 1: Danh sách chi tiết các lượt đăng ký
  const sheet1Data = bookings.map((b, idx) => {
    const user = userMap.get(b.idNguoiDung);
    const area = areaMap.get(b.idKhuVuc);

    let thoiGianSuDung = '';
    if (b.gioBatDau && b.gioKetThuc) {
      thoiGianSuDung = `${b.gioBatDau} - ${b.gioKetThuc} (Theo giờ)`;
    } else if (b.buoi && b.tiet) {
      const tietDetail = TIET_HOC_INFO[b.buoi]?.[b.tiet]?.thoiGian || '';
      thoiGianSuDung = `Buổi ${b.buoi} - Tiết ${b.tiet} (${tietDetail})`;
    }

    return {
      'STT': idx + 1,
      'Mã Đăng Ký': b.id,
      'Họ Và Tên': user?.hoTen || 'Không xác định',
      'Vai Trò':
        user?.idVaiTro === 'admin'
          ? 'Quản trị viên'
          : user?.idVaiTro === 'bgh'
          ? 'Ban giám hiệu'
          : user?.idVaiTro === 'giao_vien'
          ? 'Giáo viên'
          : 'Học sinh',
      'Lớp': user?.lop || '-',
      'Khu Vực Thể Thao': area?.tenKhuVuc || 'Chưa rõ',
      'Ngày Sử Dụng': b.ngaySuDung,
      'Thứ': b.thu,
      'Thời Gian Đăng Ký': thoiGianSuDung,
      'Mục Đích Sử Dụng': b.mucDichSuDung || 'Học tập / Rèn luyện',
      'Trạng Thái':
        b.trangThai === 'đã đăng ký'
          ? 'Đã đăng ký'
          : b.trangThai === 'đang sử dụng'
          ? 'Đang sử dụng'
          : b.trangThai === 'đã trả'
          ? 'Đã trả'
          : 'Đã hủy',
      'Thời Điểm Trả Thực Tế': b.thoiGianTra || (b.trangThai === 'đã trả' ? 'Đã ghi nhận trả' : 'Chưa trả'),
      'Phí Thuê (VNĐ)': b.tongTien ? b.tongTien.toLocaleString('vi-VN') + ' đ' : 'Miễn phí (Giảng dạy)',
    };
  });

  // Sheet 2: Thống kê theo khu vực
  const { areaStats, userStats } = aggregateStatistics(bookings, areas, users);

  const sheet2Data = areaStats.map((item, idx) => ({
    'STT': idx + 1,
    'Tên Khu Vực': item.tenKhuVuc,
    'Số Lượt Đăng Ký': item.soLuotDangKy,
    'Tổng Thời Gian (Giờ)': item.tongThoiGianGio,
    'Số Lượt Đang Sử Dụng': item.soLuotDangSuDung,
    'Số Lượt Đã Hoàn Trả': item.soLuotDaTra,
    'Doanh Thu Thuê (VNĐ)': item.tongTienThu.toLocaleString('vi-VN') + ' đ',
  }));

  // Sheet 3: Thống kê theo người dùng
  const sheet3Data = userStats.map((item, idx) => ({
    'STT': idx + 1,
    'Họ Và Tên': item.hoTen,
    'Vai Trò': item.tenVaiTro,
    'Lớp': item.lop || '-',
    'Số Lượt Đăng Ký / Mượn': item.soLuotDangKy,
    'Tổng Thời Gian Sử Dụng (Giờ)': item.tongThoiGianGio,
    'Tổng Tiền Thuê (VNĐ)': item.tongChiPhi.toLocaleString('vi-VN') + ' đ',
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);

  // Set column widths for sheet 1
  ws1['!cols'] = [
    { wch: 6 },  // STT
    { wch: 12 }, // Mã Đăng Ký
    { wch: 26 }, // Họ tên
    { wch: 15 }, // Vai trò
    { wch: 10 }, // Lớp
    { wch: 22 }, // Khu vực
    { wch: 14 }, // Ngày
    { wch: 10 }, // Thứ
    { wch: 28 }, // Thời gian
    { wch: 32 }, // Mục đích
    { wch: 16 }, // Trạng thái
    { wch: 22 }, // Thời điểm trả
    { wch: 20 }, // Phí
  ];

  ws2['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
  ];

  ws3['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 16 },
    { wch: 10 },
    { wch: 24 },
    { wch: 28 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Lượt Đăng Ký');
  XLSX.utils.book_append_sheet(wb, ws2, 'Thống Kê Khu Vực');
  XLSX.utils.book_append_sheet(wb, ws3, 'Thống Kê Người Dùng');

  const nowStr = new Date().toISOString().slice(0, 10);
  const fileName = `${fileNamePrefix}_${nowStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
