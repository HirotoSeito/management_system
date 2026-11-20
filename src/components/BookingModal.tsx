import React, { useState, useEffect, useRef } from 'react';
import type { KhuVuc, DangKy, NguoiDung, TietHoc } from '../types/index.ts';
import {
  vnDateToIso,
  isoDateToVN,
  getThuTrongTuan,
  isCuoiTuan,
  checkBookingConflict,
  calculateBookingCost,
  isSlotInThePast,
  isValidWeekendHours,
  TIET_HOC_INFO,
  DANH_SACH_LOP_CHUYEN,
} from '../utils/bookingRules.ts';
import {
  X,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle2,
  GraduationCap,
  Search,
  Check,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingPayload: Partial<DangKy>, isEdit: boolean) => Promise<void>;
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
  const isEditing = Boolean(initialBooking && initialBooking.id);
  const originalOwner = isEditing
    ? users.find((u) => u.id === initialBooking?.idNguoiDung) || currentUser
    : currentUser;

  const isAdminOrBgh = currentUser.idVaiTro === 'admin' || currentUser.idVaiTro === 'bgh';

  const [selectedAreaId, setSelectedAreaId] = useState<string>(
    initialBooking?.idKhuVuc || areas[0]?.id || ''
  );

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

  const [tiet, setTiet] = useState<TietHoc>(initialBooking?.tiet || 1);
  const [selectedClass, setSelectedClass] = useState<string>(
    initialBooking?.lop && DANH_SACH_LOP_CHUYEN.includes(initialBooking.lop)
      ? initialBooking.lop
      : DANH_SACH_LOP_CHUYEN[0]
  );

  const [gioBatDau, setGioBatDau] = useState<string>(initialBooking?.gioBatDau || '08:00');
  const [gioKetThuc, setGioKetThuc] = useState<string>(initialBooking?.gioKetThuc || '10:00');
  const [mucDichSuDung, setMucDichSuDung] = useState<string>(
    initialBooking?.mucDichSuDung || ''
  );

  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Student picker ONLY for Admin/BGH when creating a new weekend booking on behalf of a student
  const studentUsers = users.filter((u) => u.idVaiTro === 'hoc_sinh' && u.trangThai === 'hoạt động');
  const [bookForStudentOnWeekend, setBookForStudentOnWeekend] = useState<boolean>(
    currentUser.idVaiTro === 'hoc_sinh'
  );
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<NguoiDung | null>(
    currentUser.idVaiTro === 'hoc_sinh' ? currentUser : studentUsers[0] || null
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
      setIsSubmitting(false);
      if (initialBooking?.idKhuVuc) setSelectedAreaId(initialBooking.idKhuVuc);
      else if (areas[0]?.id) setSelectedAreaId(areas[0].id);

      if (initialBooking?.ngaySuDung) {
        setDateIso(vnDateToIso(initialBooking.ngaySuDung));
      } else {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        setDateIso(`${y}-${m}-${d}`);
      }

      setTiet(initialBooking?.tiet || 1);
      setSelectedClass(
        initialBooking?.lop && DANH_SACH_LOP_CHUYEN.includes(initialBooking.lop)
          ? initialBooking.lop
          : DANH_SACH_LOP_CHUYEN[0]
      );
      setGioBatDau(initialBooking?.gioBatDau || '08:00');
      setGioKetThuc(initialBooking?.gioKetThuc || '10:00');
      setMucDichSuDung(initialBooking?.mucDichSuDung || '');

      if (currentUser.idVaiTro === 'hoc_sinh') {
        setBookForStudentOnWeekend(true);
        setSelectedStudent(currentUser);
        setSearchStudentQuery(currentUser.hoTen);
      } else {
        const initStudent =
          initialBooking?.nguoiDaiDienId
            ? studentUsers.find((s) => s.id === initialBooking.nguoiDaiDienId) || null
            : null;
        setBookForStudentOnWeekend(Boolean(initStudent));
        setSelectedStudent(initStudent || studentUsers[0] || null);
        setSearchStudentQuery(initStudent ? initStudent.hoTen : studentUsers[0]?.hoTen || '');
      }
    }
  }, [isOpen, initialBooking, currentUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingStudents = studentUsers.filter((s) => {
    if (!searchStudentQuery.trim()) return true;
    const q = searchStudentQuery.toLowerCase().trim();
    return (
      s.hoTen.toLowerCase().includes(q) ||
      s.tenDangNhap.toLowerCase().includes(q) ||
      (s.lop && s.lop.toLowerCase().includes(q))
    );
  });

  const dateVN = isoDateToVN(dateIso);
  const thu = getThuTrongTuan(dateVN);
  const isWeekend = isCuoiTuan(thu);
  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  // Determine the actual owner / renter user for rules & pricing
  const targetOwnerUser: NguoiDung = isEditing
    ? originalOwner
    : isWeekend && isAdminOrBgh && bookForStudentOnWeekend && selectedStudent
    ? selectedStudent
    : currentUser;

  // Derived class:
  // - On weekdays (T2-T6): teacher/admin/BGH selects class directly from 24 specialized classes!
  // - On weekends (T7-CN): student uses their own class (no class needed if teacher/staff)
  const effectiveLop = !isWeekend
    ? selectedClass
    : targetOwnerUser.idVaiTro === 'hoc_sinh'
    ? targetOwnerUser.lop
    : undefined;

  // Pricing: ONLY students pay weekend rental fees!
  const rentalCost = selectedArea
    ? calculateBookingCost(
        selectedArea.giaThueGio,
        isWeekend,
        targetOwnerUser.idVaiTro,
        gioBatDau,
        gioKetThuc
      )
    : 0;

  const isStudentRegisteringWeekday = targetOwnerUser.idVaiTro === 'hoc_sinh' && !isWeekend;

  const isPastTime = isSlotInThePast(
    dateVN,
    !isWeekend ? { buoi: 'chiều', tiet } : undefined,
    isWeekend ? gioBatDau : undefined
  );

  const weekendHoursCheck = isWeekend ? isValidWeekendHours(gioBatDau, gioKetThuc) : { isValid: true };

  const proposedBooking: Partial<DangKy> = {
    id: initialBooking?.id,
    idKhuVuc: selectedAreaId,
    idNguoiDung: targetOwnerUser.id,
    ngaySuDung: dateVN,
    thu,
    buoi: !isWeekend ? 'chiều' : undefined,
    tiet: !isWeekend ? tiet : undefined,
    gioBatDau: isWeekend ? gioBatDau : undefined,
    gioKetThuc: isWeekend ? gioKetThuc : undefined,
  };

  const conflictCheck = checkBookingConflict(
    bookings,
    selectedArea,
    proposedBooking,
    initialBooking?.id,
    targetOwnerUser.idVaiTro
  );

  const WEEKEND_SLOTS = [
    { start: '07:00', end: '08:30', label: '07:00 - 08:30 (Sáng sớm)' },
    { start: '08:00', end: '10:00', label: '08:00 - 10:00 (Sáng)' },
    { start: '13:00', end: '14:30', label: '13:00 - 14:30 (Đầu giờ chiều)' },
    { start: '14:00', end: '16:00', label: '14:00 - 16:00 (Chiều)' },
    { start: '14:30', end: '16:30', label: '14:30 - 16:30 (Cuối buổi chiều)' },
  ];

  const missingStudentSelection =
    !isEditing && isWeekend && isAdminOrBgh && bookForStudentOnWeekend && !selectedStudent;

  const hasAnyError =
    conflictCheck.hasConflict ||
    isStudentRegisteringWeekday ||
    isPastTime ||
    !weekendHoursCheck.isValid ||
    missingStudentSelection;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnyError || isSubmitting) return;
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const payload: Partial<DangKy> = {
        id: initialBooking?.id,
        idKhuVuc: selectedAreaId,
        ngaySuDung: dateVN,
        buoi: !isWeekend ? 'chiều' : undefined,
        tiet: !isWeekend ? tiet : undefined,
        lop: effectiveLop,
        nguoiDaiDienId:
          !isEditing && isWeekend && isAdminOrBgh && bookForStudentOnWeekend && selectedStudent
            ? selectedStudent.id
            : undefined,
        gioBatDau: isWeekend ? gioBatDau : undefined,
        gioKetThuc: isWeekend ? gioKetThuc : undefined,
        mucDichSuDung:
          mucDichSuDung.trim() ||
          (isWeekend
            ? targetOwnerUser.idVaiTro === 'hoc_sinh'
              ? `Học sinh lớp ${effectiveLop || ''} thuê vui chơi thể thao cuối tuần`
              : `Hoạt động thể thao cuối tuần (${targetOwnerUser.hoTen})`
            : `Dạy học thể dục chính khóa lớp ${effectiveLop || ''}`),
      };

      await onSave(payload, isEditing);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể lưu đăng ký. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
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
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Lỗi từ máy chủ:</span>
                <span>{submitError}</span>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Chủ sở hữu lượt đăng ký: <strong>{originalOwner.hoTen}</strong>
                  {originalOwner.lop ? ` (Lớp ${originalOwner.lop})` : ''}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-blue-200">
                Giữ nguyên chủ lịch
              </span>
            </div>
          )}

          {isStudentRegisteringWeekday && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Quy chế dành cho Học sinh:</span>
                <span>
                  Học sinh không được đại diện đăng ký theo tiết trong tuần. Học sinh chỉ được phép đăng ký thuê sân vào <strong>Thứ 7 và Chủ nhật</strong> theo giờ (Sáng: 07:00 – 10:00, Chiều: 13:00 – 16:30).
                </span>
              </div>
            </div>
          )}

          {isPastTime && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Thời gian đã trôi qua:</span>
                <span>
                  Thời điểm bạn chọn đã qua so với thời gian thực tế hiện tại. Hệ thống không cho phép đăng ký mượn/thuê cho mốc thời gian trong quá khứ.
                </span>
              </div>
            </div>
          )}

          {isWeekend && !weekendHoursCheck.isValid && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Giới hạn giờ thuê cuối tuần:</span>
                <span>{weekendHoursCheck.reason}</span>
              </div>
            </div>
          )}

          {conflictCheck.hasConflict && !isStudentRegisteringWeekday && !isPastTime && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Không thể đăng ký:</span>
                <span>{conflictCheck.reason}</span>
              </div>
            </div>
          )}

          {/* 1. Area Selection */}
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

          {/* 2. Date & Day of Week */}
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
                  {isWeekend ? 'Cuối tuần: Theo giờ' : 'Trong tuần: Theo tiết (GV)'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Class / Renter Context depending on weekday vs weekend */}
          {!isWeekend ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                3. Lớp giảng dạy chính khóa <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                {DANH_SACH_LOP_CHUYEN.map((lopName) => (
                  <option key={lopName} value={lopName}>
                    Lớp {lopName} — Trường THPT Chuyên Lê Quý Đôn
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Giáo viên chọn trực tiếp lớp giảng dạy tiết Thể dục (học sinh không đứng tên đại diện trong tuần).
              </p>
            </div>
          ) : (
            /* Weekend renter block */
            <div className="space-y-2">
              {currentUser.idVaiTro === 'hoc_sinh' ? (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-600">Học sinh đăng ký thuê: </span>
                      <strong className="text-emerald-900">{currentUser.hoTen}</strong>
                      <span className="mx-1 text-slate-400">·</span>
                      <span className="text-slate-700 font-mono">@{currentUser.tenDangNhap}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Lớp: {currentUser.lop || 'Chuyên'}
                  </span>
                </div>
              ) : isAdminOrBgh && !isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      3. Đối tượng sử dụng cuối tuần
                    </label>
                    <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setBookForStudentOnWeekend(false)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                          !bookForStudentOnWeekend ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Bản thân / Nhà trường (Miễn phí)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookForStudentOnWeekend(true)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                          bookForStudentOnWeekend ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Đặt hộ Học sinh (Có phí)
                      </button>
                    </div>
                  </div>

                  {bookForStudentOnWeekend && (
                    <div ref={searchContainerRef} className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchStudentQuery}
                          onFocus={() => setIsSearchOpen(true)}
                          onChange={(e) => {
                            setSearchStudentQuery(e.target.value);
                            setIsSearchOpen(true);
                            if (!e.target.value) setSelectedStudent(null);
                          }}
                          placeholder="Tìm học sinh thuê sân (theo tên, @username hoặc lớp)..."
                          className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>

                      {isSearchOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 max-h-52 overflow-y-auto z-50">
                          {matchingStudents.length === 0 ? (
                            <div className="p-3 text-center text-slate-400 text-xs">
                              Không tìm thấy học sinh nào phù hợp
                            </div>
                          ) : (
                            matchingStudents.map((student) => {
                              const isPicked = selectedStudent?.id === student.id;
                              return (
                                <button
                                  type="button"
                                  key={student.id}
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setSearchStudentQuery(student.hoTen);
                                    setIsSearchOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 ${
                                    isPicked ? 'bg-emerald-50/70 font-bold' : ''
                                  }`}
                                >
                                  <div>
                                    <div className="text-xs font-semibold text-slate-900">{student.hoTen}</div>
                                    <div className="text-[11px] text-slate-500 font-mono">@{student.tenDangNhap}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {student.lop && (
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                                        Lớp {student.lop}
                                      </span>
                                    )}
                                    {isPicked && <Check className="w-4 h-4 text-emerald-600" />}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
                  Cán bộ / Giáo viên đặt lịch sử dụng cuối tuần: <strong>{targetOwnerUser.hoTen}</strong> — <strong>Miễn phí</strong> theo quy chế nhà trường.
                </div>
              )}
            </div>
          )}

          {/* Mode 1: Weekday Periods */}
          {!isWeekend ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  4. Chọn Tiết Học Buổi Chiều (Thứ 2 - Thứ 6)
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Dành riêng cho Giáo viên
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-slate-800">Buổi Chiều (13:30 - 17:35)</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ca dạy Thể dục chính khóa (Miễn phí)
                </span>
              </div>

              <div>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as TietHoc[]).map((t) => {
                    const info = TIET_HOC_INFO['chiều'][t];
                    const isSelected = tiet === t;
                    const isThisTietPast = isSlotInThePast(dateVN, { buoi: 'chiều', tiet: t });

                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTiet(t)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs'
                            : isThisTietPast
                            ? 'border-slate-200 bg-slate-100/80 text-slate-400 opacity-60'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-xs">Tiết {t}</div>
                        <div className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {isThisTietPast ? 'Qua giờ' : info.thoiGian.split(' - ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                  <span>Khung giờ: <strong>Tiết {tiet} ({TIET_HOC_INFO['chiều'][tiet]?.thoiGian})</strong></span>
                  <span className="text-slate-400">45 phút / tiết (nghỉ giải lao 5 phút)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Weekend Hourly Booking */
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  4. Khung Giờ Thuê (Thứ 7 & Chủ Nhật)
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Sáng 07:00–10:00 · Chiều 13:00–16:30
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {WEEKEND_SLOTS.map((slot) => {
                  const isSlotPast = isSlotInThePast(dateVN, undefined, slot.start);
                  return (
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
                          : isSlotPast
                          ? 'border-slate-200 bg-slate-100/70 text-slate-400 opacity-60'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>{slot.start} - {slot.end}</div>
                      <div className="text-[10px] text-slate-400">{isSlotPast ? '(Đã qua)' : slot.label.split('(')[1]?.replace(')', '')}</div>
                    </button>
                  );
                })}
              </div>

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

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  {targetOwnerUser.idVaiTro === 'hoc_sinh'
                    ? 'Tiền thuê dự tính (tối thiểu 30 phút):'
                    : 'Chi phí (Cán bộ / Giáo viên):'}
                </span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {targetOwnerUser.idVaiTro === 'hoc_sinh'
                    ? `${rentalCost.toLocaleString('vi-VN')} đ`
                    : '0 đ (Miễn phí)'}
                </span>
              </div>
            </div>
          )}

          {/* 5. Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              5. Mục đích sử dụng
            </label>
            <input
              type="text"
              value={mucDichSuDung}
              onChange={(e) => setMucDichSuDung(e.target.value)}
              placeholder={
                isWeekend
                  ? `VD: Tập luyện CLB / giao hữu cuối tuần`
                  : `VD: Dạy học môn Thể dục lớp ${effectiveLop || ''}`
              }
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </form>

        {/* Footer */}
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
            disabled={hasAnyError || isSubmitting}
            className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
              hasAnyError || isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Xác Nhận Đăng Ký'}
          </button>
        </div>
      </div>
    </div>
  );
};
