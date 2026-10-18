import React, { useState } from 'react';
import { DangKy, KhuVuc, NguoiDung, TrangThaiDangKy } from '../types/index.ts';
import { TIET_HOC_INFO, formatDateToVN } from '../utils/bookingRules.ts';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Edit3,
  Trash2,
  RotateCcw,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';

interface MyBookingsProps {
  bookings: DangKy[];
  areas: KhuVuc[];
  users: NguoiDung[];
  currentUser: NguoiDung;
  onEditBooking: (booking: DangKy) => void;
  onCancelBooking: (bookingId: string) => void;
  onReturnArea: (bookingId: string) => void;
  onStartUsingArea: (bookingId: string) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  areas,
  users,
  currentUser,
  onEditBooking,
  onCancelBooking,
  onReturnArea,
  onStartUsingArea,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewAllBookings, setViewAllBookings] = useState<boolean>(false);
  const [returningBookingId, setReturningBookingId] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  const isAdminOrBgh = currentUser.idVaiTro === 'admin' || currentUser.idVaiTro === 'bgh';
  const areaMap = new Map(areas.map((a) => [a.id, a]));
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Filter list
  const userBookings = bookings.filter((b) => {
    // If not admin or if user wants to see their own
    if (!isAdminOrBgh || !viewAllBookings) {
      if (b.idNguoiDung !== currentUser.id) return false;
    }

    if (filterStatus !== 'all' && b.trangThai !== filterStatus) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const area = areaMap.get(b.idKhuVuc);
      const user = userMap.get(b.idNguoiDung);
      const matchArea = area?.tenKhuVuc.toLowerCase().includes(term);
      const matchDate = b.ngaySuDung.includes(term);
      const matchPurpose = b.mucDichSuDung?.toLowerCase().includes(term);
      const matchUser = user?.hoTen.toLowerCase().includes(term);
      if (!matchArea && !matchDate && !matchPurpose && !matchUser) return false;
    }

    return true;
  });

  // Render Status Badge
  const renderStatus = (status: TrangThaiDangKy) => {
    switch (status) {
      case 'đã đăng ký':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Đã đăng ký
          </span>
        );
      case 'đang sử dụng':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> Đang sử dụng
          </span>
        );
      case 'đã trả':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã trả khu vực
          </span>
        );
      case 'đã hủy':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Quản Lý Lượt Đăng Ký Mượn / Thuê
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Chỉnh sửa, hủy lịch mượn chưa dùng hoặc xác nhận trả khu vực sau khi sử dụng xong
            </p>
          </div>

          {isAdminOrBgh && (
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewAllBookings(false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  !viewAllBookings
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Của tôi ({bookings.filter((b) => b.idNguoiDung === currentUser.id).length})
              </button>
              <button
                type="button"
                onClick={() => setViewAllBookings(true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  viewAllBookings
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toàn trường ({bookings.length})
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo khu vực, người đăng ký, mục đích..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="đang sử dụng">Đang sử dụng</option>
              <option value="đã đăng ký">Đã đăng ký (Chờ sử dụng)</option>
              <option value="đã trả">Đã hoàn trả</option>
              <option value="đã hủy">Đã hủy</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-end font-medium">
            Tìm thấy {userBookings.length} lượt đăng ký
          </div>
        </div>
      </div>

      {/* Bookings Cards List */}
      {userBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Chưa có lượt đăng ký nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không tìm thấy thông tin phù hợp với bộ lọc. Bạn có thể sang tab "Lịch Thể Thao" để đăng ký mượn hoặc thuê sân ngay.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {userBookings.map((b) => {
            const area = areaMap.get(b.idKhuVuc);
            const borrower = userMap.get(b.idNguoiDung);
            const isOwner = b.idNguoiDung === currentUser.id;
            const canManage = isOwner || isAdminOrBgh;

            let timeDetails = '';
            if (b.gioBatDau && b.gioKetThuc) {
              timeDetails = `${b.gioBatDau} - ${b.gioKetThuc} (Theo giờ cuối tuần)`;
            } else if (b.buoi && b.tiet) {
              const pInfo = TIET_HOC_INFO[b.buoi]?.[b.tiet]?.thoiGian || '';
              timeDetails = `Buổi ${b.buoi} · Tiết ${b.tiet} (${pInfo})`;
            }

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      {area?.tenKhuVuc || 'Khu vực thể thao'}
                    </span>
                    {renderStatus(b.trangThai)}
                    {viewAllBookings && borrower && (
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {borrower.hoTen} {borrower.lop ? `(${borrower.lop})` : `(${borrower.idVaiTro})`}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.thu}, {b.ngaySuDung}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {timeDetails}
                    </span>
                    {b.tongTien ? (
                      <span className="font-semibold text-emerald-700 font-mono">
                        Phí: {b.tongTien.toLocaleString('vi-VN')} đ
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        Miễn phí (Tiết học chính khóa)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Mục đích:</span>{' '}
                    {b.mucDichSuDung || 'Học tập / Giải trí'}
                  </div>

                  {b.thoiGianTra && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block font-mono">
                      ✓ Đã ghi nhận trả khu vực vào lúc: <strong>{b.thoiGianTra}</strong>
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                {canManage && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* If registered -> start using */}
                    {b.trangThai === 'đã đăng ký' && (
                      <button
                        type="button"
                        onClick={() => onStartUsingArea(b.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Nhận & Dùng Sân
                      </button>
                    )}

                    {/* If in use -> Confirm Return */}
                    {b.trangThai === 'đang sử dụng' && (
                      <button
                        type="button"
                        onClick={() => setReturningBookingId(b.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Trả Khu Vực
                      </button>
                    )}

                    {/* If registered -> can Edit */}
                    {b.trangThai === 'đã đăng ký' && (
                      <button
                        type="button"
                        onClick={() => onEditBooking(b)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Chỉnh Sửa
                      </button>
                    )}

                    {/* If registered -> can Cancel */}
                    {b.trangThai === 'đã đăng ký' && (
                      <button
                        type="button"
                        onClick={() => setCancelingBookingId(b.id)}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hủy Đăng Ký
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Return Confirmation Modal */}
      {returningBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Xác Nhận Trả Khu Vực Thể Thao
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Bạn có chắc chắn muốn kết thúc sử dụng và bàn giao lại khu vực thể thao? Hệ thống sẽ tự động lưu lại thời điểm trả thực tế để Ban giám hiệu theo dõi.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReturningBookingId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  onReturnArea(returningBookingId);
                  setReturningBookingId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Xác Nhận Trả Sân
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelingBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Xác Nhận Hủy Đăng Ký Khu Vực
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Hủy đăng ký sẽ giải phóng lịch này để giáo viên hoặc học sinh khác có thể mượn/thuê. Bạn có chắc chắn muốn hủy?
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelingBookingId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  onCancelBooking(cancelingBookingId);
                  setCancelingBookingId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Hủy Đăng Ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
