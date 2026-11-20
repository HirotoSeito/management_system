import ExcelJS from 'exceljs';
import type { DangKy, KhuVuc, NguoiDung, VaiTroId } from '../types/index.ts';
import {
  aggregateStatistics,
  getBookingHours,
  getBookingCollectedRevenue,
  TIET_HOC_INFO,
  DANH_SACH_LOP_CHUYEN,
  isValidLopChuyen,
  formatDateToVN,
} from './bookingRules.ts';

function downloadWorkbook(wb: ExcelJS.Workbook, fileName: string) {
  return wb.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

function styleHeaderRow(row: ExcelJS.Row, fillHex = '065F46') {
  row.height = 24;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${fillHex}` },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };
  });
}

function styleTotalRow(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF0F172A' }, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFECFDF5' },
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF059669' } },
      bottom: { style: 'double', color: { argb: 'FF059669' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };
  });
}

export async function exportToExcelFile(
  bookings: DangKy[],
  areas: KhuVuc[],
  users: NguoiDung[],
  fileNamePrefix: string = 'Thong_Ke_Khu_Vuc_The_Thao'
) {
  const userMap = new Map(users.map((u) => [u.id, u]));
  const areaMap = new Map(areas.map((a) => [a.id, a]));
  const now = new Date();

  const validBookings = bookings.filter((b) => b.trangThai !== 'đã hủy');
  const { areaStats, userStats } = aggregateStatistics(validBookings, areas, users, now);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Hệ thống Quản lý Khu vực Thể thao - THPT Chuyên Lê Quý Đôn Nam Nha Trang';
  wb.created = now;

  // =========================================================================
  // SHEET 1: Lượt Đăng Ký (Chi tiết, số liệu tiền và giờ là dạng số thực)
  // =========================================================================
  const ws1 = wb.addWorksheet('Lượt Đăng Ký', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws1.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Mã Đăng Ký', key: 'id', width: 22 },
    { header: 'Họ Và Tên', key: 'hoTen', width: 26 },
    { header: 'Vai Trò', key: 'vaiTro', width: 16 },
    { header: 'Lớp Sử Dụng', key: 'lop', width: 14 },
    { header: 'Khu Vực Thể Thao', key: 'khuVuc', width: 22 },
    { header: 'Ngày Sử Dụng', key: 'ngay', width: 14 },
    { header: 'Thứ', key: 'thu', width: 11 },
    { header: 'Thời Gian Đăng Ký', key: 'thoiGian', width: 30 },
    { header: 'Mục Đích Sử Dụng', key: 'mucDich', width: 32 },
    { header: 'Trạng Thái', key: 'trangThai', width: 16 },
    { header: 'Thời Điểm Trả Thực Tế', key: 'thoiGianTra', width: 22 },
    { header: 'Giờ Thực Tế (h)', key: 'gioThucTe', width: 16 },
    { header: 'Phí Thuê Thực Thu (VNĐ)', key: 'phiThue', width: 22 },
  ];
  styleHeaderRow(ws1.getRow(1));

  validBookings.forEach((b, idx) => {
    const user = userMap.get(b.idNguoiDung);
    const area = areaMap.get(b.idKhuVuc);

    let thoiGianSuDung = '';
    if (b.gioBatDau && b.gioKetThuc) {
      thoiGianSuDung = `${b.gioBatDau} - ${b.gioKetThuc} (Theo giờ)`;
    } else if (b.buoi && b.tiet) {
      const tietDetail = TIET_HOC_INFO[b.buoi]?.[b.tiet]?.thoiGian || '';
      thoiGianSuDung = `Buổi ${b.buoi} - Tiết ${b.tiet} (${tietDetail})`;
    }

    const statusLabel =
      b.trangThai === 'đã đăng ký'
        ? 'Đã đăng ký'
        : b.trangThai === 'đang sử dụng'
        ? 'Đang sử dụng'
        : b.trangThai === 'đã trả'
        ? 'Đã trả'
        : b.trangThai === 'quá hạn'
        ? 'Quá hạn (Không nhận sân)'
        : 'Đã hủy';

    const row = ws1.addRow({
      stt: idx + 1,
      id: b.id,
      hoTen: user?.hoTen || 'Không xác định',
      vaiTro:
        user?.idVaiTro === 'admin'
          ? 'Quản trị viên'
          : user?.idVaiTro === 'bgh'
          ? 'Ban giám hiệu'
          : user?.idVaiTro === 'giao_vien'
          ? 'Giáo viên'
          : 'Học sinh',
      lop: b.lop || user?.lop || '-',
      khuVuc: area?.tenKhuVuc || 'Chưa rõ',
      ngay: b.ngaySuDung,
      thu: b.thu,
      thoiGian: thoiGianSuDung,
      mucDich: b.mucDichSuDung || 'Học tập / Rèn luyện',
      trangThai: statusLabel,
      thoiGianTra: b.thoiGianTra || (b.trangThai === 'đã trả' ? 'Đã ghi nhận trả' : 'Chưa trả'),
      gioThucTe: Math.round(getBookingHours(b, now) * 100) / 100,
      phiThue: getBookingCollectedRevenue(b),
    });

    row.getCell('stt').numFmt = '#,##0';
    row.getCell('gioThucTe').numFmt = '0.00';
    row.getCell('phiThue').numFmt = '#,##0" đ"';
  });

  if (validBookings.length > 0) {
    const lastDataRow = validBookings.length + 1;
    const sumRow = ws1.addRow({
      stt: '',
      id: 'TỔNG CỘNG',
      hoTen: '',
      vaiTro: '',
      lop: '',
      khuVuc: '',
      ngay: '',
      thu: '',
      thoiGian: '',
      mucDich: `Tổng hợp ${validBookings.length} lượt hợp lệ`,
      trangThai: '',
      thoiGianTra: '',
      gioThucTe: { formula: `SUM(M2:M${lastDataRow})` },
      phiThue: { formula: `SUM(N2:N${lastDataRow})` },
    });
    sumRow.getCell('gioThucTe').numFmt = '0.00';
    sumRow.getCell('phiThue').numFmt = '#,##0" đ"';
    styleTotalRow(sumRow);
  }

  // =========================================================================
  // SHEET 2: Thống Kê Khu Vực
  // =========================================================================
  const ws2 = wb.addWorksheet('Thống Kê Khu Vực', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws2.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Tên Khu Vực', key: 'tenKhuVuc', width: 26 },
    { header: 'Số Lượt Đăng Ký', key: 'soLuotDangKy', width: 18 },
    { header: 'Giờ Sử Dụng Thực Tế (h)', key: 'tongThoiGianGio', width: 24 },
    { header: 'Chờ Sử Dụng', key: 'choSuDung', width: 14 },
    { header: 'Đang Sử Dụng', key: 'dangSuDung', width: 16 },
    { header: 'Đã Hoàn Trả', key: 'daTra', width: 14 },
    { header: 'Quá Hạn', key: 'quaHan', width: 12 },
    { header: 'Doanh Thu Thực Thu (VNĐ)', key: 'doanhThu', width: 24 },
  ];
  styleHeaderRow(ws2.getRow(1));

  areaStats.forEach((item, idx) => {
    const row = ws2.addRow({
      stt: idx + 1,
      tenKhuVuc: item.tenKhuVuc,
      soLuotDangKy: item.soLuotDangKy,
      tongThoiGianGio: item.tongThoiGianGio,
      choSuDung: item.soLuotChoSuDung,
      dangSuDung: item.soLuotDangSuDung,
      daTra: item.soLuotDaTra,
      quaHan: item.soLuotQuaHan,
      doanhThu: item.tongTienThu,
    });
    row.getCell('stt').numFmt = '#,##0';
    row.getCell('soLuotDangKy').numFmt = '#,##0';
    row.getCell('tongThoiGianGio').numFmt = '0.00';
    row.getCell('choSuDung').numFmt = '#,##0';
    row.getCell('dangSuDung').numFmt = '#,##0';
    row.getCell('daTra').numFmt = '#,##0';
    row.getCell('quaHan').numFmt = '#,##0';
    row.getCell('doanhThu').numFmt = '#,##0" đ"';
  });

  if (areaStats.length > 0) {
    const lastRow2 = areaStats.length + 1;
    const sumRow2 = ws2.addRow({
      stt: '',
      tenKhuVuc: 'TỔNG CỘNG',
      soLuotDangKy: { formula: `SUM(C2:C${lastRow2})` },
      tongThoiGianGio: { formula: `SUM(D2:D${lastRow2})` },
      choSuDung: { formula: `SUM(E2:E${lastRow2})` },
      dangSuDung: { formula: `SUM(F2:F${lastRow2})` },
      daTra: { formula: `SUM(G2:G${lastRow2})` },
      quaHan: { formula: `SUM(H2:H${lastRow2})` },
      doanhThu: { formula: `SUM(I2:I${lastRow2})` },
    });
    sumRow2.getCell('soLuotDangKy').numFmt = '#,##0';
    sumRow2.getCell('tongThoiGianGio').numFmt = '0.00';
    sumRow2.getCell('choSuDung').numFmt = '#,##0';
    sumRow2.getCell('dangSuDung').numFmt = '#,##0';
    sumRow2.getCell('daTra').numFmt = '#,##0';
    sumRow2.getCell('quaHan').numFmt = '#,##0';
    sumRow2.getCell('doanhThu').numFmt = '#,##0" đ"';
    styleTotalRow(sumRow2);
  }

  // =========================================================================
  // SHEET 3: Thống Kê Người Dùng
  // =========================================================================
  const ws3 = wb.addWorksheet('Thống Kê Người Dùng', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws3.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Họ Và Tên', key: 'hoTen', width: 28 },
    { header: 'Vai Trò', key: 'tenVaiTro', width: 18 },
    { header: 'Lớp', key: 'lop', width: 12 },
    { header: 'Số Lượt Đăng Ký / Mượn', key: 'soLuot', width: 24 },
    { header: 'Tổng Giờ Thực Tế (h)', key: 'tongGio', width: 22 },
    { header: 'Tổng Tiền Thực Thu (VNĐ)', key: 'tongChiPhi', width: 24 },
  ];
  styleHeaderRow(ws3.getRow(1));

  userStats.forEach((item, idx) => {
    const row = ws3.addRow({
      stt: idx + 1,
      hoTen: item.hoTen,
      tenVaiTro: item.tenVaiTro,
      lop: item.lop || '-',
      soLuot: item.soLuotDangKy,
      tongGio: item.tongThoiGianGio,
      tongChiPhi: item.tongChiPhi,
    });
    row.getCell('stt').numFmt = '#,##0';
    row.getCell('soLuot').numFmt = '#,##0';
    row.getCell('tongGio').numFmt = '0.00';
    row.getCell('tongChiPhi').numFmt = '#,##0" đ"';
  });

  if (userStats.length > 0) {
    const lastRow3 = userStats.length + 1;
    const sumRow3 = ws3.addRow({
      stt: '',
      hoTen: 'TỔNG CỘNG',
      tenVaiTro: '',
      lop: '',
      soLuot: { formula: `SUM(E2:E${lastRow3})` },
      tongGio: { formula: `SUM(F2:F${lastRow3})` },
      tongChiPhi: { formula: `SUM(G2:G${lastRow3})` },
    });
    sumRow3.getCell('soLuot').numFmt = '#,##0';
    sumRow3.getCell('tongGio').numFmt = '0.00';
    sumRow3.getCell('tongChiPhi').numFmt = '#,##0" đ"';
    styleTotalRow(sumRow3);
  }

  const nowStr = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(wb, `${fileNamePrefix}_${nowStr}.xlsx`);
}

export async function downloadUserTemplateExcel() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Danh_Sach_Mau');

  ws.columns = [
    { header: 'Tên đăng nhập', key: 'username', width: 20 },
    { header: 'Mật khẩu', key: 'password', width: 16 },
    { header: 'Họ và tên', key: 'fullName', width: 28 },
    { header: 'Vai trò (Học sinh / Giáo viên / Ban giám hiệu / Quản trị viên)', key: 'role', width: 38 },
    { header: 'Lớp chuyên (Nếu là học sinh: 10 Toán, 11 Lý,...)', key: 'lop', width: 32 },
    { header: 'Số điện thoại', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
  ];
  styleHeaderRow(ws.getRow(1), '1E293B');

  ws.addRow({
    username: 'hs_minh_tri',
    password: '123456',
    fullName: 'Nguyễn Minh Trí',
    role: 'Học sinh',
    lop: '11 Toán',
    phone: '0912345678',
    email: 'tri.nm@lequydon-nt.edu.vn',
  });
  ws.addRow({
    username: 'gv_thanh',
    password: '123456',
    fullName: 'Thầy Trần Văn Thành',
    role: 'Giáo viên',
    lop: '',
    phone: '0987654321',
    email: 'thanhtv@lequydon-nt.edu.vn',
  });

  await downloadWorkbook(wb, 'Mau_Nhap_Tai_Khoan_LeQuyDon.xlsx');
}

export async function exportUsersExcel(users: NguoiDung[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Nguoi_Dung', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Mã ID', key: 'id', width: 22 },
    { header: 'Tên đăng nhập', key: 'tenDangNhap', width: 18 },
    { header: 'Họ và tên', key: 'hoTen', width: 28 },
    { header: 'Vai trò', key: 'vaiTro', width: 18 },
    { header: 'Lớp', key: 'lop', width: 14 },
    { header: 'Trạng thái', key: 'trangThai', width: 14 },
    { header: 'Ngày tạo', key: 'ngayTao', width: 14 },
    { header: 'Số điện thoại', key: 'soDienThoai', width: 16 },
    { header: 'Email', key: 'email', width: 26 },
  ];
  styleHeaderRow(ws.getRow(1), '1E293B');

  users.forEach((u, idx) => {
    ws.addRow({
      stt: idx + 1,
      id: u.id,
      tenDangNhap: u.tenDangNhap,
      hoTen: u.hoTen,
      vaiTro:
        u.idVaiTro === 'admin'
          ? 'Quản trị viên'
          : u.idVaiTro === 'bgh'
          ? 'Ban giám hiệu'
          : u.idVaiTro === 'giao_vien'
          ? 'Giáo viên'
          : 'Học sinh',
      lop: u.lop || '—',
      trangThai: u.trangThai,
      ngayTao: u.ngayTao,
      soDienThoai: u.soDienThoai || '—',
      email: u.email || '—',
    });
  });

  await downloadWorkbook(
    wb,
    `Danh_Sach_Nguoi_Dung_LQD_${formatDateToVN(new Date()).replace(/\//g, '-')}.xlsx`
  );
}

function getCellText(cell: ExcelJS.Cell): string {
  const val = cell.value;
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if ('text' in val && typeof val.text === 'string') return val.text.trim();
    if ('richText' in val && Array.isArray(val.richText)) {
      return val.richText.map((r) => r.text).join('').trim();
    }
    if ('result' in val && val.result !== undefined) return String(val.result).trim();
  }
  return String(val).trim();
}

export async function parseUsersFromExcelBuffer(
  buffer: ArrayBuffer,
  existingUsers: NguoiDung[]
): Promise<{
  validUsers: Array<NguoiDung & { matKhau: string }>;
  errors: string[];
}> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.worksheets[0];
  if (!ws || ws.rowCount < 2) {
    return {
      validUsers: [],
      errors: ['File Excel trống hoặc chưa có dòng dữ liệu nào dưới dòng tiêu đề.'],
    };
  }

  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = getCellText(cell).toLowerCase();
  });

  const findCol = (...keywords: string[]): number => {
    for (let i = 1; i < headers.length; i++) {
      const h = headers[i] || '';
      if (keywords.some((k) => h.includes(k))) return i;
    }
    return -1;
  };

  const colUsername = findCol('tên đăng nhập', 'tendangnhap', 'username', 'taikhoan');
  const colPassword = findCol('mật khẩu', 'matkhau', 'password');
  const colFullName = findCol('họ và tên', 'hoten', 'fullname');
  const colRole = findCol('vai trò', 'idvaitro', 'role');
  const colLop = findCol('lớp', 'lop');
  const colPhone = findCol('điện thoại', 'sodienthoai', 'phone');
  const colEmail = findCol('email');

  if (colUsername === -1 || colFullName === -1) {
    return {
      validUsers: [],
      errors: ['File Excel thiếu cột bắt buộc "Tên đăng nhập" hoặc "Họ và tên". Vui lòng dùng file mẫu chuẩn.'],
    };
  }

  const validUsers: Array<NguoiDung & { matKhau: string }> = [];
  const errors: string[] = [];
  const seenUsernames = new Set(existingUsers.map((u) => u.tenDangNhap.toLowerCase()));
  const todayStr = formatDateToVN(new Date());

  for (let rowIdx = 2; rowIdx <= ws.rowCount; rowIdx++) {
    const row = ws.getRow(rowIdx);
    const username = getCellText(row.getCell(colUsername)).toLowerCase();
    const fullName = getCellText(row.getCell(colFullName));

    // Skip completely empty rows
    if (!username && !fullName) continue;

    if (!username || !fullName) {
      errors.push(`Dòng ${rowIdx}: Thiếu tên đăng nhập hoặc họ và tên.`);
      continue;
    }

    if (seenUsernames.has(username)) {
      errors.push(`Dòng ${rowIdx}: Tên đăng nhập "@${username}" đã tồn tại hoặc bị trùng trong file.`);
      continue;
    }

    const rawPassword = colPassword !== -1 ? getCellText(row.getCell(colPassword)) : '';
    const rawRole = colRole !== -1 ? getCellText(row.getCell(colRole)).toLowerCase() : 'học sinh';
    const rawLop = colLop !== -1 ? getCellText(row.getCell(colLop)) : '';
    const rawPhone = colPhone !== -1 ? getCellText(row.getCell(colPhone)) : '';
    const rawEmail = colEmail !== -1 ? getCellText(row.getCell(colEmail)) : '';

    let roleId: VaiTroId = 'hoc_sinh';
    if (rawRole.includes('quản trị') || rawRole.includes('admin')) {
      roleId = 'admin';
    } else if (rawRole.includes('giám hiệu') || rawRole.includes('bgh')) {
      roleId = 'bgh';
    } else if (rawRole.includes('giáo viên') || rawRole.includes('gv')) {
      roleId = 'giao_vien';
    } else {
      roleId = 'hoc_sinh';
    }

    if (roleId === 'hoc_sinh' && !isValidLopChuyen(rawLop)) {
      errors.push(
        `Dòng ${rowIdx} (@${username}): Lớp "${rawLop || '(trống)'}" không hợp lệ. Phải thuộc 24 lớp chuyên (${DANH_SACH_LOP_CHUYEN.slice(0, 4).join(', ')}...).`
      );
      continue;
    }

    seenUsernames.add(username);

    validUsers.push({
      id: `u_${crypto.randomUUID()}`,
      tenDangNhap: username,
      matKhau: rawPassword || '123456',
      hoTen: fullName,
      idVaiTro: roleId,
      lop: roleId === 'hoc_sinh' ? rawLop.trim() : undefined,
      soDienThoai: rawPhone || undefined,
      email: rawEmail || undefined,
      trangThai: 'hoạt động',
      ngayTao: todayStr,
    });
  }

  return { validUsers, errors };
}
