import React, { useState } from 'react';
import { DangKy, KhuVuc, NguoiDung } from '../types/index.ts';
import { formatDateToVN, TIET_HOC_INFO, parseVNDate } from '../utils/bookingRules.ts';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Search,
  Calendar,
  LogOut,
  LogIn,
  FileText,
  User,
  Phone,
  Filter,
} from 'lucide-react';

interface SecurityGuardManagementProps {
  bookings: DangKy[];
  areas: KhuVuc[];
  users: NguoiDung[];
  currentUser: NguoiDung | null;
  onConfirmPayment: (bookingId: string) => void;
  onCheckInArea: (bookingId: string) => void;
  onCheckOutArea: (bookingId: string, notes?: string) => void;
}

export const SecurityGuardManagement: React.FC<SecurityGuardManagementProps> = ({
  bookings,
  areas,
  users,
  currentUser,
  onConfirmPayment,
  onCheckInArea,
  onCheckOutArea,
}) => {
  const todayStr = formatDateToVN(new Date());
  const [selectedFilterDate, setSelectedFilterDate] = useState<'today' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_use' | 'unpaid' | 'returned'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal for check-out with inspection notes
  const [inspectingBooking, setInspectingBooking] = useState<DangKy | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState('Cơ sở vật chất tốt, trả đủ thiết bị, đã tắt điện đèn');

  const userMap = new Map(users.map((u) => [u.id, u]));
  const areaMap = new Map(areas.map((a) => [a.id, a]));

  const filteredBookings = bookings.filter((b) => {
    if (b.trangThai === 'đã hủy') return false;

    // Date filter
    if (selectedFilterDate === 'today' && b.ngaySuDung !== todayStr) {
      return false;
    }

    // Status filter
    if (statusFilter === 'pending' && b.trangThai !== 'đã đăng ký') return false;
    if (statusFilter === 'in_use' && b.trangThai !== 'đang sử dụng') return false;
    if (statusFilter === 'returned' && b.trangThai !== 'đã trả') return false;
    if (statusFilter === 'unpaid' && (b.tongTien || 0) > 0 && b.daThuTien) return false;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const area = areaMap.get(b.idKhuVuc);
      const user = userMap.get(b.idNguoiDung);
      const matchArea = area?.tenKhuVuc.toLowerCase().includes(q);
      const matchRep = b.nguoiDaiDienTen?.toLowerCase().includes(q);
      const matchUser = user?.hoTen.toLowerCase().includes(q);
      const matchClass = b.lop?.toLowerCase().includes(q);
      if (!matchArea && !matchRep && !matchUser && !matchClass) return false;
    }

    return true;
  });

  // Calculate duty statistics for today
  const todayBookings = bookings.filter((b) => b.ngaySuDung === todayStr && b.trangThai !== 'đã hủy');
  const inUseCount = todayBookings.filter((b) => b.trangThai === 'đang sử dụng').length;
  const returnedCount = todayBookings.filter((b) => b.trangThai === 'đã trả').length;
  const todayCashCollected = todayBookings
    .filter((b) => b.daThuTien)
    .reduce((sum, b) => sum + (b.tongTien || 0), 0);

  const handleOpenCheckOutModal = (booking: DangKy) => {
    setInspectingBooking(booking);
    setInspectionNotes('Cơ sở vật chất tốt, trả đủ thiết bị, đã tắt điện đèn.');
  };

  const handleConfirmCheckOut = () => {
    if (inspectingBooking) {
      onCheckOutArea(inspectingBooking.id, inspectionNotes);
      setInspectingBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Duty Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Ca Trực Bảo Vệ & Quản Lý Cổng Thể Thao
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kiểm soát an ninh học sinh vào trường thứ 7 và Chủ nhật, check-in mở cổng, thu tiền trực tiếp và kiểm tra hoàn trả sân.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Hôm nay: {todayStr}
            </span>
          </div>
        </div>

        {/* Quick Duty Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Lượt đăng ký hôm nay
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
              {todayBookings.length} lượt
            </span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-700 block uppercase tracking-wider">
              Đang chơi trong trường
            </span>
            <span className="text-xl font-bold text-blue-900 font-mono mt-0.5 block">
              {inUseCount} ca
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-700 block uppercase tracking-wider">
              Đã kiểm tra trả sân
            </span>
            <span className="text-xl font-bold text-emerald-900 font-mono mt-0.5 block">
              {returnedCount} ca
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-800 block uppercase tracking-wider">
              Tiền mặt thu tại cổng
            </span>
            <span className="text-lg font-bold text-amber-900 font-mono mt-0.5 block">
              {todayCashCollected.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo khu vực, học sinh, lớp..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilterDate('today')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                selectedFilterDate === 'today'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Lịch hôm nay ({todayBookings.length})
            </button>
            <button
              onClick={() => setSelectedFilterDate('all')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                selectedFilterDate === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất cả các ngày
            </button>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Tất cả trạng thái ca trực</option>
              <option value="pending">Chờ vào sân (Đã đăng ký)</option>
              <option value="in_use">Đang sử dụng trong trường</option>
              <option value="unpaid">Chưa thu tiền thuê</option>
              <option value="returned">Đã bàn giao trả sân</option>
            </select>
          </div>
        </div>
      </div>

      {/* Duty List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Không có ca thể thao nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const area = areaMap.get(booking.idKhuVuc);
            const user = userMap.get(booking.idNguoiDung);
            const isWeekend = booking.thu === 'Thứ 7' || booking.thu === 'Chủ nhật';
            const repName = booking.nguoiDaiDienTen || user?.hoTen || 'Chưa rõ';
            const repLop = booking.lop || user?.lop || '—';
            const repPhone = user?.soDienThoai || 'Chưa cập nhật SĐT';

            const timeDisplay = isWeekend
              ? `${booking.gioBatDau} - ${booking.gioKetThuc}`
              : `${booking.buoi === 'sáng' ? 'Sáng' : 'Chiều'} · Tiết ${booking.tiet} (${
                  booking.buoi && booking.tiet ? TIET_HOC_INFO[booking.buoi][booking.tiet]?.thoiGian : ''
                })`;

            const isPending = booking.trangThai === 'đã đăng ký';
            const isInUse = booking.trangThai === 'đang sử dụng';
            const isReturned = booking.trangThai === 'đã trả';

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all ${
                  isInUse
                    ? 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-300/50'
                    : isReturned
                    ? 'border-slate-200 bg-white opacity-85'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Facility & Student info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {area?.tenKhuVuc}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {booking.thu}, {booking.ngaySuDung}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        ⏰ {timeDisplay}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        Đại diện: {repName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Lớp {repLop}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {repPhone}
                      </span>
                    </div>

                    {booking.mucDichSuDung && (
                      <p className="text-xs text-slate-500 italic">
                        "{booking.mucDichSuDung}"
                      </p>
                    )}

                    {/* Operational Timestamps & Notes */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      {booking.thoiGianNhanSan && (
                        <span className="text-blue-700 font-medium">
                          ✓ Vào cổng: {booking.thoiGianNhanSan}
                        </span>
                      )}
                      {booking.thoiGianTra && (
                        <span className="text-emerald-700 font-medium">
                          ✓ Trả sân: {booking.thoiGianTra}
                        </span>
                      )}
                      {booking.ghiChuBaoVe && (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Ghi chú BV: {booking.ghiChuBaoVe}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Payment badge & Actions */}
                  <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isInUse
                            ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse'
                            : isReturned
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {booking.trangThai.toUpperCase()}
                      </span>

                      {/* Payment Status */}
                      {(booking.tongTien || 0) > 0 && (
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                            booking.daThuTien
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          {booking.tongTien?.toLocaleString('vi-VN')} đ
                          <span className="font-sans text-[10px]">
                            {booking.daThuTien ? '(Đã thu tiền)' : '(Chưa thu)'}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Duty Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Cash collection button */}
                      {(booking.tongTien || 0) > 0 && !booking.daThuTien && (
                        <button
                          type="button"
                          onClick={() => onConfirmPayment(booking.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Xác nhận thu {booking.tongTien?.toLocaleString('vi-VN')} đ
                        </button>
                      )}

                      {/* Check-in button */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onCheckInArea(booking.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Mở Cổng & Nhận Sân
                        </button>
                      )}

                      {/* Check-out / Inspect button */}
                      {isInUse && (
                        <button
                          type="button"
                          onClick={() => handleOpenCheckOutModal(booking)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Kiểm Tra & Nhận Lại Sân
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Check-out with condition inspection */}
      {inspectingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Kiểm Tra CSVC & Hoàn Trả Khu Vực
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ghi nhận kiểm tra tình trạng sân bãi, lưới, bóng và thiết bị khi học sinh/giáo viên hoàn trả.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div>
                <strong>Khu vực:</strong> {areaMap.get(inspectingBooking.idKhuVuc)?.tenKhuVuc}
              </div>
              <div>
                <strong>Người trả:</strong> {inspectingBooking.nguoiDaiDienTen || 'Đại diện lớp'} (Lớp {inspectingBooking.lop})
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ghi chú tình trạng thiết bị & vệ sinh:
              </label>
              <textarea
                rows={3}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="VD: Thiết bị tốt, sân sạch, đã tắt toàn bộ đèn điện..."
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setInspectingBooking(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckOut}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác Nhận Đã Nhận Lại Sân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
