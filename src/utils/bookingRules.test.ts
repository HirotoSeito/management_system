import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateToVN,
  vnDateToIso,
  isoDateToVN,
  getThuTrongTuan,
  isCuoiTuan,
  doTimesOverlap,
  calculateRentalCost,
  checkBookingConflict,
  aggregateStatistics,
  DANH_SACH_LOP_CHUYEN,
} from './bookingRules.ts';
import type { DangKy, KhuVuc, NguoiDung } from '../types/index.ts';

test('date conversion and day of week helpers', () => {
  // Test specific date: 2026-10-19 is Monday (Thứ 2)
  const monday = new Date(2026, 9, 19);
  assert.equal(formatDateToVN(monday), '19/10/2026');
  assert.equal(getThuTrongTuan(monday), 'Thứ 2');
  assert.equal(isCuoiTuan('Thứ 2'), false);

  // 2026-10-24 is Saturday (Thứ 7)
  const saturday = new Date(2026, 9, 24);
  assert.equal(getThuTrongTuan(saturday), 'Thứ 7');
  assert.equal(isCuoiTuan('Thứ 7'), true);

  // 2026-10-25 is Sunday (Chủ nhật)
  const sunday = new Date(2026, 9, 25);
  assert.equal(getThuTrongTuan(sunday), 'Chủ nhật');
  assert.equal(isCuoiTuan('Chủ nhật'), true);

  // Conversions between VN dd/mm/yyyy and ISO yyyy-mm-dd
  assert.equal(vnDateToIso('19/10/2026'), '2026-10-19');
  assert.equal(isoDateToVN('2026-10-19'), '19/10/2026');
});

test('hourly overlap detection', () => {
  // Overlapping cases
  assert.equal(doTimesOverlap('08:00', '10:00', '09:00', '11:00'), true);
  assert.equal(doTimesOverlap('08:00', '11:00', '09:00', '10:00'), true);
  assert.equal(doTimesOverlap('09:00', '10:00', '08:00', '11:00'), true);

  // Non-overlapping cases (back-to-back or separate)
  assert.equal(doTimesOverlap('08:00', '09:00', '09:00', '10:00'), false);
  assert.equal(doTimesOverlap('08:00', '09:00', '14:00', '15:00'), false);
});

test('calculateRentalCost calculates exact hourly pricing', () => {
  const ratePerHour = 100000; // 100.000đ/giờ
  assert.equal(calculateRentalCost(ratePerHour, '08:00', '10:00'), 200000);
  assert.equal(calculateRentalCost(ratePerHour, '08:00', '09:30'), 150000);
  assert.equal(calculateRentalCost(ratePerHour, '10:00', '08:00'), 0); // Invalid range
});

test('checkBookingConflict: rejects non-active facility', () => {
  const areaMaintenance: KhuVuc = {
    id: 'kv_1',
    tenKhuVuc: 'Sân bóng đá',
    giaThueGio: 150000,
    trangThai: 'bảo trì',
  };

  const result = checkBookingConflict([], areaMaintenance, {
    ngaySuDung: '19/10/2026',
    thu: 'Thứ 2',
    buoi: 'sáng',
    tiet: 1,
  });

  assert.equal(result.hasConflict, true);
  assert.match(result.reason || '', /bảo trì/);
});

test('checkBookingConflict: detects teacher weekday period clash', () => {
  const area: KhuVuc = {
    id: 'kv_bd',
    tenKhuVuc: 'Sân bóng đá',
    giaThueGio: 150000,
    trangThai: 'hoạt động',
  };

  const existingBooking: DangKy = {
    id: 'bk_1',
    idNguoiDung: 'user_gv1',
    idKhuVuc: 'kv_bd',
    ngaySuDung: '19/10/2026',
    thu: 'Thứ 2',
    buoi: 'sáng',
    tiet: 2,
    trangThai: 'đã đăng ký',
  };

  // Attempting to book the same area, same date, same buoi, same tiet
  const resultClash = checkBookingConflict([existingBooking], area, {
    ngaySuDung: '19/10/2026',
    thu: 'Thứ 2',
    buoi: 'sáng',
    tiet: 2,
  });
  assert.equal(resultClash.hasConflict, true);
  assert.match(resultClash.reason || '', /Trùng lịch/);

  // Different period (Tiết 3) on the same morning -> Allowed!
  const resultValid = checkBookingConflict([existingBooking], area, {
    ngaySuDung: '19/10/2026',
    thu: 'Thứ 2',
    buoi: 'sáng',
    tiet: 3,
  });
  assert.equal(resultValid.hasConflict, false);

  // Cancelled booking should NOT block new booking
  const cancelledBooking: DangKy = {
    ...existingBooking,
    id: 'bk_cancelled',
    tiet: 4,
    trangThai: 'đã hủy',
  };
  const resultCancelled = checkBookingConflict([cancelledBooking], area, {
    ngaySuDung: '19/10/2026',
    thu: 'Thứ 2',
    buoi: 'sáng',
    tiet: 4,
  });
  assert.equal(resultCancelled.hasConflict, false);
});

test('checkBookingConflict: detects student weekend hourly overlap', () => {
  const area: KhuVuc = {
    id: 'kv_pb',
    tenKhuVuc: 'Sân Pickleball',
    giaThueGio: 80000,
    trangThai: 'hoạt động',
  };

  const existingBooking: DangKy = {
    id: 'bk_pb_1',
    idNguoiDung: 'user_hs1',
    idKhuVuc: 'kv_pb',
    ngaySuDung: '24/10/2026',
    thu: 'Thứ 7',
    gioBatDau: '08:00',
    gioKetThuc: '10:00',
    trangThai: 'đã đăng ký',
  };

  // Overlap: 09:00 to 11:00
  const resultOverlap = checkBookingConflict([existingBooking], area, {
    ngaySuDung: '24/10/2026',
    thu: 'Thứ 7',
    gioBatDau: '09:00',
    gioKetThuc: '11:00',
  });
  assert.equal(resultOverlap.hasConflict, true);

  // Adjacent: 10:00 to 12:00 -> Allowed!
  const resultNonOverlap = checkBookingConflict([existingBooking], area, {
    ngaySuDung: '24/10/2026',
    thu: 'Thứ 7',
    gioBatDau: '10:00',
    gioKetThuc: '12:00',
  });
  assert.equal(resultNonOverlap.hasConflict, false);
});

test('aggregateStatistics: summarizes area and user usage accurately', () => {
  const areas: KhuVuc[] = [
    { id: 'kv_1', tenKhuVuc: 'Sân bóng đá', giaThueGio: 150000, trangThai: 'hoạt động' },
    { id: 'kv_2', tenKhuVuc: 'Sân Pickleball', giaThueGio: 80000, trangThai: 'hoạt động' },
  ];

  const users: NguoiDung[] = [
    {
      id: 'u_1',
      tenDangNhap: 'gv_nam',
      idVaiTro: 'giao_vien',
      matKhau: '123',
      hoTen: 'Nguyễn Văn Nam',
      trangThai: 'hoạt động',
      ngayTao: '01/09/2026',
    },
    {
      id: 'u_2',
      tenDangNhap: 'hs_an',
      idVaiTro: 'hoc_sinh',
      matKhau: '123',
      hoTen: 'Lê Văn An',
      lop: '11A1',
      trangThai: 'hoạt động',
      ngayTao: '05/09/2026',
    },
  ];

  const bookings: DangKy[] = [
    {
      id: 'b1',
      idNguoiDung: 'u_1',
      idKhuVuc: 'kv_1',
      ngaySuDung: '19/10/2026',
      thu: 'Thứ 2',
      buoi: 'sáng',
      tiet: 1,
      trangThai: 'đã trả',
    },
    {
      id: 'b2',
      idNguoiDung: 'u_2',
      idKhuVuc: 'kv_2',
      ngaySuDung: '24/10/2026',
      thu: 'Thứ 7',
      gioBatDau: '08:00',
      gioKetThuc: '10:00',
      trangThai: 'đang sử dụng',
      tongTien: 160000,
    },
  ];

  const stats = aggregateStatistics(bookings, areas, users);

  assert.equal(stats.totalBookings, 2);
  assert.equal(stats.totalRevenue, 160000);
  assert.equal(stats.areaStats.find((a) => a.idKhuVuc === 'kv_1')?.soLuotDangKy, 1);
  assert.equal(stats.areaStats.find((a) => a.idKhuVuc === 'kv_2')?.tongTienThu, 160000);
  assert.equal(stats.userStats.find((u) => u.idNguoiDung === 'u_2')?.tongChiPhi, 160000);
});

test('DANH_SACH_LOP_CHUYEN contains 24 classes for grades 10, 11, 12', () => {
  assert.equal(DANH_SACH_LOP_CHUYEN.length, 24);
  assert.ok(DANH_SACH_LOP_CHUYEN.includes('10 Toán'));
  assert.ok(DANH_SACH_LOP_CHUYEN.includes('11 Anh 1'));
  assert.ok(DANH_SACH_LOP_CHUYEN.includes('12 Văn'));
  assert.ok(DANH_SACH_LOP_CHUYEN.includes('10 Tin'));
});
