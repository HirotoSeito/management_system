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
  calculateBookingCost,
  calculateActualReturnCost,
  checkBookingConflict,
  filterBookingsByTimeframe,
  getBookingHours,
  aggregateStatistics,
  canEditOrCancelBooking,
  isBookingOverdueReturn,
  isBookingNoShow,
  getEffectiveWeekendInterval,
  isValidLopChuyen,
  DANH_SACH_LOP_CHUYEN,
} from './bookingRules.ts';
import type { DangKy, KhuVuc, NguoiDung } from '../types/index.ts';

const FUTURE_MONDAY = '16/11/2026';
const FUTURE_SATURDAY = '21/11/2026';
const NOW_REF = new Date(2026, 10, 15, 10, 0); // 15/11/2026 10:00 (Sunday before 16/11 & 21/11)

test('date conversion and day of week helpers', () => {
  const monday = new Date(2026, 9, 19);
  assert.equal(formatDateToVN(monday), '19/10/2026');
  assert.equal(getThuTrongTuan(monday), 'Thứ 2');
  assert.equal(isCuoiTuan('Thứ 2'), false);

  const saturday = new Date(2026, 9, 24);
  assert.equal(getThuTrongTuan(saturday), 'Thứ 7');
  assert.equal(isCuoiTuan('Thứ 7'), true);

  const sunday = new Date(2026, 9, 25);
  assert.equal(getThuTrongTuan(sunday), 'Chủ nhật');
  assert.equal(isCuoiTuan('Chủ nhật'), true);

  assert.equal(vnDateToIso('19/10/2026'), '2026-10-19');
  assert.equal(isoDateToVN('2026-10-19'), '19/10/2026');
});

test('hourly overlap detection', () => {
  assert.equal(doTimesOverlap('08:00', '10:00', '09:00', '11:00'), true);
  assert.equal(doTimesOverlap('08:00', '11:00', '09:00', '10:00'), true);
  assert.equal(doTimesOverlap('09:00', '10:00', '08:00', '11:00'), true);
  assert.equal(doTimesOverlap('08:00', '09:00', '09:00', '10:00'), false);
  assert.equal(doTimesOverlap('08:00', '09:00', '14:00', '15:00'), false);
});

test('calculateBookingCost charges ONLY students on weekends', () => {
  const ratePerHour = 100000;
  assert.equal(calculateRentalCost(ratePerHour, '08:00', '10:00'), 200000);
  assert.equal(calculateRentalCost(ratePerHour, '08:00', '09:30'), 150000);
  assert.equal(calculateRentalCost(ratePerHour, '10:00', '08:00'), 0);

  // Student pays on weekend
  assert.equal(calculateBookingCost(ratePerHour, true, 'hoc_sinh', '08:00', '10:00'), 200000);
  // Teachers, BGH, Admin pay 0 even on weekend
  assert.equal(calculateBookingCost(ratePerHour, true, 'giao_vien', '08:00', '10:00'), 0);
  assert.equal(calculateBookingCost(ratePerHour, true, 'bgh', '08:00', '10:00'), 0);
  assert.equal(calculateBookingCost(ratePerHour, true, 'admin', '08:00', '10:00'), 0);
});

test('checkBookingConflict: rejects non-active facility', () => {
  const areaMaintenance: KhuVuc = {
    id: 'kv_1',
    tenKhuVuc: 'Sân bóng đá',
    giaThueGio: 150000,
    trangThai: 'bảo trì',
  };

  const result = checkBookingConflict(
    [],
    areaMaintenance,
    {
      ngaySuDung: FUTURE_MONDAY,
      thu: 'Thứ 2',
      buoi: 'chiều',
      tiet: 1,
    },
    undefined,
    'giao_vien',
    NOW_REF
  );

  assert.equal(result.hasConflict, true);
  assert.match(result.reason || '', /bảo trì/);
});

test('checkBookingConflict: detects teacher weekday period clash and ignores cancelled/no-show', () => {
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
    ngaySuDung: FUTURE_MONDAY,
    thu: 'Thứ 2',
    buoi: 'chiều',
    tiet: 2,
    trangThai: 'đã đăng ký',
  };

  const resultClash = checkBookingConflict(
    [existingBooking],
    area,
    { ngaySuDung: FUTURE_MONDAY, thu: 'Thứ 2', buoi: 'chiều', tiet: 2 },
    undefined,
    'giao_vien',
    NOW_REF
  );
  assert.equal(resultClash.hasConflict, true);
  assert.match(resultClash.reason || '', /Trùng lịch/);

  const resultValid = checkBookingConflict(
    [existingBooking],
    area,
    { ngaySuDung: FUTURE_MONDAY, thu: 'Thứ 2', buoi: 'chiều', tiet: 3 },
    undefined,
    'giao_vien',
    NOW_REF
  );
  assert.equal(resultValid.hasConflict, false);

  const cancelledBooking: DangKy = {
    ...existingBooking,
    id: 'bk_cancelled',
    tiet: 4,
    trangThai: 'đã hủy',
  };
  const resultCancelled = checkBookingConflict(
    [cancelledBooking],
    area,
    { ngaySuDung: FUTURE_MONDAY, thu: 'Thứ 2', buoi: 'chiều', tiet: 4 },
    undefined,
    'giao_vien',
    NOW_REF
  );
  assert.equal(resultCancelled.hasConflict, false);
});

test('early return frees remaining weekend slot and recalculates fee', () => {
  const area: KhuVuc = {
    id: 'kv_pb',
    tenKhuVuc: 'Sân Pickleball',
    giaThueGio: 80000,
    trangThai: 'hoạt động',
  };

  const earlyReturned: DangKy = {
    id: 'bk_early',
    idNguoiDung: 'u_hs_1',
    idKhuVuc: 'kv_pb',
    ngaySuDung: FUTURE_SATURDAY,
    thu: 'Thứ 7',
    gioBatDau: '14:00',
    gioKetThuc: '16:00',
    trangThai: 'đã trả',
    thoiGianTra: `14:45 ${FUTURE_SATURDAY}`,
    tongTien: 160000,
  };

  // Effective occupied interval is [14:00, 14:45]
  const interval = getEffectiveWeekendInterval(earlyReturned);
  assert.deepEqual(interval, { start: '14:00', end: '14:45' });

  // Booking [14:45, 16:00] should now succeed!
  const freeSlot = checkBookingConflict(
    [earlyReturned],
    area,
    {
      idNguoiDung: 'u_hs_2',
      ngaySuDung: FUTURE_SATURDAY,
      thu: 'Thứ 7',
      gioBatDau: '14:45',
      gioKetThuc: '16:00',
    },
    undefined,
    'hoc_sinh',
    NOW_REF
  );
  assert.equal(freeSlot.hasConflict, false);

  // Booking [14:15, 15:00] still overlaps used interval [14:00, 14:45]
  const overlapUsed = checkBookingConflict(
    [earlyReturned],
    area,
    {
      idNguoiDung: 'u_hs_2',
      ngaySuDung: FUTURE_SATURDAY,
      thu: 'Thứ 7',
      gioBatDau: '14:15',
      gioKetThuc: '15:00',
    },
    undefined,
    'hoc_sinh',
    NOW_REF
  );
  assert.equal(overlapUsed.hasConflict, true);

  // Actual cost for 45 mins (0.75h * 80.000 = 60.000)
  const actualCost = calculateActualReturnCost(
    area.giaThueGio,
    earlyReturned,
    `14:45 ${FUTURE_SATURDAY}`,
    'hoc_sinh'
  );
  assert.equal(actualCost, 60000);
});

test('weekend minimum duration and student daily quota enforcement', () => {
  const area: KhuVuc = {
    id: 'kv_pb',
    tenKhuVuc: 'Sân Pickleball',
    giaThueGio: 80000,
    trangThai: 'hoạt động',
  };

  // Less than 30 minutes rejected
  const tooShort = checkBookingConflict(
    [],
    area,
    {
      idNguoiDung: 'u_hs_1',
      ngaySuDung: FUTURE_SATURDAY,
      thu: 'Thứ 7',
      gioBatDau: '08:00',
      gioKetThuc: '08:15',
    },
    undefined,
    'hoc_sinh',
    NOW_REF
  );
  assert.equal(tooShort.hasConflict, true);
  assert.match(tooShort.reason || '', /tối thiểu/);

  // Student already has 2 bookings on FUTURE_SATURDAY -> 3rd booking blocked
  const existing: DangKy[] = [
    {
      id: 'b_1',
      idNguoiDung: 'u_hs_1',
      idKhuVuc: 'kv_pb',
      ngaySuDung: FUTURE_SATURDAY,
      thu: 'Thứ 7',
      gioBatDau: '07:00',
      gioKetThuc: '08:00',
      trangThai: 'đã đăng ký',
    },
    {
      id: 'b_2',
      idNguoiDung: 'u_hs_1',
      idKhuVuc: 'kv_pb',
      ngaySuDung: FUTURE_SATURDAY,
      thu: 'Thứ 7',
      gioBatDau: '08:30',
      gioKetThuc: '09:30',
      trangThai: 'đã đăng ký',
    },
  ];

  const thirdBooking = checkBookingConflict(
    existing,
    area,
    {
      idNguoiDung: 'u_hs_1',
      ngaySuDung: FUTURE_SATURDAY,
      thu: 'Thứ 7',
      gioBatDau: '13:00',
      gioKetThuc: '14:00',
    },
    undefined,
    'hoc_sinh',
    NOW_REF
  );
  assert.equal(thirdBooking.hasConflict, true);
  assert.match(thirdBooking.reason || '', /tối đa/);
});

test('canEditOrCancelBooking requires registered status AND strictly before start time', () => {
  const b: DangKy = {
    id: 'bk_time',
    idNguoiDung: 'u_gv_1',
    idKhuVuc: 'kv_bd',
    ngaySuDung: '20/11/2026',
    thu: 'Thứ 6',
    buoi: 'chiều',
    tiet: 1, // 13:30 - 14:15
    trangThai: 'đã đăng ký',
  };

  // Before start time (13:20) -> Allowed
  assert.equal(canEditOrCancelBooking(b, new Date(2026, 10, 20, 13, 20)).allowed, true);
  // At or after start time (13:30) -> Blocked
  assert.equal(canEditOrCancelBooking(b, new Date(2026, 10, 20, 13, 30)).allowed, false);
});

test('overdue return and no-show detection', () => {
  const inUse: DangKy = {
    id: 'bk_inuse',
    idNguoiDung: 'u_gv_1',
    idKhuVuc: 'kv_bd',
    ngaySuDung: '20/11/2026',
    thu: 'Thứ 6',
    buoi: 'chiều',
    tiet: 1, // 13:30 - 14:15
    trangThai: 'đang sử dụng',
  };
  assert.equal(isBookingOverdueReturn(inUse, new Date(2026, 10, 20, 14, 10)), false);
  assert.equal(isBookingOverdueReturn(inUse, new Date(2026, 10, 20, 14, 20)), true);

  const unstarted: DangKy = { ...inUse, trangThai: 'đã đăng ký' };
  assert.equal(isBookingNoShow(unstarted, new Date(2026, 10, 20, 14, 20)), true);
});

test('filterBookingsByTimeframe excludes cancelled in tat_ca and isolates academic school year in hoc_ky', () => {
  const bookings: DangKy[] = [
    {
      id: 'b_hk1_2025',
      idNguoiDung: 'u_1',
      idKhuVuc: 'kv_1',
      ngaySuDung: '15/10/2025', // HK1 2025-2026
      thu: 'Thứ 4',
      buoi: 'chiều',
      tiet: 1,
      trangThai: 'đã trả',
    },
    {
      id: 'b_hk1_2026_jan',
      idNguoiDung: 'u_1',
      idKhuVuc: 'kv_1',
      ngaySuDung: '10/01/2026', // Also HK1 2025-2026!
      thu: 'Thứ 7',
      gioBatDau: '08:00',
      gioKetThuc: '10:00',
      trangThai: 'đã trả',
    },
    {
      id: 'b_hk1_2026_oct',
      idNguoiDung: 'u_1',
      idKhuVuc: 'kv_1',
      ngaySuDung: '15/10/2026', // HK1 2026-2027
      thu: 'Thứ 5',
      buoi: 'chiều',
      tiet: 1,
      trangThai: 'đã trả',
    },
    {
      id: 'b_cancelled',
      idNguoiDung: 'u_1',
      idKhuVuc: 'kv_1',
      ngaySuDung: '15/10/2026',
      thu: 'Thứ 5',
      buoi: 'chiều',
      tiet: 2,
      trangThai: 'đã hủy',
    },
  ];

  const allValid = filterBookingsByTimeframe(bookings, 'tat_ca');
  assert.equal(allValid.length, 3);
  assert.ok(!allValid.some((b) => b.id === 'b_cancelled'));

  const hk1_2025 = filterBookingsByTimeframe(bookings, 'hoc_ky', new Date(2025, 9, 20));
  assert.deepEqual(
    hk1_2025.map((b) => b.id).sort(),
    ['b_hk1_2025', 'b_hk1_2026_jan']
  );

  const hk1_2026 = filterBookingsByTimeframe(bookings, 'hoc_ky', new Date(2026, 9, 20));
  assert.deepEqual(
    hk1_2026.map((b) => b.id),
    ['b_hk1_2026_oct']
  );
});

test('aggregateStatistics counts only actual hours and realized revenue (excludes registered/cancelled/no-show)', () => {
  const areas: KhuVuc[] = [
    { id: 'kv_1', tenKhuVuc: 'Sân bóng đá', giaThueGio: 150000, trangThai: 'hoạt động' },
    { id: 'kv_2', tenKhuVuc: 'Sân Pickleball', giaThueGio: 80000, trangThai: 'hoạt động' },
  ];

  const users: NguoiDung[] = [
    {
      id: 'u_1',
      tenDangNhap: 'gv_nam',
      idVaiTro: 'giao_vien',
      hoTen: 'Nguyễn Văn Nam',
      trangThai: 'hoạt động',
      ngayTao: '01/09/2026',
    },
    {
      id: 'u_2',
      tenDangNhap: 'hs_an',
      idVaiTro: 'hoc_sinh',
      hoTen: 'Lê Văn An',
      lop: '11 Toán',
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
      buoi: 'chiều',
      tiet: 1,
      trangThai: 'đã trả',
      thoiGianTra: '14:15 19/10/2026', // 45 mins = 0.75h
    },
    {
      id: 'b2',
      idNguoiDung: 'u_2',
      idKhuVuc: 'kv_2',
      ngaySuDung: '24/10/2026',
      thu: 'Thứ 7',
      gioBatDau: '08:00',
      gioKetThuc: '10:00',
      trangThai: 'đã trả',
      thoiGianTra: '09:00 24/10/2026', // Returned 1h early! Actual = 1h
      tongTien: 80000,
    },
    {
      id: 'b3_unstarted',
      idNguoiDung: 'u_2',
      idKhuVuc: 'kv_2',
      ngaySuDung: '28/11/2026',
      thu: 'Thứ 7',
      gioBatDau: '14:00',
      gioKetThuc: '16:00',
      trangThai: 'đã đăng ký', // Not yet used -> 0h actual, 0 realized revenue
      tongTien: 160000,
    },
  ];

  const stats = aggregateStatistics(bookings, areas, users, new Date(2026, 10, 20, 12, 0));

  assert.equal(stats.totalBookings, 3);
  assert.equal(stats.totalHours, 1.75);
  assert.equal(stats.totalRevenue, 80000);
  assert.equal(getBookingHours(bookings[2]), 0);
});

test('DANH_SACH_LOP_CHUYEN contains 24 classes and validates accurately', () => {
  assert.equal(DANH_SACH_LOP_CHUYEN.length, 24);
  assert.ok(isValidLopChuyen('10 Toán'));
  assert.ok(isValidLopChuyen('11 Anh 1'));
  assert.equal(isValidLopChuyen('11A1'), false);
  assert.equal(isValidLopChuyen(''), false);
});
