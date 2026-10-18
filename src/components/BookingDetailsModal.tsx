import React from 'react';
import { DangKy, KhuVuc, NguoiDung } from '../types/index.ts';
import { TIET_HOC_INFO } from '../utils/bookingRules.ts';
import {
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  DollarSign,
  Building2,
  GraduationCap,
  Award,
} from 'lucide-react';

interface BookingDetailsModalProps {
  booking: DangKy | null;
  onClose: () => void;
  areas: KhuVuc[];
  users: NguoiDung[];
  currentUser: NguoiDung;
  onReturnArea?: (bookingId: string) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  areas,
  users,
  currentUser,
  onReturnArea,
}) => {
  if (!booking) return null;

  const area = areas.find((a) => a.id === booking.idKhuVuc);
  const borrower = users.find((u) => u.id === booking.idNguoiDung);
  const isOwner = borrower?.id === currentUser.id;
  const isAdminOrBgh = currentUser.idVaiTro === 'admin' || currentUser.idVaiTro === 'bgh';
  const canReturn = (isOwner || isAdminOrBgh) && booking.trangThai === 'đang sử dụng';

  let timeDetails = '';
  if (booking.gioBatDau && booking.gioKetThuc) {
    timeDetails = `${booking.gioBatDau} - ${booking.gioKetThuc} (Thuê theo giờ cuối tuần)`;
  } else if (booking.buoi && booking.tiet) {
    const pInfo = TIET_HOC_INFO[booking.buoi]?.[booking.tiet]?.thoiGian || '';
    timeDetails = `Buổi ${booking.buoi} · Tiết ${booking.tiet} (${pInfo})`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-400">
              Mã Đăng Ký: {booking.id}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Chi Tiết Lượt Sử Dụng Khu Vực
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          {/* Facility */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900">{area?.tenKhuVuc}</div>
                <div className="text-[11px] text-slate-500">{area?.viTri || 'Khuôn viên trường'}</div>
              </div>
            </div>
            <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {area?.trangThai}
            </span>
          </div>

          {/* Time & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">
                NGÀY SỬ DỤNG
              </span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {booking.thu}, {booking.ngaySuDung}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">
                TRẠNG THÁI
              </span>
              <span className="font-bold text-slate-900 capitalize">
                {booking.trangThai}
              </span>
            </div>
          </div>

          {/* Timing detail */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Thời gian:
            </span>
            <span className="font-mono font-bold text-slate-900">
              {timeDetails}
            </span>
          </div>

          {/* Borrower */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">
              NGƯỜI ĐĂNG KÝ
            </span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                {borrower?.hoTen}
              </span>
              <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                {borrower?.idVaiTro === 'giao_vien'
                  ? 'Giáo viên bộ môn'
                  : borrower?.idVaiTro === 'hoc_sinh'
                  ? `Học sinh lớp ${borrower.lop || ''}`
                  : borrower?.idVaiTro}
              </span>
            </div>
            {borrower?.soDienThoai && (
              <div className="text-[11px] text-slate-500">
                SĐT liên hệ: {borrower.soDienThoai}
              </div>
            )}
          </div>

          {/* Purpose */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">
              MỤC ĐÍCH SỬ DỤNG
            </span>
            <span className="text-slate-800">
              {booking.mucDichSuDung || 'Học tập / Giải trí thể thao'}
            </span>
          </div>

          {/* Return Info */}
          {booking.thoiGianTra && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span className="font-bold block">Thời điểm thực tế đã trả khu vực:</span>
              <span className="font-mono text-xs font-semibold">{booking.thoiGianTra}</span>
            </div>
          )}

          {/* Rental Cost */}
          {booking.tongTien ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <span className="text-amber-900 font-medium">Chi phí thuê:</span>
              <span className="font-mono font-bold text-sm text-amber-800">
                {booking.tongTien.toLocaleString('vi-VN')} đ
              </span>
            </div>
          ) : (
            <div className="p-2 text-center text-slate-500 text-[11px]">
              Khu vực sử dụng cho mục đích giảng dạy bộ môn chính khóa (Miễn phí)
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          {canReturn && onReturnArea && (
            <button
              type="button"
              onClick={() => {
                onReturnArea(booking.id);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Xác Nhận Trả Sân Ngay
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
