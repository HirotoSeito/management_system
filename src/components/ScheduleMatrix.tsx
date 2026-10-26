import React, { useState } from 'react';
import { KhuVuc, DangKy, NguoiDung, TietHoc, BuoiTrongNgay, ThuTrongTuan } from '../types/index.ts';
import {
  formatDateToVN,
  isoDateToVN,
  vnDateToIso,
  getThuTrongTuan,
  isCuoiTuan,
  isSlotInThePast,
  TIET_HOC_INFO,
} from '../utils/bookingRules.ts';
import { Calendar, Filter, Clock, CheckCircle2, User, AlertCircle, Plus, Info, GraduationCap } from 'lucide-react';

interface ScheduleMatrixProps {
  areas: KhuVuc[];
  bookings: DangKy[];
  users: NguoiDung[];
  currentUser: NguoiDung | null;
  onOpenBooking: (prefill?: Partial<DangKy>) => void;
  onViewBookingDetails: (booking: DangKy) => void;
}

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  areas,
  bookings,
  users,
  currentUser,
  onOpenBooking,
  onViewBookingDetails,
}) => {
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<'all' | 'sáng' | 'chiều'>('all');

  const selectedDateVN = isoDateToVN(selectedDateIso);
  const selectedThu = getThuTrongTuan(selectedDateVN);
  const isWeekend = isCuoiTuan(selectedThu);

  const handleQuickDate = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setSelectedDateIso(`${y}-${m}-${d}`);
  };

  const userMap = new Map(users.map((u) => [u.id, u]));

  const displayedAreas = areas.filter((a) => {
    if (selectedAreaId !== 'all' && a.id !== selectedAreaId) return false;
    return true;
  });

  const bookingsOnDate = bookings.filter(
    (b) => b.ngaySuDung === selectedDateVN && b.trangThai !== 'đã hủy'
  );

  const renderStatusBadge = (status: DangKy['trangThai']) => {
    switch (status) {
      case 'đã đăng ký':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3" /> Đã đăng ký
          </span>
        );
      case 'đang sử dụng':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Đang sử dụng
          </span>
        );
      case 'đã trả':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Đã trả
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Lịch Sử Dụng Khu Vực Thể Thao
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {selectedThu}, {selectedDateVN}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang ·{' '}
              {isWeekend
                ? 'Thứ 7 & Chủ nhật: Học sinh thuê theo giờ để vui chơi, thể thao.'
                : 'Thứ 2 - Thứ 6: Giáo viên mượn và trả theo tiết học để dạy học theo lớp.'}
            </p>
          </div>

          <button
            onClick={() =>
              onOpenBooking({
                ngaySuDung: selectedDateVN,
                thu: selectedThu,
                idKhuVuc: selectedAreaId !== 'all' ? selectedAreaId : areas[0]?.id,
              })
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Đăng Ký Khu Vực Mới
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Chọn ngày xem lịch
            </label>
            <input
              type="date"
              value={selectedDateIso}
              onChange={(e) => setSelectedDateIso(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Quick Dates */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Chuyển nhanh ngày
            </label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDate(0)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Ngày mai
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(2)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                +2 ngày
              </button>
            </div>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lọc theo khu vực
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">Tất cả khu vực ({areas.length})</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.tenKhuVuc} ({a.trangThai})
                </option>
              ))}
            </select>
          </div>

          {/* Session filter */}
          {!isWeekend ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Ca học Thể dục
              </label>
              <div className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-900">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Buổi Chiều (Tiết 1 – 5: 13:30 - 17:35)</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Lọc khung giờ thuê
              </label>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedSessionFilter('all')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedSessionFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cả ngày
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSessionFilter('sáng')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedSessionFilter === 'sáng'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sáng (7h-10h)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSessionFilter('chiều')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedSessionFilter === 'chiều'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chiều (13h-16h30)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Trạng thái:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300"></span>
            Còn trống (Có thể đăng ký)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></span>
            Đã đăng ký
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-50 border border-blue-300"></span>
            Đang sử dụng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
            Đã hoàn trả
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-50 border border-rose-300"></span>
            Bảo trì / Ngừng sử dụng
          </span>
        </div>
      </div>

      {/* Main Timetable Matrix */}
      {!isWeekend ? (
        /* Weekday Period Matrix (Chỉ có Buổi Chiều vì Buổi Sáng không dạy Thể dục) */
        <div className="space-y-6">
          {/* Afternoon Session */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Buổi Chiều — Tiết Học 1 Đến 5 (13:30 - 17:35)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                45 phút / tiết · Giải lao 5 phút giữa các tiết
              </span>
            </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 w-36 border-r border-slate-200">Tiết học / Giờ</th>
                      {displayedAreas.map((area) => (
                        <th key={area.id} className="py-3 px-4 min-w-[230px] border-r border-slate-200 last:border-r-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-slate-900 font-bold">{area.tenKhuVuc}</span>
                            {area.trangThai === 'bảo trì' ? (
                              <span className="text-[10px] text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Bảo trì
                              </span>
                            ) : area.trangThai === 'ngừng sử dụng' ? (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Ngừng
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Hoạt động
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {([1, 2, 3, 4, 5] as TietHoc[]).map((tiet) => {
                      const periodInfo = TIET_HOC_INFO['chiều'][tiet];
                      return (
                        <tr key={`chieu-${tiet}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/30 border-r border-slate-200">
                            <div>{periodInfo.label}</div>
                            <div className="text-[11px] font-mono text-slate-500 font-normal">
                              {periodInfo.thoiGian}
                            </div>
                          </td>

                          {displayedAreas.map((area) => {
                            const slotBooking = bookingsOnDate.find(
                              (b) => b.idKhuVuc === area.id && b.buoi === 'chiều' && Number(b.tiet) === tiet
                            );

                            const user = slotBooking ? userMap.get(slotBooking.idNguoiDung) : null;
                            const isMaintenance = area.trangThai !== 'hoạt động';

                            if (isMaintenance) {
                              return (
                                <td
                                  key={area.id}
                                  className="p-2 border-r border-slate-200 last:border-r-0 bg-slate-100/70 text-slate-400"
                                >
                                  <div className="p-2.5 rounded-lg border border-dashed border-slate-300 text-center text-xs">
                                    <AlertCircle className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" />
                                    <span>Tạm ngưng ({area.trangThai})</span>
                                  </div>
                                </td>
                              );
                            }

                            if (slotBooking) {
                              const isMyBooking = currentUser ? slotBooking.idNguoiDung === currentUser.id : false;
                              const lopHoc = slotBooking.lop || (user?.lop ? user.lop : '');

                              return (
                                <td
                                  key={area.id}
                                  className="p-2 border-r border-slate-200 last:border-r-0 align-top"
                                >
                                  <div
                                    onClick={() => onViewBookingDetails(slotBooking)}
                                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all hover:shadow-xs ${
                                      slotBooking.trangThai === 'đang sử dụng'
                                        ? 'bg-blue-50/70 border-blue-200'
                                        : slotBooking.trangThai === 'đã trả'
                                        ? 'bg-slate-50 border-slate-200 opacity-80'
                                        : 'bg-amber-50/70 border-amber-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <div className="font-bold text-slate-900 truncate">
                                        {user?.hoTen || 'Giáo viên'}
                                      </div>
                                      {renderStatusBadge(slotBooking.trangThai)}
                                    </div>

                                    {/* Class information */}
                                    {lopHoc && (
                                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded my-0.5">
                                        <GraduationCap className="w-3 h-3" />
                                        Lớp {lopHoc}
                                      </div>
                                    )}

                                    <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                                      {slotBooking.mucDichSuDung || 'Giảng dạy thể dục'}
                                    </div>
                                    {isMyBooking && (
                                      <div className="mt-1 text-[10px] font-semibold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                                        Lịch của bạn
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            }

                            // Empty slot handling
                            const isPastSlot = isSlotInThePast(selectedDateVN, { buoi: 'chiều', tiet });
                            const isStudent = currentUser?.idVaiTro === 'hoc_sinh';

                            if (isPastSlot) {
                              return (
                                <td
                                  key={area.id}
                                  className="p-2 border-r border-slate-200 last:border-r-0 bg-slate-50/50"
                                >
                                  <div className="w-full h-full min-h-[64px] p-2 rounded-lg border border-dashed border-slate-200 bg-slate-100/60 flex flex-col items-center justify-center text-center text-slate-400 select-none">
                                    <span className="text-[11px] font-medium flex items-center gap-1 text-slate-400">
                                      <Clock className="w-3 h-3" /> Đã qua giờ
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Tiết {tiet} (Hết hạn)
                                    </span>
                                  </div>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={area.id}
                                className="p-2 border-r border-slate-200 last:border-r-0 group"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isStudent) {
                                      alert('Quy chế nhà trường: Học sinh không được đại diện đăng ký theo tiết trong tuần. Học sinh chỉ được đăng ký thuê sân vào Thứ 7 và Chủ nhật.');
                                      return;
                                    }
                                    onOpenBooking({
                                      idKhuVuc: area.id,
                                      ngaySuDung: selectedDateVN,
                                      thu: selectedThu,
                                      buoi: 'chiều',
                                      tiet: tiet,
                                    });
                                  }}
                                  className="w-full h-full min-h-[64px] p-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-500 transition-colors flex flex-col items-center justify-center text-center text-emerald-700"
                                >
                                  <span className="text-[11px] font-semibold flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Còn trống
                                  </span>
                                  <span className="text-[10px] text-emerald-600/80">
                                    {isStudent ? 'Chỉ dành cho GV' : `Bấm mượn tiết ${tiet}`}
                                  </span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      ) : (
        /* Weekend Hourly Booking View (Thứ 7 & Chủ Nhật) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedAreas.map((area) => {
            const areaBookings = bookingsOnDate.filter((b) => b.idKhuVuc === area.id);
            const isMaintenance = area.trangThai !== 'hoạt động';

            return (
              <div
                key={area.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col"
              >
                {/* Area Header & Image */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  {area.hinhAnh ? (
                    <img
                      src={area.hinhAnh}
                      alt={area.tenKhuVuc}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-800 to-slate-900 flex items-center justify-center text-white">
                      <Calendar className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {area.tenKhuVuc}
                      </h3>
                      {isMaintenance ? (
                        <span className="text-[11px] font-semibold bg-rose-500 text-white px-2 py-0.5 rounded">
                          {area.trangThai}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded">
                          Sẵn sàng cho thuê
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-200 mt-1">
                      <span>{area.viTri || 'Khuôn viên trường Lê Quý Đôn'}</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {area.giaThueGio.toLocaleString('vi-VN')} đ/giờ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bookings / Hourly Timeline */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                      <span>Lịch thuê trong ngày ({selectedDateVN})</span>
                      <span className="text-slate-500 font-normal">
                        {areaBookings.length} lượt thuê
                      </span>
                    </div>

                    {areaBookings.length === 0 ? (
                      <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-center text-xs text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                        Khu vực chưa có ai thuê hôm nay. Toàn bộ các khung giờ đều còn trống!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {areaBookings.map((b) => {
                          const renter = userMap.get(b.idNguoiDung);
                          const lopDisplay = b.lop || renter?.lop;

                          return (
                            <div
                              key={b.id}
                              onClick={() => onViewBookingDetails(b)}
                              className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {b.gioBatDau} - {b.gioKetThuc}
                                </span>
                                {renderStatusBadge(b.trangThai)}
                              </div>
                              <div className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                                <span>{renter?.hoTen}</span>
                                {lopDisplay && (
                                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                                    Lớp {lopDisplay}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {b.mucDichSuDung || 'Thuê vui chơi thể thao'} ·{' '}
                                <span className="font-mono font-medium text-emerald-700">
                                  {b.tongTien ? b.tongTien.toLocaleString('vi-VN') + ' đ' : 'Miễn phí'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Booking Action */}
                  <button
                    disabled={isMaintenance}
                    onClick={() =>
                      onOpenBooking({
                        idKhuVuc: area.id,
                        ngaySuDung: selectedDateVN,
                        thu: selectedThu,
                      })
                    }
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      isMaintenance
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {isMaintenance ? 'Đang bảo trì - Không thể thuê' : 'Thuê sân khung giờ mới'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
