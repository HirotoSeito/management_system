import React, { useState, useEffect } from 'react';
import { KhuVuc, DangKy, NguoiDung, TietHoc, BuoiTrongNgay, ThuTrongTuan } from '../types/index.ts';
import {
  formatDateToVN,
  vnDateToIso,
  isoDateToVN,
  getThuTrongTuan,
  isCuoiTuan,
  checkBookingConflict,
  calculateRentalCost,
  TIET_HOC_INFO,
} from '../utils/bookingRules.ts';
import { X, Calendar, AlertTriangle, CheckCircle2, DollarSign, Clock, ShieldAlert } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: DangKy) => void;
  areas: KhuVuc[];
  bookings: DangKy[];
  users: NguoiDung[];
  currentUser: NguoiDung;
  initialBooking?: Partial<DangKy> | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  areas,
  bookings,
  users,
  currentUser,
  initialBooking,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialBooking && initialBooking.id);

  // Active facility
  const [selectedAreaId, setSelectedAreaId] = useState<string>(
    initialBooking?.idKhuVuc || areas[0]?.id || ''
  );

  // Borrower user (admin/bgh can register on behalf of teachers/students)
  const canSelectUser = currentUser.idVaiTro === 'admin' || currentUser.idVaiTro === 'bgh';
  const [selectedUserId, setSelectedUserId] = useState<string>(
    initialBooking?.idNguoiDung || currentUser.id
  );

  // Date selection
  const [dateIso, setDateIso] = useState<string>(() => {
    if (initialBooking?.ngaySuDung) {
      return vnDateToIso(initialBooking.ngaySuDung);
    }
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Weekday specific fields
  const [buoi, setBuoi] = useState<BuoiTrongNgay>(initialBooking?.buoi || 'sáng');
  const [tiet, setTiet] = useState<TietHoc>(initialBooking?.tiet || 1);

  // Weekend specific fields
  const [gioBatDau, setGioBatDau] = useState<string>(initialBooking?.gioBatDau || '08:00');
  const [gioKetThuc, setGioKetThuc] = useState<string>(initialBooking?.gioKetThuc || '10:00');

  // Purpose & Notes
  const [mucDichSuDung, setMucDichSuDung] = useState<string>(
    initialBooking?.mucDichSuDung || ''
  );

  // Derived values
  const dateVN = isoDateToVN(dateIso);
  const thu = getThuTrongTuan(dateVN);
  const isWeekend = isCuoiTuan(thu);

  const selectedArea = areas.find((a) => a.id === selectedAreaId);
  const targetUser = users.find((u) => u.id === selectedUserId) || currentUser;

  // Rental cost calculation for weekend
  const rentalCost = isWeekend && selectedArea
    ? calculateRentalCost(selectedArea.giaThueGio, gioBatDau, gioKetThuc)
    : 0;

  // Real-time conflict checking
  const proposedBooking: Partial<DangKy> = {
    id: initialBooking?.id,
    idKhuVuc: selectedAreaId,
    idNguoiDung: selectedUserId,
    ngaySuDung: dateVN,
    thu: thu,
    buoi: !isWeekend ? buoi : undefined,
    tiet: !isWeekend ? tiet : undefined,
    gioBatDau: isWeekend ? gioBatDau : undefined,
    gioKetThuc: isWeekend ? gioKetThuc : undefined,
  };

  const conflictCheck = checkBookingConflict(
    bookings,
    selectedArea,
    proposedBooking,
    initialBooking?.id
  );

  // Common quick hourly slots for weekends
  const WEEKEND_SLOTS = [
    { start: '07:00', end: '09:00', label: '07:00 - 09:00 (Sáng sớm)' },
    { start: '08:00', end: '10:00', label: '08:00 - 10:00 (Sáng phổ biến)' },
    { start: '09:00', end: '11:00', label: '09:00 - 11:00 (Sáng muộn)' },
    { start: '14:00', end: '16:00', label: '14:00 - 16:00 (Đầu giờ chiều)' },
    { start: '16:00', end: '18:00', label: '16:00 - 18:00 (Chiều mát)' },
    { start: '18:00', end: '20:00', label: '18:00 - 20:00 (Tối bật đèn)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictCheck.hasConflict) {
      return;
    }

    const newBooking: DangKy = {
      id: initialBooking?.id || `bk_${Date.now().toString().slice(-6)}`,
      idKhuVuc: selectedAreaId,
      idNguoiDung: selectedUserId,
      ngaySuDung: dateVN,
      thu: thu,
      buoi: !isWeekend ? buoi : undefined,
      tiet: !isWeekend ? tiet : undefined,
      gioBatDau: isWeekend ? gioBatDau : undefined,
      gioKetThuc: isWeekend ? gioKetThuc : undefined,
      trangThai: initialBooking?.trangThai || 'đã đăng ký',
      thoiGianTra: initialBooking?.thoiGianTra || null,
      mucDichSuDung: mucDichSuDung.trim() || (isWeekend ? 'Thuê vui chơi cuối tuần' : 'Giảng dạy thể dục'),
      tongTien: isWeekend ? rentalCost : 0,
    };

    onSave(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {isEditing ? 'Chỉnh Sửa Lượt Đăng Ký Khu Vực' : 'Đăng Ký Mượn / Thuê Khu Vực Thể Thao'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Hệ thống kiểm soát trùng lịch thông minh theo tiết học và khung giờ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Conflict Alert Banner */}
          {conflictCheck.hasConflict && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Không thể đăng ký:</span>
                <span>{conflictCheck.reason}</span>
              </div>
            </div>
          )}

          {/* Area Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Chọn khu vực thể thao <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {areas.map((area) => {
                const isSelected = area.id === selectedAreaId;
                const isMaintenance = area.trangThai !== 'hoạt động';
                return (
                  <button
                    type="button"
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                        : isMaintenance
                        ? 'border-slate-200 bg-slate-100/60 opacity-60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 leading-snug">
                        {area.tenKhuVuc}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {area.trangThai}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-2">
                      {area.giaThueGio.toLocaleString('vi-VN')} đ/h
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User selection (if Admin/BGH) */}
          {canSelectUser && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Người đăng ký đại diện
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.hoTen} ({u.idVaiTro === 'giao_vien' ? 'Giáo viên' : u.idVaiTro === 'hoc_sinh' ? `Học sinh ${u.lop}` : u.idVaiTro})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Ngày sử dụng <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Thứ trong tuần (Tự động nhận diện)
              </label>
              <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{thu} ({dateVN})</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isWeekend ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isWeekend ? 'Cuối tuần: Thuê theo giờ' : 'Trong tuần: Mượn theo tiết'}
                </span>
              </div>
            </div>
          </div>

          {/* Mode 1: Weekday (Thứ 2 - Thứ 6) for Teachers */}
          {!isWeekend ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  3. Chọn Buổi & Tiết Học (Thứ 2 - Thứ 6)
                </span>
                <span className="text-[11px] text-slate-500">Giáo viên mượn để dạy học</span>
              </div>

              {/* Buoi: Sáng / Chiều */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Buổi dạy:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuoi('sáng')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                      buoi === 'sáng'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    ☀️ Buổi Sáng (07:00 - 11:15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuoi('chiều')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                      buoi === 'chiều'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    ⛅ Buổi Chiều (13:00 - 17:15)
                  </button>
                </div>
              </div>

              {/* Tiết: 1, 2, 3, 4, 5 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Tiết học:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as TietHoc[]).map((t) => {
                    const info = TIET_HOC_INFO[buoi][t];
                    const isSelected = tiet === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTiet(t)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-xs">Tiết {t}</div>
                        <div className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {info.thoiGian.split(' - ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 text-right font-mono">
                  Khung giờ đã chọn: {TIET_HOC_INFO[buoi][tiet].thoiGian}
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Weekend (Thứ 7 & Chủ Nhật) for Students Hourly Rental */
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  3. Chọn Khung Giờ Thuê (Thứ 7 & Chủ Nhật)
                </span>
                <span className="text-[11px] text-slate-500">Học sinh thuê vui chơi / giải trí</span>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Chọn nhanh khung giờ phổ biến:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {WEEKEND_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot.start}
                      onClick={() => {
                        setGioBatDau(slot.start);
                        setGioKetThuc(slot.end);
                      }}
                      className={`px-2 py-1.5 text-[11px] rounded-lg border text-left font-mono transition-colors ${
                        gioBatDau === slot.start && gioKetThuc === slot.end
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {slot.start} - {slot.end}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Time Range Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Giờ bắt đầu:
                  </label>
                  <input
                    type="time"
                    required
                    value={gioBatDau}
                    onChange={(e) => setGioBatDau(e.target.value)}
                    className="w-full text-xs font-mono font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Giờ kết thúc:
                  </label>
                  <input
                    type="time"
                    required
                    value={gioKetThuc}
                    onChange={(e) => setGioKetThuc(e.target.value)}
                    className="w-full text-xs font-mono font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Calculated Price Summary */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Tổng phí thuê dự tính:
                </span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {rentalCost.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          )}

          {/* Purpose of usage */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              4. Mục đích sử dụng khu vực
            </label>
            <input
              type="text"
              value={mucDichSuDung}
              onChange={(e) => setMucDichSuDung(e.target.value)}
              placeholder={
                isWeekend
                  ? 'VD: Thi đấu giao hữu bóng đá lớp 11A1, tập luyện CLB'
                  : 'VD: Dạy thể dục lớp 10A2 tiết chuyền bóng, rèn luyện thể lực'
              }
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={conflictCheck.hasConflict}
              className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                conflictCheck.hasConflict
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEditing ? 'Lưu Thay Đổi' : 'Xác Nhận Đăng Ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
