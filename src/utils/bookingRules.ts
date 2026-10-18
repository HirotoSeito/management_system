/**
 * Pure functions for school sports area booking rules, time conversions,
 * conflict resolution, and statistical calculations.
 */

import type { DangKy, KhuVuc, NguoiDung, ThuTrongTuan, BuoiTrongNgay, TietHoc } from '../types/index.ts';

// Standard mapping for periods (tiết học)
export const TIET_HOC_INFO: Record<BuoiTrongNgay, Record<TietHoc, { label: string; thoiGian: string }>> = {
  sáng: {
    1: { label: 'Tiết 1', thoiGian: '07:00 - 07:45' },
    2: { label: 'Tiết 2', thoiGian: '07:50 - 08:35' },
    3: { label: 'Tiết 3', thoiGian: '08:50 - 09:35' },
    4: { label: 'Tiết 4', thoiGian: '09:40 - 10:25' },
    5: { label: 'Tiết 5', thoiGian: '10:30 - 11:15' },
  },
  chiều: {
    1: { label: 'Tiết 1', thoiGian: '13:00 - 13:45' },
    2: { label: 'Tiết 2', thoiGian: '13:50 - 14:35' },
    3: { label: 'Tiết 3', thoiGian: '14:50 - 15:35' },
    4: { label: 'Tiết 4', thoiGian: '15:40 - 16:25' },
    5: { label: 'Tiết 5', thoiGian: '16:30 - 17:15' },
  },
};

/**
 * Convert Date object to 'dd/mm/yyyy' format
 */
export function formatDateToVN(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Convert 'dd/mm/yyyy' string to ISO 'YYYY-MM-DD' for HTML date inputs
 */
export function vnDateToIso(vnDate: string): string {
  if (!vnDate) return '';
  const parts = vnDate.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return vnDate;
}

/**
 * Convert ISO 'YYYY-MM-DD' string to 'dd/mm/yyyy'
 */
export function isoDateToVN(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return isoDate;
}

/**
 * Parse 'dd/mm/yyyy' to Date object
 */
export function parseVNDate(vnDate: string): Date {
  const parts = vnDate.split('/');
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(vnDate);
}

/**
 * Get Vietnamese Day of week from Date or 'dd/mm/yyyy'
 */
export function getThuTrongTuan(dateOrVnDate: Date | string): ThuTrongTuan {
  const date = typeof dateOrVnDate === 'string' ? parseVNDate(dateOrVnDate) : dateOrVnDate;
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday...
  switch (dayIndex) {
    case 1:
      return 'Thứ 2';
    case 2:
      return 'Thứ 3';
    case 3:
      return 'Thứ 4';
    case 4:
      return 'Thứ 5';
    case 5:
      return 'Thứ 6';
    case 6:
      return 'Thứ 7';
    case 0:
    default:
      return 'Chủ nhật';
  }
}

/**
 * Check if the day is weekend (Thứ 7 or Chủ nhật)
 */
export function isCuoiTuan(thu: ThuTrongTuan): boolean {
  return thu === 'Thứ 7' || thu === 'Chủ nhật';
}

/**
 * Convert time 'HH:mm' to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Check if two time ranges overlap
 */
export function doTimesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const minStartA = timeStringToMinutes(startA);
  const minEndA = timeStringToMinutes(endA);
  const minStartB = timeStringToMinutes(startB);
  const minEndB = timeStringToMinutes(endB);

  // Overlap condition: max(startA, startB) < min(endA, endB)
  return Math.max(minStartA, minStartB) < Math.min(minEndA, minEndB);
}

/**
 * Calculate rental cost for hourly booking
 */
export function calculateRentalCost(pricePerHour: number, startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;
  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);
  if (endMin <= startMin) return 0;

  const hours = (endMin - startMin) / 60;
  return Math.round(hours * pricePerHour);
}

/**
 * Validate conflict for sports area booking:
 * - Reject if area is not active ('hoạt động')
 * - Reject if duplicate slot on Monday - Friday (same date, area, buoi, tiet)
 * - Reject if overlapping time on Saturday - Sunday (same date, area, overlapping time range)
 */
export interface ConflictCheckResult {
  hasConflict: boolean;
  reason?: string;
  conflictingBooking?: DangKy;
}

export function checkBookingConflict(
  existingBookings: DangKy[],
  khuVuc: KhuVuc | undefined,
  newBooking: Partial<DangKy>,
  excludeBookingId?: string
): ConflictCheckResult {
  if (!khuVuc) {
    return { hasConflict: true, reason: 'Khu vực không tồn tại trong hệ thống.' };
  }

  if (khuVuc.trangThai !== 'hoạt động') {
    return {
      hasConflict: true,
      reason: `Khu vực "${khuVuc.tenKhuVuc}" hiện đang ở trạng thái "${khuVuc.trangThai}". Chỉ có thể đăng ký khu vực đang "hoạt động".`,
    };
  }

  const { ngaySuDung, thu, buoi, tiet, gioBatDau, gioKetThuc } = newBooking;

  if (!ngaySuDung || !thu) {
    return { hasConflict: true, reason: 'Vui lòng cung cấp ngày sử dụng.' };
  }

  const isWeekend = isCuoiTuan(thu);

  // Filter existing active bookings for the same area & date
  const activeBookingsOnSameDate = existingBookings.filter((b) => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.idKhuVuc !== khuVuc.id) return false;
    if (b.ngaySuDung !== ngaySuDung) return false;
    // Cancelled bookings do not cause conflicts
    return b.trangThai !== 'đã hủy';
  });

  if (!isWeekend) {
    // Weekday: must have buoi and tiet
    if (!buoi || !tiet) {
      return { hasConflict: true, reason: 'Vui lòng chọn buổi và tiết học (1-5).' };
    }

    const conflict = activeBookingsOnSameDate.find(
      (b) => b.buoi === buoi && Number(b.tiet) === Number(tiet)
    );

    if (conflict) {
      return {
        hasConflict: true,
        reason: `Trùng lịch: Khu vực đã được đăng ký vào ${thu}, ${ngaySuDung} (Buổi ${buoi}, Tiết ${tiet}).`,
        conflictingBooking: conflict,
      };
    }
  } else {
    // Weekend: must have gioBatDau and gioKetThuc
    if (!gioBatDau || !gioKetThuc) {
      return { hasConflict: true, reason: 'Vui lòng chọn giờ bắt đầu và giờ kết thúc.' };
    }

    const startMin = timeStringToMinutes(gioBatDau);
    const endMin = timeStringToMinutes(gioKetThuc);

    if (endMin <= startMin) {
      return { hasConflict: true, reason: 'Giờ kết thúc phải sau giờ bắt đầu.' };
    }

    // Check overlap with existing weekend hourly bookings or legacy slots
    const conflict = activeBookingsOnSameDate.find((b) => {
      if (b.gioBatDau && b.gioKetThuc) {
        return doTimesOverlap(gioBatDau, gioKetThuc, b.gioBatDau, b.gioKetThuc);
      }
      return false;
    });

    if (conflict) {
      return {
        hasConflict: true,
        reason: `Trùng lịch: Khu vực đã có người thuê từ ${conflict.gioBatDau} đến ${conflict.gioKetThuc} vào ${ngaySuDung}.`,
        conflictingBooking: conflict,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Filter bookings by statistical timeframe:
 * - 'day': specific date (dd/mm/yyyy)
 * - 'week': bookings in the same 7-day week of target date
 * - 'month': bookings in target month/year
 * - 'semester': Semester 1 (Sep - Jan) or Semester 2 (Feb - May/Jun)
 */
export type FilterTimeframe = 'tat_ca' | 'ngay' | 'tuan' | 'thang' | 'hoc_ky';

export function filterBookingsByTimeframe(
  bookings: DangKy[],
  mode: FilterTimeframe,
  referenceDate: Date = new Date()
): DangKy[] {
  if (mode === 'tat_ca') return bookings;

  const targetDateStr = formatDateToVN(referenceDate);
  const targetMonth = referenceDate.getMonth(); // 0-11
  const targetYear = referenceDate.getFullYear();

  // Find start and end of week (Monday to Sunday)
  const dayOfWeek = referenceDate.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return bookings.filter((b) => {
    if (b.trangThai === 'đã hủy') return false;

    const bDate = parseVNDate(b.ngaySuDung);

    switch (mode) {
      case 'ngay':
        return b.ngaySuDung === targetDateStr;

      case 'tuan':
        return bDate >= monday && bDate <= sunday;

      case 'thang':
        return bDate.getMonth() === targetMonth && bDate.getFullYear() === targetYear;

      case 'hoc_ky': {
        const m = bDate.getMonth(); // 0-11
        // Semester 1: Months 8, 9, 10, 11, 0 (Sep - Jan)
        // Semester 2: Months 1, 2, 3, 4, 5 (Feb - Jun)
        const isTargetInSemester1 = targetMonth >= 8 || targetMonth === 0;
        const isBDateInSemester1 = m >= 8 || m === 0;
        return isTargetInSemester1 === isBDateInSemester1;
      }

      default:
        return true;
    }
  });
}

/**
 * Calculate total hours used for a booking
 */
export function getBookingHours(booking: DangKy): number {
  if (booking.gioBatDau && booking.gioKetThuc) {
    const diffMin = timeStringToMinutes(booking.gioKetThuc) - timeStringToMinutes(booking.gioBatDau);
    return Math.max(0, diffMin / 60);
  }
  // Standard school period is 45 minutes = 0.75 hours
  if (booking.tiet) {
    return 0.75;
  }
  return 1;
}

/**
 * Aggregate statistics by sports facility and by user
 */
export function aggregateStatistics(
  filteredBookings: DangKy[],
  areas: KhuVuc[],
  users: NguoiDung[]
) {
  const areaStatsMap = new Map<string, { count: number; hours: number; revenue: number; inUse: number; returned: number }>();
  areas.forEach((a) => {
    areaStatsMap.set(a.id, { count: 0, hours: 0, revenue: 0, inUse: 0, returned: 0 });
  });

  const userStatsMap = new Map<string, { count: number; hours: number; totalCost: number }>();
  users.forEach((u) => {
    userStatsMap.set(u.id, { count: 0, hours: 0, totalCost: 0 });
  });

  filteredBookings.forEach((b) => {
    const hours = getBookingHours(b);
    const cost = b.tongTien || 0;

    // Facility aggregation
    const aStat = areaStatsMap.get(b.idKhuVuc);
    if (aStat) {
      aStat.count += 1;
      aStat.hours += hours;
      aStat.revenue += cost;
      if (b.trangThai === 'đang sử dụng') aStat.inUse += 1;
      if (b.trangThai === 'đã trả') aStat.returned += 1;
    }

    // User aggregation
    const uStat = userStatsMap.get(b.idNguoiDung);
    if (uStat) {
      uStat.count += 1;
      uStat.hours += hours;
      uStat.totalCost += cost;
    }
  });

  const areaStats = areas.map((a) => {
    const stat = areaStatsMap.get(a.id) || { count: 0, hours: 0, revenue: 0, inUse: 0, returned: 0 };
    return {
      idKhuVuc: a.id,
      tenKhuVuc: a.tenKhuVuc,
      soLuotDangKy: stat.count,
      tongThoiGianGio: Math.round(stat.hours * 10) / 10,
      tongTienThu: stat.revenue,
      soLuotDangSuDung: stat.inUse,
      soLuotDaTra: stat.returned,
    };
  });

  const userStats = users.map((u) => {
    const stat = userStatsMap.get(u.id) || { count: 0, hours: 0, totalCost: 0 };
    const roleName =
      u.idVaiTro === 'admin'
        ? 'Quản trị viên'
        : u.idVaiTro === 'bgh'
        ? 'Ban giám hiệu'
        : u.idVaiTro === 'giao_vien'
        ? 'Giáo viên'
        : 'Học sinh';

    return {
      idNguoiDung: u.id,
      hoTen: u.hoTen,
      tenVaiTro: roleName,
      lop: u.lop,
      soLuotDangKy: stat.count,
      tongThoiGianGio: Math.round(stat.hours * 10) / 10,
      tongChiPhi: stat.totalCost,
    };
  });

  const totalBookings = filteredBookings.length;
  const totalHours = Math.round(filteredBookings.reduce((sum, b) => sum + getBookingHours(b), 0) * 10) / 10;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.tongTien || 0), 0);

  return {
    areaStats,
    userStats,
    totalBookings,
    totalHours,
    totalRevenue,
  };
}
