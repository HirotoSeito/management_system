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
  DANH_SACH_LOP_CHUYEN,
} from '../utils/bookingRules.ts';
import { X, Calendar, DollarSign, Clock, ShieldAlert, CheckCircle2, GraduationCap } from 'lucide-react';

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

  // Class selection (Lớp sử dụng dành cho giáo viên chọn khi dạy tiết, hoặc lớp của học sinh)
  const targetUser = users.find((u) => u.id === selectedUserId) || currentUser;
  const [selectedLop, setSelectedLop] = useState<string>(
    initialBooking?.lop || targetUser.lop || DANH_SACH_LOP_CHUYEN[0]
  );

  // Weekend specific fields
  const [gioBatDau, setGioBatDau] = useState<string>(initialBooking?.gioBatDau || '08:00');
  const [gioKetThuc, setGioKetThuc] = useState<string>(initialBooking?.gioKetThuc || '10:00');

  // Purpose
  const [mucDichSuDung, setMucDichSuDung] = useState<string>(
    initialBooking?.mucDichSuDung || ''
  );

  // Derived values
  const dateVN = isoDateToVN(dateIso);
  const thu = getThuTrongTuan(dateVN);
  const isWeekend = isCuoiTuan(thu);
  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  // Update lop if user changes and is a student
  useEffect(() => {
    if (targetUser.idVaiTro === 'hoc_sinh' && targetUser.lop) {
      setSelectedLop(targetUser.lop);
    }
  }, [targetUser]);

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

  const WEEKEND_SLOTS = [
    { start: '07:00', end: '09:00', label: '07:00 - 09:00 (Sáng sớm)' },
    { start: '08:00', end: '10:00', label: '08:00 - 10:00 (Sáng)' },
    { start: '09:00', end: '11:00', label: '09:00 - 11:00 (Sáng muộn)' },
    { start: '14:00', end: '16:00', label: '14:00 - 16:00 (Đầu giờ chiều)' },
    { start: '16:00', end: '18:00', label: '16:00 - 18:00 (Chiều)' },
    { start: '18:00', end: '20:00', label: '18:00 - 20:00 (Tối có đèn)' },
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
      lop: selectedLop || (targetUser.idVaiTro === 'hoc_sinh' ? targetUser.lop : undefined),
      gioBatDau: isWeekend ? gioBatDau : undefined,
      gioKetThuc: isWeekend ? gioKetThuc : undefined,
      trangThai: initialBooking?.trangThai || 'đã đăng ký',
      thoiGianTra: initialBooking?.thoiGianTra || null,
      mucDichSuDung:
        mucDichSuDung.trim() ||
        (isWeekend
          ? `Học sinh lớp ${selectedLop} thuê vui chơi thể thao`
          : `Dạy học thể dục cho lớp ${selectedLop}`),
      tongTien: isWeekend ? rentalCost : 0,
    };

    onSave(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Fixed & Always Visible */}
        <div className="shrink-0 bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
              THPT CHUYÊN LÊ QUÝ ĐÔN – NAM NHA TRANG
            </div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              {isEditing ? 'Chỉnh Sửa Lịch Sử Dụng Khu Vực' : 'Đăng Ký Mượn / Thuê Khu Vực Thể Thao'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Conflict Alert Banner */}
          {conflictCheck.hasConflict && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Không thể đăng ký do trùng lịch:</span>
                <span>{conflictCheck.reason}</span>
              </div>
            </div>
          )}

          {/* Area Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Khu vực thể thao <span className="text-rose-500">*</span>
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
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
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
                    <div className="text-[11px] font-mono font-semibold text-emerald-700 mt-1.5">
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
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.hoTen} ({u.idVaiTro === 'giao_vien' ? 'Giáo viên' : u.idVaiTro === 'hoc_sinh' ? `Học sinh ${u.lop}` : u.idVaiTro})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Day of Week */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Ngày sử dụng <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quy chế theo ngày
              </label>
              <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{thu} ({dateVN})</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  isWeekend ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                }`}>
                  {isWeekend ? 'Cuối tuần: Thuê theo giờ' : 'Trong tuần: Mượn theo tiết'}
                </span>
              </div>
            </div>
          </div>

          {/* Lớp sử dụng (Field #8 trong Bảng dangKy) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Lớp sử dụng (Khối 10, 11, 12 chuyên) <span className="text-rose-500">*</span>
              </label>
              {targetUser.idVaiTro === 'hoc_sinh' && targetUser.lop && (
                <span className="text-[11px] text-slate-500">
                  Lấy từ thông tin tài khoản học sinh
                </span>
              )}
            </div>

            {targetUser.idVaiTro === 'hoc_sinh' && targetUser.lop ? (
              <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 font-mono">
                Lớp: {targetUser.lop}
              </div>
            ) : (
              <select
                value={selectedLop}
                onChange={(e) => setSelectedLop(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                {DANH_SACH_LOP_CHUYEN.map((lopItem) => (
                  <option key={lopItem} value={lopItem}>
                    Lớp {lopItem} (Chuyên Lê Quý Đôn)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mode 1: Weekday (Thứ 2 - Thứ 6) for Teachers */}
          {!isWeekend ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  3. Chọn Buổi & Tiết Học (Thứ 2 - Thứ 6)
                </span>
                <span className="text-[11px] text-slate-500">Giáo viên mượn dạy học</span>
              </div>

              {/* Buổi */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBuoi('sáng')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                    buoi === 'sáng'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
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
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  ⛅ Buổi Chiều (13:00 - 17:15)
                </button>
              </div>

              {/* Tiết học */}
              <div>
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
                  Khung giờ: {TIET_HOC_INFO[buoi][tiet].thoiGian}
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Weekend (Thứ 7 & Chủ Nhật) for Students Hourly Rental */
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  3. Khung Giờ Thuê (Thứ 7 & Chủ Nhật)
                </span>
                <span className="text-[11px] text-slate-500">Học sinh thuê theo giờ</span>
              </div>

              {/* Quick Preset Buttons */}
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
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {slot.start} - {slot.end}
                  </button>
                ))}
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

              {/* Calculated Price */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Tiền thuê dự tính:
                </span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {rentalCost.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          )}

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              4. Mục đích sử dụng
            </label>
            <input
              type="text"
              value={mucDichSuDung}
              onChange={(e) => setMucDichSuDung(e.target.value)}
              placeholder={
                isWeekend
                  ? `VD: Lớp ${selectedLop} thi đấu giao hữu thể thao rèn luyện sức khỏe`
                  : `VD: Dạy thể dục bài chuyền bóng lớp ${selectedLop}`
              }
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>

        {/* Footer - Fixed & Always Visible */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="booking-form"
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
      </div>
    </div>
  );
};
