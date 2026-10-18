import React, { useState, useEffect } from 'react';
import { NguoiDung, KhuVuc, DangKy, VaiTroId } from './types/index.ts';
import {
  INITIAL_NGUOI_DUNG,
  INITIAL_KHU_VUC,
  generateInitialBookings,
} from './data/mockData.ts';
import { formatDateToVN } from './utils/bookingRules.ts';
import { Header } from './components/Header.tsx';
import { ScheduleMatrix } from './components/ScheduleMatrix.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { MyBookings } from './components/MyBookings.tsx';
import { StatisticsView } from './components/StatisticsView.tsx';
import { AdminUserManagement } from './components/AdminUserManagement.tsx';
import { BGHFacilityManagement } from './components/BGHFacilityManagement.tsx';
import { BookingDetailsModal } from './components/BookingDetailsModal.tsx';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // 1. Data state with LocalStorage persistence
  const [users, setUsers] = useState<NguoiDung[]>(() => {
    try {
      const saved = localStorage.getItem('sports_users');
      return saved ? JSON.parse(saved) : INITIAL_NGUOI_DUNG;
    } catch {
      return INITIAL_NGUOI_DUNG;
    }
  });

  const [areas, setAreas] = useState<KhuVuc[]>(() => {
    try {
      const saved = localStorage.getItem('sports_areas');
      return saved ? JSON.parse(saved) : INITIAL_KHU_VUC;
    } catch {
      return INITIAL_KHU_VUC;
    }
  });

  const [bookings, setBookings] = useState<DangKy[]>(() => {
    try {
      const saved = localStorage.getItem('sports_bookings');
      return saved ? JSON.parse(saved) : generateInitialBookings();
    } catch {
      return generateInitialBookings();
    }
  });

  // Current logged in user (Default: Thầy Nguyễn Văn Nam - GV Thể dục)
  const [currentUser, setCurrentUser] = useState<NguoiDung>(() => {
    return users.find((u) => u.id === 'u_gv_nam') || users[0];
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities'
  >('schedule');

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Partial<DangKy> | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<DangKy | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sports_users', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('sports_areas', JSON.stringify(areas));
    } catch (e) {
      console.error(e);
    }
  }, [areas]);

  useEffect(() => {
    try {
      localStorage.setItem('sports_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  // Reset to default seed
  const handleResetData = () => {
    const defaultUsers = INITIAL_NGUOI_DUNG;
    const defaultAreas = INITIAL_KHU_VUC;
    const defaultBookings = generateInitialBookings();

    setUsers(defaultUsers);
    setAreas(defaultAreas);
    setBookings(defaultBookings);
    setCurrentUser(defaultUsers.find((u) => u.id === 'u_gv_nam') || defaultUsers[0]);
    localStorage.removeItem('sports_users');
    localStorage.removeItem('sports_areas');
    localStorage.removeItem('sports_bookings');
    showToast('Đã khôi phục dữ liệu mẫu ban đầu!', 'info');
  };

  // Handlers for Booking
  const handleSaveBooking = (bookingData: DangKy) => {
    setBookings((prev) => {
      const exists = prev.some((b) => b.id === bookingData.id);
      if (exists) {
        return prev.map((b) => (b.id === bookingData.id ? bookingData : b));
      }
      return [bookingData, ...prev];
    });

    const isEdit = editingBooking && editingBooking.id;
    showToast(
      isEdit ? 'Đã cập nhật lượt đăng ký thành công!' : 'Đã đăng ký khu vực thể thao thành công!',
      'success'
    );
  };

  const handleStartUsingArea = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, trangThai: 'đang sử dụng' } : b
      )
    );
    showToast('Đã nhận sân và bắt đầu sử dụng!', 'success');
  };

  const handleReturnArea = (bookingId: string) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes} ${formatDateToVN(now)}`;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              trangThai: 'đã trả',
              thoiGianTra: timeStr,
            }
          : b
      )
    );
    showToast(`Đã xác nhận trả khu vực thể thao (Thời điểm: ${timeStr})`, 'success');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, trangThai: 'đã hủy' } : b
      )
    );
    showToast('Đã hủy lượt đăng ký. Khu vực đã được mở lại cho người khác.', 'info');
  };

  // Handlers for Admin User Management
  const handleAddUser = (newUser: NguoiDung) => {
    setUsers((prev) => [...prev, newUser]);
    showToast(`Đã tạo tài khoản cho "${newUser.hoTen}"!`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.trangThai === 'hoạt động' ? 'bị khóa' : 'hoạt động';
          showToast(
            nextStatus === 'bị khóa'
              ? `Đã khóa tài khoản "${u.hoTen}".`
              : `Đã mở khóa tài khoản "${u.hoTen}".`,
            'info'
          );
          return { ...u, trangThai: nextStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('Đã xóa tài khoản khỏi hệ thống!', 'info');
  };

  // Handlers for BGH Facility Management
  const handleAddArea = (newArea: KhuVuc) => {
    setAreas((prev) => [...prev, newArea]);
    showToast(`Đã thêm khu vực mới "${newArea.tenKhuVuc}"!`, 'success');
  };

  const handleUpdateArea = (updatedArea: KhuVuc) => {
    setAreas((prev) =>
      prev.map((a) => (a.id === updatedArea.id ? updatedArea : a))
    );
    showToast(`Đã cập nhật thông tin khu vực "${updatedArea.tenKhuVuc}"!`, 'success');
  };

  const handleDeleteArea = (areaId: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== areaId));
    showToast('Đã xóa khu vực khỏi danh mục nhà trường!', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentUser={currentUser}
        users={users}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'booking') {
            setEditingBooking(null);
            setIsBookingModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          showToast(`Đang đăng nhập với vai trò: ${user.hoTen}`, 'info');
        }}
        onResetData={handleResetData}
      />

      {/* Hero Announcement & Fast Role Quick-Strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">
              Quy chế mượn/thuê: Thứ 2 - Thứ 6 mượn theo tiết học (Giáo viên) · Thứ 7 & Chủ nhật thuê theo giờ (Học sinh)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Tài khoản kiểm thử nhanh:</span>
            <button
              onClick={() => setCurrentUser(users.find((u) => u.idVaiTro === 'giao_vien') || users[0])}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentUser.idVaiTro === 'giao_vien' ? 'bg-blue-100 text-blue-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Giáo viên
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentUser(users.find((u) => u.idVaiTro === 'hoc_sinh') || users[0])}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentUser.idVaiTro === 'hoc_sinh' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Học sinh
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentUser(users.find((u) => u.idVaiTro === 'bgh') || users[0])}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentUser.idVaiTro === 'bgh' ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              BGH
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentUser(users.find((u) => u.idVaiTro === 'admin') || users[0])}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentUser.idVaiTro === 'admin' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'schedule' && (
          <ScheduleMatrix
            areas={areas}
            bookings={bookings}
            users={users}
            currentUser={currentUser}
            onOpenBooking={(prefill) => {
              setEditingBooking(prefill || null);
              setIsBookingModalOpen(true);
            }}
            onViewBookingDetails={(booking) => setSelectedBookingForDetails(booking)}
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            areas={areas}
            users={users}
            currentUser={currentUser}
            onEditBooking={(booking) => {
              setEditingBooking(booking);
              setIsBookingModalOpen(true);
            }}
            onCancelBooking={handleCancelBooking}
            onReturnArea={handleReturnArea}
            onStartUsingArea={handleStartUsingArea}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsView
            bookings={bookings}
            areas={areas}
            users={users}
          />
        )}

        {activeTab === 'users' && currentUser.idVaiTro === 'admin' && (
          <AdminUserManagement
            users={users}
            onAddUser={handleAddUser}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'facilities' &&
          (currentUser.idVaiTro === 'bgh' || currentUser.idVaiTro === 'admin') && (
            <BGHFacilityManagement
              areas={areas}
              onAddArea={handleAddArea}
              onUpdateArea={handleUpdateArea}
              onDeleteArea={handleDeleteArea}
            />
          )}
      </main>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleSaveBooking}
        areas={areas}
        bookings={bookings}
        users={users}
        currentUser={currentUser}
        initialBooking={editingBooking}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBookingForDetails}
        onClose={() => setSelectedBookingForDetails(null)}
        areas={areas}
        users={users}
        currentUser={currentUser}
        onReturnArea={handleReturnArea}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Hệ Thống Quản Lý Khu Vực Thể Thao Trường Học · Sports Master
          </p>
          <p>
            Kiểm soát thời gian mượn & trả: Sân bóng đá · Sân Pickleball · Sân cầu lông · Khu chơi bóng bàn
          </p>
          <p className="text-[11px] text-slate-400">
            Phiên bản điện tử hỗ trợ báo cáo, chống trùng lịch và xuất dữ liệu Excel
          </p>
        </div>
      </footer>
    </div>
  );
}
