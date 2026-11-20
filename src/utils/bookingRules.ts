/**
 * Pure functions for school sports area booking rules, time conversions,
 * conflict resolution, early return calculations, and statistical aggregations.
 * Tailored for Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang.
 */

import type {
  DangKy,
  KhuVuc,
  NguoiDung,
  ThuTrongTuan,
  BuoiTrongNgay,
  TietHoc,
  VaiTroId,
} from '../types/index.ts';

// Danh sách các khối và lớp chuyên của Trường THPT chuyên Lê Quý Đôn – Nam Nha Trang
export const KHOI_HOC = ['10', '11', '12'] as const;
export const CHUYEN_MON = ['Toán', 'Lý', 'Hóa', 'Sinh', 'Tin', 'Anh 1', 'Anh 2', 'Văn'] as const;

export const DANH_SACH_LOP_CHUYEN: string[] = [];
KHOI_HOC.forEach((khoi) => {
  CHUYEN_MON.forEach((mon) => {
    DANH_SACH_LOP_CHUYEN.push(`${khoi} ${mon}`);
  });
});

export function isValidLopChuyen(lop?: string): boolean {
  if (!lop) return false;
  return DANH_SACH_LOP_CHUYEN.includes(lop.trim());
}

// Weekend booking safeguards
export const MIN_WEEKEND_DURATION_MINUTES = 30;
export const MAX_STUDENT_WEEKEND_BOOKINGS_PER_DAY = 2;
export const MAX_STUDENT_WEEKEND_HOURS_PER_DAY = 4;

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
    1: { label: 'Tiết 1', thoiGian: '13:30 - 14:15' },
    2: { label: 'Tiết 2', thoiGian: '14:20 - 15:05' },
    3: { label: 'Tiết 3', thoiGian: '15:10 - 15:55' },
    4: { label: 'Tiết 4', thoiGian: '16:00 - 16:45' },
    5: { label: 'Tiết 5', thoiGian: '16:50 - 17:35' },
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
 * Format Date object to 'HH:mm dd/mm/yyyy'
 */
export function formatDateTimeToVN(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${formatDateToVN(date)}`;
}

/**
 * Parse 'HH:mm dd/mm/yyyy' into { timeStr, dateStr, minutes, date }
 */
export function parseVNDateTime(dateTimeVN?: string | null): {
  timeStr: string;
  dateStr: string;
  minutes: number;
  date: Date;
} | null {
  if (!dateTimeVN) return null;
  const trimmed = dateTimeVN.trim();
  const match = /^(\d{1,2}:\d{2})\s+(\d{1,2}\/\d{1,2}\/\d{4})$/.exec(trimmed);
  if (!match) return null;
  const [, timeStr, dateStr] = match;
  const [hh, mm] = timeStr.split(':').map(Number);
  const d = parseVNDate(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const fullDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh || 0, mm || 0, 0, 0);
  return {
    timeStr: `${String(hh || 0).padStart(2, '0')}:${String(mm || 0).padStart(2, '0')}`,
    dateStr: formatDateToVN(d),
    minutes: (hh || 0) * 60 + (mm || 0),
    date: fullDate,
  };
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
 * Parse 'dd/mm/yyyy' to Date object (local midnight)
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
 * Calculate booking cost according to school policy:
 * Only students ('hoc_sinh') pay weekend hourly fees. Teachers, BGH, and Admin are free.
 */
export function calculateBookingCost(
  pricePerHour: number,
  isWeekend: boolean,
  renterRole?: VaiTroId | string,
  startTime?: string,
  endTime?: string
): number {
  if (!isWeekend) return 0;
  if (renterRole !== 'hoc_sinh') return 0;
  return calculateRentalCost(pricePerHour, startTime, endTime);
}

/**
 * Get scheduled start & end HH:mm for a booking (period or hourly)
 */
export function getBookingScheduledRange(
  booking: Pick<DangKy, 'buoi' | 'tiet' | 'gioBatDau' | 'gioKetThuc'>
): { startStr: string; endStr: string; startMin: number; endMin: number } | null {
  if (booking.gioBatDau && booking.gioKetThuc) {
    return {
      startStr: booking.gioBatDau,
      endStr: booking.gioKetThuc,
      startMin: timeStringToMinutes(booking.gioBatDau),
      endMin: timeStringToMinutes(booking.gioKetThuc),
    };
  }
  if (booking.buoi && booking.tiet) {
    const info = TIET_HOC_INFO[booking.buoi]?.[booking.tiet];
    if (!info) return null;
    const [startStr, endStr] = info.thoiGian.split(' - ');
    return {
      startStr,
      endStr,
      startMin: timeStringToMinutes(startStr),
      endMin: timeStringToMinutes(endStr),
    };
  }
  return null;
}

/**
 * Check if a date string (dd/mm/yyyy) and slot start time is in the past (>= start time)
 */
export function isSlotInThePast(
  ngaySuDungVN: string,
  tiet?: { buoi: BuoiTrongNgay; tiet: TietHoc },
  gioBatDau?: string,
  now: Date = new Date()
): boolean {
  if (!ngaySuDungVN) return false;
  const slotDate = parseVNDate(ngaySuDungVN);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (slotDate < today) {
    return true;
  }

  if (slotDate > today) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (tiet) {
    const info = TIET_HOC_INFO[tiet.buoi][tiet.tiet];
    const startTimeStr = info.thoiGian.split(' - ')[0];
    const startMinutes = timeStringToMinutes(startTimeStr);
    return currentMinutes >= startMinutes;
  }

  if (gioBatDau) {
    const startMinutes = timeStringToMinutes(gioBatDau);
    return currentMinutes >= startMinutes;
  }

  return false;
}

/**
 * Check if a booking's scheduled end time has already passed
 */
export function isSlotEnded(
  booking: Pick<DangKy, 'ngaySuDung' | 'buoi' | 'tiet' | 'gioBatDau' | 'gioKetThuc'>,
  now: Date = new Date()
): boolean {
  if (!booking.ngaySuDung) return false;
  const slotDate = parseVNDate(booking.ngaySuDung);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (slotDate < today) return true;
  if (slotDate > today) return false;

  const range = getBookingScheduledRange(booking);
  if (!range) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= range.endMin;
}

/**
 * Detect if an in-use booking has exceeded its scheduled end time without being returned
 */
export function isBookingOverdueReturn(booking: DangKy, now: Date = new Date()): boolean {
  if (booking.trangThai !== 'đang sử dụng') return false;
  return isSlotEnded(booking, now);
}

/**
 * Detect if a registered (unstarted) booking has passed its scheduled end time without check-in
 */
export function isBookingNoShow(booking: DangKy, now: Date = new Date()): boolean {
  if (booking.trangThai !== 'đã đăng ký') return false;
  return isSlotEnded(booking, now);
}

/**
 * Check whether a booking can be edited or cancelled according to school policy:
 * Must be in 'đã đăng ký' status AND strictly before its scheduled start time.
 */
export function canEditOrCancelBooking(
  booking: DangKy,
  now: Date = new Date()
): { allowed: boolean; reason?: string } {
  if (booking.trangThai !== 'đã đăng ký') {
    return {
      allowed: false,
      reason: `Chỉ có thể chỉnh sửa hoặc hủy lượt ở trạng thái "đã đăng ký" (hiện tại: ${booking.trangThai}).`,
    };
  }

  const isStartedOrPast = isSlotInThePast(
    booking.ngaySuDung,
    booking.buoi && booking.tiet ? { buoi: booking.buoi, tiet: booking.tiet } : undefined,
    booking.gioBatDau,
    now
  );

  if (isStartedOrPast) {
    return {
      allowed: false,
      reason: 'Đã đến hoặc qua giờ bắt đầu sử dụng. Không thể chỉnh sửa hoặc hủy lịch.',
    };
  }

  return { allowed: true };
}

/**
 * Get effective occupied weekend interval [start, end] for conflict detection.
 * When a weekend booking is returned early ('đã trả' with thoiGianTra < gioKetThuc),
 * the unused remainder [returnTime, gioKetThuc] is released immediately!
 */
export function getEffectiveWeekendInterval(
  booking: DangKy
): { start: string; end: string } | null {
  if (booking.trangThai === 'đã hủy' || booking.trangThai === 'quá hạn') return null;
  if (!booking.gioBatDau || !booking.gioKetThuc) return null;

  if (booking.trangThai === 'đã trả' && booking.thoiGianTra) {
    const ret = parseVNDateTime(booking.thoiGianTra);
    if (ret) {
      const bookingDate = parseVNDate(booking.ngaySuDung);
      const retDateOnly = new Date(ret.date.getFullYear(), ret.date.getMonth(), ret.date.getDate());
      if (retDateOnly < bookingDate) {
        return null; // Returned before the booked date -> completely free
      }
      if (retDateOnly.getTime() === bookingDate.getTime()) {
        const startMin = timeStringToMinutes(booking.gioBatDau);
        const endMin = timeStringToMinutes(booking.gioKetThuc);
        if (ret.minutes <= startMin) {
          return null; // Returned before start -> completely free
        }
        if (ret.minutes < endMin) {
          return { start: booking.gioBatDau, end: ret.timeStr };
        }
      }
    }
  }

  return { start: booking.gioBatDau, end: booking.gioKetThuc };
}

/**
 * Recalculate rental fee when returning a booking (especially early return).
 * Teachers/BGH/Admin always pay 0.
 */
export function calculateActualReturnCost(
  pricePerHour: number,
  booking: DangKy,
  returnDateTimeVN: string,
  renterRole?: VaiTroId | string
): number {
  if (renterRole && renterRole !== 'hoc_sinh') return 0;
  if (!booking.tongTien || booking.tongTien === 0) return 0;
  if (!booking.gioBatDau || !booking.gioKetThuc) return booking.tongTien || 0;

  const ret = parseVNDateTime(returnDateTimeVN);
  if (!ret) return booking.tongTien || 0;

  const bookingDate = parseVNDate(booking.ngaySuDung);
  const retDateOnly = new Date(ret.date.getFullYear(), ret.date.getMonth(), ret.date.getDate());

  if (retDateOnly < bookingDate) {
    return 0;
  }

  if (retDateOnly.getTime() === bookingDate.getTime()) {
    const startMin = timeStringToMinutes(booking.gioBatDau);
    const endMin = timeStringToMinutes(booking.gioKetThuc);
    if (ret.minutes <= startMin) {
      return 0;
    }
    if (ret.minutes < endMin) {
      return calculateRentalCost(pricePerHour, booking.gioBatDau, ret.timeStr);
    }
  }

  return calculateRentalCost(pricePerHour, booking.gioBatDau, booking.gioKetThuc);
}

/**
 * Validate weekend hours according to school regulations:
 * Sáng: 07:00 – 10:00
 * Chiều: 13:00 – 16:30
 * Minimum duration: 30 minutes
 */
export function isValidWeekendHours(gioBatDau: string, gioKetThuc: string): { isValid: boolean; reason?: string } {
  if (!gioBatDau || !gioKetThuc) {
    return { isValid: false, reason: 'Vui lòng nhập đầy đủ giờ bắt đầu và giờ kết thúc.' };
  }

  const startMin = timeStringToMinutes(gioBatDau);
  const endMin = timeStringToMinutes(gioKetThuc);

  if (endMin <= startMin) {
    return { isValid: false, reason: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.' };
  }

  if (endMin - startMin < MIN_WEEKEND_DURATION_MINUTES) {
    return {
      isValid: false,
      reason: `Thời lượng thuê tối thiểu mỗi lượt là ${MIN_WEEKEND_DURATION_MINUTES} phút.`,
    };
  }

  const morningStart = timeStringToMinutes('07:00');
  const morningEnd = timeStringToMinutes('10:00');
  const afternoonStart = timeStringToMinutes('13:00');
  const afternoonEnd = timeStringToMinutes('16:30');

  const isMorning = startMin >= morningStart && endMin <= morningEnd;
  const isAfternoon = startMin >= afternoonStart && endMin <= afternoonEnd;

  if (!isMorning && !isAfternoon) {
    return {
      isValid: false,
      reason: 'Theo quy định nhà trường, khung giờ thuê cuối tuần chỉ cho phép: Buổi Sáng (07:00 – 10:00) hoặc Buổi Chiều (13:00 – 16:30).',
    };
  }

  return { isValid: true };
}

/**
 * Validate conflict for sports area booking:
 * - Reject if area is not active ('hoạt động')
 * - Reject if time is in the past
 * - Reject if student tries to book weekday
 * - Reject if student exceeds daily weekend quota (max 2 bookings or 4 hours/day)
 * - Reject if duplicate slot on Monday - Friday (same date, area, buoi, tiet)
 * - Reject if overlapping effective time on Saturday - Sunday (early returns release remainder)
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
  excludeBookingId?: string,
  userRole?: string,
  now: Date = new Date()
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

  const { ngaySuDung, thu, buoi, tiet, gioBatDau, gioKetThuc, idNguoiDung } = newBooking;

  if (!ngaySuDung || !thu) {
    return { hasConflict: true, reason: 'Vui lòng cung cấp ngày sử dụng.' };
  }

  const isWeekend = isCuoiTuan(thu);

  // Rule: Students can only rent on weekends (Thứ 7 & Chủ nhật)
  if (userRole === 'hoc_sinh' && !isWeekend) {
    return {
      hasConflict: true,
      reason: 'Quy định nhà trường: Học sinh chỉ được phép đăng ký thuê sân vào Thứ 7 và Chủ nhật. Các ngày trong tuần (Thứ 2 - Thứ 6) dành riêng cho Giáo viên mượn để giảng dạy chính khóa theo tiết.',
    };
  }

  // Rule: Past time cannot be registered
  const isPast = isSlotInThePast(
    ngaySuDung,
    !isWeekend && buoi && tiet ? { buoi, tiet: tiet as TietHoc } : undefined,
    isWeekend && gioBatDau ? gioBatDau : undefined,
    now
  );
  if (isPast) {
    return {
      hasConflict: true,
      reason: 'Thời gian đã qua so với hiện tại. Hệ thống không cho phép đăng ký cho mốc thời gian quá khứ.',
    };
  }

  // Filter existing active bookings for the same area & date
  const activeBookingsOnSameDate = existingBookings.filter((b) => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.idKhuVuc !== khuVuc.id) return false;
    if (b.ngaySuDung !== ngaySuDung) return false;
    return b.trangThai !== 'đã hủy' && b.trangThai !== 'quá hạn';
  });

  if (!isWeekend) {
    // Rule: School does not teach PE in the morning on weekdays
    if (buoi === 'sáng') {
      return {
        hasConflict: true,
        reason: 'Quy định nhà trường: Trường THPT Chuyên Lê Quý Đôn không bố trí tiết Thể dục vào buổi sáng (dành cho các môn văn hóa). Giáo viên chỉ đăng ký mượn sân giảng dạy vào Buổi Chiều (Tiết 1 - 5).',
      };
    }

    if (!buoi || !tiet) {
      return { hasConflict: true, reason: 'Vui lòng chọn buổi và tiết học (1-5).' };
    }

    const conflict = activeBookingsOnSameDate.find((b) => {
      if (b.buoi !== buoi || Number(b.tiet) !== Number(tiet)) return false;
      // If returned before the period even started, it was freed
      if (b.trangThai === 'đã trả' && b.thoiGianTra) {
        const ret = parseVNDateTime(b.thoiGianTra);
        const range = getBookingScheduledRange(b);
        if (ret && range) {
          const bDate = parseVNDate(b.ngaySuDung);
          const retDateOnly = new Date(ret.date.getFullYear(), ret.date.getMonth(), ret.date.getDate());
          if (retDateOnly < bDate || (retDateOnly.getTime() === bDate.getTime() && ret.minutes <= range.startMin)) {
            return false;
          }
        }
      }
      return true;
    });

    if (conflict) {
      return {
        hasConflict: true,
        reason: `Trùng lịch: Khu vực đã được đăng ký vào ${thu}, ${ngaySuDung} (Buổi ${buoi}, Tiết ${tiet}).`,
        conflictingBooking: conflict,
      };
    }
  } else {
    if (!gioBatDau || !gioKetThuc) {
      return { hasConflict: true, reason: 'Vui lòng chọn giờ bắt đầu và giờ kết thúc.' };
    }

    const validTime = isValidWeekendHours(gioBatDau, gioKetThuc);
    if (!validTime.isValid) {
      return { hasConflict: true, reason: validTime.reason };
    }

    // Rule: Limit student weekend bookings per day to prevent slot hoarding
    if (userRole === 'hoc_sinh' && idNguoiDung) {
      const studentDayBookings = existingBookings.filter((b) => {
        if (excludeBookingId && b.id === excludeBookingId) return false;
        if (b.idNguoiDung !== idNguoiDung) return false;
        if (b.ngaySuDung !== ngaySuDung) return false;
        return b.trangThai !== 'đã hủy' && b.trangThai !== 'quá hạn';
      });

      if (studentDayBookings.length >= MAX_STUDENT_WEEKEND_BOOKINGS_PER_DAY) {
        return {
          hasConflict: true,
          reason: `Giới hạn quy chế: Mỗi học sinh chỉ được đăng ký tối đa ${MAX_STUDENT_WEEKEND_BOOKINGS_PER_DAY} lượt thuê trong ngày ${ngaySuDung} để đảm bảo công bằng cho các lớp khác.`,
        };
      }

      const newDurationHours = (timeStringToMinutes(gioKetThuc) - timeStringToMinutes(gioBatDau)) / 60;
      const existingHours = studentDayBookings.reduce((sum, b) => {
        const effective = getEffectiveWeekendInterval(b);
        if (!effective) return sum;
        return sum + Math.max(0, (timeStringToMinutes(effective.end) - timeStringToMinutes(effective.start)) / 60);
      }, 0);

      if (existingHours + newDurationHours > MAX_STUDENT_WEEKEND_HOURS_PER_DAY + 0.001) {
        return {
          hasConflict: true,
          reason: `Giới hạn quy chế: Tổng thời lượng thuê tối đa mỗi ngày của 1 học sinh là ${MAX_STUDENT_WEEKEND_HOURS_PER_DAY} giờ (bạn đã có ${Math.round(existingHours * 10) / 10} giờ trong ngày ${ngaySuDung}).`,
        };
      }
    }

    // Check overlap with effective intervals of existing weekend hourly bookings
    let conflictingInterval: { start: string; end: string } | null = null;
    const conflict = activeBookingsOnSameDate.find((b) => {
      const interval = getEffectiveWeekendInterval(b);
      if (interval && doTimesOverlap(gioBatDau, gioKetThuc, interval.start, interval.end)) {
        conflictingInterval = interval;
        return true;
      }
      return false;
    });

    if (conflict && conflictingInterval) {
      const cInterval = conflictingInterval as { start: string; end: string };
      return {
        hasConflict: true,
        reason: `Trùng lịch: Khu vực đã có người thuê từ ${cInterval.start} đến ${cInterval.end} vào ${ngaySuDung}.`,
        conflictingBooking: conflict,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Determine Vietnamese academic school year & semester for a given Date.
 * Học kỳ 1: tháng 9 – tháng 1 (năm học Y–Y+1)
 * Học kỳ 2: tháng 2 – tháng 8 (năm học Y–Y+1)
 */
export function getAcademicSemester(date: Date): {
  schoolYearStart: number;
  semester: 1 | 2;
  label: string;
} {
  const m = date.getMonth(); // 0-11
  const y = date.getFullYear();

  if (m >= 8) {
    return {
      schoolYearStart: y,
      semester: 1,
      label: `Học kỳ 1 (${y}–${y + 1})`,
    };
  }
  if (m === 0) {
    return {
      schoolYearStart: y - 1,
      semester: 1,
      label: `Học kỳ 1 (${y - 1}–${y})`,
    };
  }
  return {
    schoolYearStart: y - 1,
    semester: 2,
    label: `Học kỳ 2 (${y - 1}–${y})`,
  };
}

/**
 * Filter bookings by statistical timeframe (always excludes cancelled 'đã hủy' bookings):
 * - 'tat_ca': all non-cancelled bookings
 * - 'ngay': specific date (dd/mm/yyyy)
 * - 'tuan': bookings in the same 7-day week (Mon-Sun) of target date
 * - 'thang': bookings in target month/year
 * - 'hoc_ky': Semester 1 or 2 of the SAME academic school year
 */
export type FilterTimeframe = 'tat_ca' | 'ngay' | 'tuan' | 'thang' | 'hoc_ky';

export function filterBookingsByTimeframe(
  bookings: DangKy[],
  mode: FilterTimeframe,
  referenceDate: Date = new Date()
): DangKy[] {
  const targetDateStr = formatDateToVN(referenceDate);
  const targetMonth = referenceDate.getMonth(); // 0-11
  const targetYear = referenceDate.getFullYear();
  const targetAcademic = getAcademicSemester(referenceDate);

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
    if (mode === 'tat_ca') return true;

    const bDate = parseVNDate(b.ngaySuDung);

    switch (mode) {
      case 'ngay':
        return b.ngaySuDung === targetDateStr;

      case 'tuan':
        return bDate >= monday && bDate <= sunday;

      case 'thang':
        return bDate.getMonth() === targetMonth && bDate.getFullYear() === targetYear;

      case 'hoc_ky': {
        const bAcademic = getAcademicSemester(bDate);
        return (
          bAcademic.schoolYearStart === targetAcademic.schoolYearStart &&
          bAcademic.semester === targetAcademic.semester
        );
      }

      default:
        return true;
    }
  });
}

/**
 * Calculate scheduled hours for a booking (for reference/planning)
 */
export function getScheduledBookingHours(booking: DangKy): number {
  if (booking.gioBatDau && booking.gioKetThuc) {
    const diffMin = timeStringToMinutes(booking.gioKetThuc) - timeStringToMinutes(booking.gioBatDau);
    return Math.max(0, diffMin / 60);
  }
  if (booking.tiet) {
    return 0.75; // 45 phút / tiết
  }
  return 0;
}

/**
 * Calculate ACTUAL hours used for a booking:
 * - 'đã đăng ký', 'đã hủy', 'quá hạn' -> 0 (not yet started / cancelled / no-show)
 * - 'đã trả' -> actual hours from scheduled start (or check-in) to thoiGianTra (or scheduled duration if legacy)
 * - 'đang sử dụng' -> elapsed hours up to `now` (or scheduled duration if date is in the past)
 */
export function getBookingHours(booking: DangKy, now: Date = new Date()): number {
  if (
    booking.trangThai === 'đã hủy' ||
    booking.trangThai === 'quá hạn' ||
    booking.trangThai === 'đã đăng ký'
  ) {
    return 0;
  }

  const scheduledHours = getScheduledBookingHours(booking);
  const range = getBookingScheduledRange(booking);
  const bookingDate = parseVNDate(booking.ngaySuDung);

  if (booking.trangThai === 'đã trả') {
    if (booking.thoiGianTra && range) {
      const ret = parseVNDateTime(booking.thoiGianTra);
      if (ret) {
        const retDateOnly = new Date(ret.date.getFullYear(), ret.date.getMonth(), ret.date.getDate());
        if (retDateOnly.getTime() === bookingDate.getTime()) {
          if (ret.minutes >= range.startMin) {
            return Math.max(0, (ret.minutes - range.startMin) / 60);
          }
          // Returned before scheduled start on the same day
          const started = parseVNDateTime(booking.thoiGianBatDauThucTe);
          if (started && ret.date >= started.date) {
            return Math.max(0, (ret.date.getTime() - started.date.getTime()) / 3600000);
          }
          return 0;
        }
        // Returned on a different date (e.g. forgot & returned next day, or tested in advance)
        const started = parseVNDateTime(booking.thoiGianBatDauThucTe);
        if (started && ret.date >= started.date) {
          const startedDateOnly = new Date(started.date.getFullYear(), started.date.getMonth(), started.date.getDate());
          if (startedDateOnly.getTime() === retDateOnly.getTime()) {
            return Math.max(0, (ret.date.getTime() - started.date.getTime()) / 3600000);
          }
        }
        if (retDateOnly < bookingDate) return 0;
      }
    }
    return scheduledHours;
  }

  // 'đang sử dụng'
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (bookingDate < today) {
    return scheduledHours;
  }
  if (bookingDate.getTime() === today.getTime() && range) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (nowMin >= range.startMin) {
      return Math.max(0, (nowMin - range.startMin) / 60);
    }
  }
  const started = parseVNDateTime(booking.thoiGianBatDauThucTe);
  if (started && now >= started.date) {
    return Math.max(0, (now.getTime() - started.date.getTime()) / 3600000);
  }
  return 0;
}

/**
 * Collected / realized revenue for a booking:
 * Unstarted ('đã đăng ký'), cancelled ('đã hủy'), and no-show ('quá hạn') bookings do NOT count as realized revenue.
 */
export function getBookingCollectedRevenue(booking: DangKy): number {
  if (booking.trangThai === 'đang sử dụng' || booking.trangThai === 'đã trả') {
    return booking.tongTien || 0;
  }
  return 0;
}

/**
 * Aggregate statistics by sports facility and by user
 */
export function aggregateStatistics(
  filteredBookings: DangKy[],
  areas: KhuVuc[],
  users: NguoiDung[],
  now: Date = new Date()
) {
  const areaStatsMap = new Map<
    string,
    { count: number; hours: number; revenue: number; inUse: number; returned: number; pending: number; overdue: number }
  >();
  areas.forEach((a) => {
    areaStatsMap.set(a.id, { count: 0, hours: 0, revenue: 0, inUse: 0, returned: 0, pending: 0, overdue: 0 });
  });

  const userStatsMap = new Map<string, { count: number; hours: number; totalCost: number }>();
  users.forEach((u) => {
    userStatsMap.set(u.id, { count: 0, hours: 0, totalCost: 0 });
  });

  filteredBookings.forEach((b) => {
    if (b.trangThai === 'đã hủy') return;

    const hours = getBookingHours(b, now);
    const revenue = getBookingCollectedRevenue(b);

    // Facility aggregation
    const aStat = areaStatsMap.get(b.idKhuVuc);
    if (aStat) {
      aStat.count += 1;
      aStat.hours += hours;
      aStat.revenue += revenue;
      if (b.trangThai === 'đang sử dụng') aStat.inUse += 1;
      if (b.trangThai === 'đã trả') aStat.returned += 1;
      if (b.trangThai === 'đã đăng ký') aStat.pending += 1;
      if (b.trangThai === 'quá hạn') aStat.overdue += 1;
    }

    // User aggregation
    const uStat = userStatsMap.get(b.idNguoiDung);
    if (uStat) {
      uStat.count += 1;
      uStat.hours += hours;
      uStat.totalCost += revenue;
    }
  });

  const areaStats = areas.map((a) => {
    const stat = areaStatsMap.get(a.id) || {
      count: 0,
      hours: 0,
      revenue: 0,
      inUse: 0,
      returned: 0,
      pending: 0,
      overdue: 0,
    };
    return {
      idKhuVuc: a.id,
      tenKhuVuc: a.tenKhuVuc,
      soLuotDangKy: stat.count,
      tongThoiGianGio: Math.round(stat.hours * 100) / 100,
      tongTienThu: stat.revenue,
      soLuotDangSuDung: stat.inUse,
      soLuotDaTra: stat.returned,
      soLuotChoSuDung: stat.pending,
      soLuotQuaHan: stat.overdue,
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
      tongThoiGianGio: Math.round(stat.hours * 100) / 100,
      tongChiPhi: stat.totalCost,
    };
  });

  const activeNonCancelled = filteredBookings.filter((b) => b.trangThai !== 'đã hủy');
  const totalBookings = activeNonCancelled.length;
  const totalHours =
    Math.round(activeNonCancelled.reduce((sum, b) => sum + getBookingHours(b, now), 0) * 100) / 100;
  const totalRevenue = activeNonCancelled.reduce((sum, b) => sum + getBookingCollectedRevenue(b), 0);

  return {
    areaStats,
    userStats,
    totalBookings,
    totalHours,
    totalRevenue,
  };
}
