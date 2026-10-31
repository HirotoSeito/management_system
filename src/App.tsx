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
import { LoginModal } from './components/LoginModal.tsx';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  School,
  Clock,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<NguoiDung[]>(() => {
    try {
      const saved = localStorage.getItem('sports_users_lqd');
      if (saved) {
        const parsed: NguoiDung[] = JSON.parse(saved);
        // Clean out any legacy bao_ve role accounts
        return parsed.filter((u) => (u.idVaiTro as string) !== 'bao_ve');
      }
      return INITIAL_NGUOI_DUNG;
    } catch {
      return INITIAL_NGUOI_DUNG;
    }
  });

  const [areas, setAreas] = useState<KhuVuc[]>(() => {
    try {
      const saved = localStorage.getItem('sports_areas_lqd');
      return saved ? JSON.parse(saved) : INITIAL_KHU_VUC;
    } catch {
      return INITIAL_KHU_VUC;
    }
  });

  const [bookings, setBookings] = useState<DangKy[]>(() => {
    try {
      const saved = localStorage.getItem('sports_bookings_lqd');
      const rawList: DangKy[] = saved ? JSON.parse(saved) : generateInitialBookings();
      // School does not teach PE in the morning on weekdays
      return rawList.map((b) => {
        if (b.thu && !['Thứ 7', 'Chủ nhật'].includes(b.thu) && b.buoi === 'sáng') {
          return { ...b, buoi: 'chiều' as const };
        }
        return b;
      });
    } catch {
      return generateInitialBookings();
    }
  });

  const [currentUser, setCurrentUser] = useState<NguoiDung | null>(() => {
    try {
      const savedUser = localStorage.getItem('sports_current_user_lqd');
      if (savedUser) {
        const parsed: NguoiDung = JSON.parse(savedUser);
        if ((parsed.idVaiTro as string) !== 'bao_ve') return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sports_current_user_lqd');
    showToast('Đã đăng xuất tài khoản.', 'info');
  };

  const handleLoginSuccess = (loggedInUser: NguoiDung) => {
    setCurrentUser(loggedInUser);
    localStorage.setItem('sports_current_user_lqd', JSON.stringify(loggedInUser));
    setIsLoginModalOpen(false);
    showToast(`Đăng nhập thành công: ${loggedInUser.hoTen} (${loggedInUser.idVaiTro})`, 'success');
  };

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities'
  >('schedule');

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Partial<DangKy> | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<DangKy | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
      localStorage.setItem('sports_users_lqd', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('sports_areas_lqd', JSON.stringify(areas));
    } catch (e) {
      console.error(e);
    }
  }, [areas]);

  useEffect(() => {
    try {
      localStorage.setItem('sports_bookings_lqd', JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  // Statistics tab is restricted to Ban Giám Hiệu and Admin only
  useEffect(() => {
    if (activeTab === 'stats' && currentUser?.idVaiTro !== 'admin' && currentUser?.idVaiTro !== 'bgh') {
      setActiveTab('schedule');
    }
  }, [currentUser, activeTab]);

  // Reset to default seed
  const handleResetData = () => {
    const defaultUsers = INITIAL_NGUOI_DUNG;
    const defaultAreas = INITIAL_KHU_VUC;
    const defaultBookings = generateInitialBookings();

    setUsers(defaultUsers);
    setAreas(defaultAreas);
    setBookings(defaultBookings);
    setCurrentUser(null);
    localStorage.removeItem('sports_users_lqd');
    localStorage.removeItem('sports_areas_lqd');
    localStorage.removeItem('sports_bookings_lqd');
    localStorage.removeItem('sports_current_user_lqd');
    showToast('Đã khôi phục dữ liệu gốc. Vui lòng đăng nhập tài khoản của bạn.', 'info');
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
    showToast('Đã nhận sân và bắt đầu tiết dạy/buổi chơi!', 'success');
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

  const handleAddBatchUsers = (newUsers: NguoiDung[]) => {
    setUsers((prev) => [...prev, ...newUsers]);
    showToast(`Đã nhập thành công ${newUsers.length} tài khoản từ file Excel!`, 'success');
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

      {/* Main Header with Live Clock */}
      <Header
        currentUser={currentUser}
        users={users}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if ((tab === 'booking' || tab === 'my-bookings' || tab === 'users' || tab === 'facilities') && !currentUser) {
            showToast('Vui lòng đăng nhập để thực hiện thao tác này.', 'info');
            setIsLoginModalOpen(true);
            return;
          }
          if (tab === 'booking') {
            setEditingBooking(null);
            setIsBookingModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'schedule' && (
          <ScheduleMatrix
            areas={areas}
            bookings={bookings}
            users={users}
            currentUser={currentUser}
            onOpenBooking={(prefill) => {
              if (!currentUser) {
                showToast('Vui lòng đăng nhập để đăng ký mượn/thuê sân.', 'info');
                setIsLoginModalOpen(true);
                return;
              }
              setEditingBooking(prefill || null);
              setIsBookingModalOpen(true);
            }}
            onViewBookingDetails={(booking) => setSelectedBookingForDetails(booking)}
          />
        )}

        {activeTab === 'my-bookings' && (
          currentUser ? (
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
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 shadow-xs">
              <School className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Yêu cầu đăng nhập</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Vui lòng đăng nhập tài khoản nhà trường để xem danh sách lịch mượn và thuê của bạn.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Đăng Nhập Ngay
              </button>
            </div>
          )
        )}

        {activeTab === 'stats' && (currentUser?.idVaiTro === 'admin' || currentUser?.idVaiTro === 'bgh') && (
          <StatisticsView
            bookings={bookings}
            areas={areas}
            users={users}
          />
        )}

        {activeTab === 'users' && currentUser?.idVaiTro === 'admin' && (
          <AdminUserManagement
            users={users}
            onAddUser={handleAddUser}
            onAddBatchUsers={handleAddBatchUsers}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'facilities' &&
          (currentUser?.idVaiTro === 'bgh' || currentUser?.idVaiTro === 'admin') && (
            <BGHFacilityManagement
              areas={areas}
              onAddArea={handleAddArea}
              onUpdateArea={handleUpdateArea}
              onDeleteArea={handleDeleteArea}
            />
          )}
      </main>

      {/* Booking Form Modal with Google-style representative autocomplete */}
      {currentUser && isBookingModalOpen && (
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
      )}

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <BookingDetailsModal
          booking={selectedBookingForDetails}
          onClose={() => setSelectedBookingForDetails(null)}
          areas={areas}
          users={users}
          currentUser={currentUser}
          onReturnArea={handleReturnArea}
        />
      )}

      {/* Login / Switch Account Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          users={users}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-800">
            Hệ Thống Quản Lý Khu Vực Thể Thao Nội Bộ
          </p>
          <p className="text-slate-600">
            Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang · Phục vụ công tác dạy học và rèn luyện thể chất
          </p>
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Áp dụng độc quyền nội bộ trường</span>
            <span>·</span>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Khôi phục dữ liệu gốc
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
