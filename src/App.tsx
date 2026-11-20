import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { NguoiDung, KhuVuc, DangKy, VaiTroId } from './types/index.ts';
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
  CheckCircle2,
  AlertCircle,
  School,
  RotateCcw,
} from 'lucide-react';

const AUTH_TOKEN_KEY = 'sports_auth_token_lqd';

export default function App() {
  const [users, setUsers] = useState<NguoiDung[]>([]);
  const [areas, setAreas] = useState<KhuVuc[]>([]);
  const [bookings, setBookings] = useState<DangKy[]>([]);
  const [currentUser, setCurrentUser] = useState<NguoiDung | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<
    'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities'
  >('schedule');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Partial<DangKy> | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<DangKy | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage({ text, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const fetchBootstrap = useCallback(async (tokenOverride?: string | null) => {
    const token = tokenOverride !== undefined ? tokenOverride : authToken;
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch('/api/bootstrap', { headers });
      if (!res.ok) throw new Error('Không thể tải dữ liệu hệ thống.');
      const data = await res.json();
      setUsers(data.users || []);
      setAreas(data.areas || []);
      setBookings(data.bookings || []);

      if (token && !data.currentUser) {
        // Token expired or account locked
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken(null);
        setCurrentUser(null);
      } else {
        setCurrentUser(data.currentUser || null);
      }
    } catch (err) {
      console.error('Bootstrap fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  // Real-time Server-Sent Events sync across concurrent users/tabs
  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'sync') {
          fetchBootstrap();
        }
      } catch {
        // ignore heartbeat/parse errors
      }
    };
    return () => {
      es.close();
    };
  }, [fetchBootstrap]);

  // Restrict privileged tabs when user logs out or switches role
  useEffect(() => {
    if (activeTab === 'stats' && currentUser?.idVaiTro !== 'admin' && currentUser?.idVaiTro !== 'bgh') {
      setActiveTab('schedule');
    }
    if (activeTab === 'users' && currentUser?.idVaiTro !== 'admin') {
      setActiveTab('schedule');
    }
    if (activeTab === 'facilities' && currentUser?.idVaiTro !== 'admin' && currentUser?.idVaiTro !== 'bgh') {
      setActiveTab('schedule');
    }
  }, [currentUser, activeTab]);

  const apiRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem(AUTH_TOKEN_KEY);
          setAuthToken(null);
          setCurrentUser(null);
          setIsLoginModalOpen(true);
        }
        throw new Error(data.error || 'Thao tác thất bại.');
      }
      return data;
    },
    [authToken]
  );

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setCurrentUser(null);
    setActiveTab('schedule');
    showToast('Đã đăng xuất tài khoản.', 'info');
  };

  const handleLoginSuccess = async (loggedInUser: NguoiDung, token: string) => {
    try {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // ignore storage errors
    }
    setAuthToken(token);
    setCurrentUser(loggedInUser);
    setIsLoginModalOpen(false);
    await fetchBootstrap(token);
    showToast(`Đăng nhập thành công: ${loggedInUser.hoTen} (${loggedInUser.idVaiTro})`, 'success');
  };

  const handleResetData = async () => {
    try {
      await apiRequest('/api/reset', { method: 'POST' });
      await fetchBootstrap();
      showToast('Đã khôi phục dữ liệu mẫu gốc trong cơ sở dữ liệu.', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể khôi phục dữ liệu.', 'error');
    }
  };

  // --- Booking Handlers ---
  const handleSaveBooking = async (bookingPayload: Partial<DangKy>, isEdit: boolean) => {
    if (isEdit && bookingPayload.id) {
      await apiRequest(`/api/bookings/${bookingPayload.id}`, {
        method: 'PUT',
        body: JSON.stringify(bookingPayload),
      });
      await fetchBootstrap();
      showToast('Đã cập nhật lượt đăng ký thành công!', 'success');
    } else {
      await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload),
      });
      await fetchBootstrap();
      showToast('Đã đăng ký khu vực thể thao thành công!', 'success');
    }
  };

  const handleStartUsingArea = async (bookingId: string) => {
    try {
      await apiRequest(`/api/bookings/${bookingId}/start`, { method: 'POST' });
      await fetchBootstrap();
      showToast('Đã nhận sân và bắt đầu tiết dạy/buổi chơi!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể nhận sân.', 'error');
    }
  };

  const handleReturnArea = async (bookingId: string) => {
    try {
      const data = await apiRequest(`/api/bookings/${bookingId}/return`, { method: 'POST' });
      await fetchBootstrap();
      const returned: DangKy | undefined = data.booking;
      showToast(
        `Đã xác nhận trả khu vực (${returned?.thoiGianTra || 'Thành công'})${
          returned?.ghiChuHeThong ? ` · ${returned.ghiChuHeThong}` : ''
        }`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể trả sân.', 'error');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await apiRequest(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
      await fetchBootstrap();
      showToast('Đã hủy lượt đăng ký. Khu vực đã được mở lại cho người khác.', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể hủy lượt đăng ký.', 'error');
    }
  };

  // --- Admin User Handlers ---
  const handleAddUser = async (newUser: {
    tenDangNhap: string;
    matKhau: string;
    hoTen: string;
    idVaiTro: VaiTroId;
    lop?: string;
    soDienThoai?: string;
    email?: string;
  }) => {
    await apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    });
    await fetchBootstrap();
    showToast(`Đã tạo tài khoản cho "${newUser.hoTen}"!`, 'success');
  };

  const handleAddBatchUsers = async (newUsers: Array<NguoiDung & { matKhau: string }>) => {
    try {
      await apiRequest('/api/users/batch', {
        method: 'POST',
        body: JSON.stringify({ users: newUsers }),
      });
      await fetchBootstrap();
      showToast(`Đã nhập thành công ${newUsers.length} tài khoản từ file Excel!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi nhập danh sách người dùng.', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const data = await apiRequest(`/api/users/${userId}/toggle-status`, { method: 'PATCH' });
      await fetchBootstrap();
      const updated: NguoiDung | undefined = data.user;
      if (updated) {
        showToast(
          updated.trangThai === 'bị khóa'
            ? `Đã khóa tài khoản "${updated.hoTen}".`
            : `Đã mở khóa tài khoản "${updated.hoTen}".`,
          'info'
        );
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái tài khoản.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiRequest(`/api/users/${userId}`, { method: 'DELETE' });
      await fetchBootstrap();
      showToast('Đã xóa tài khoản khỏi hệ thống!', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể xóa tài khoản.', 'error');
    }
  };

  // --- BGH Facility Handlers ---
  const handleAddArea = async (newArea: Omit<KhuVuc, 'id'>) => {
    try {
      await apiRequest('/api/areas', {
        method: 'POST',
        body: JSON.stringify(newArea),
      });
      await fetchBootstrap();
      showToast(`Đã thêm khu vực mới "${newArea.tenKhuVuc}"!`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể thêm khu vực.', 'error');
    }
  };

  const handleUpdateArea = async (updatedArea: KhuVuc) => {
    try {
      const data = await apiRequest(`/api/areas/${updatedArea.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedArea),
      });
      await fetchBootstrap();
      const cancelledCount = Number(data.cancelledCount || 0);
      showToast(
        cancelledCount > 0
          ? `Đã cập nhật "${updatedArea.tenKhuVuc}" và tự động hủy ${cancelledCount} lịch chờ chưa dùng.`
          : `Đã cập nhật thông tin khu vực "${updatedArea.tenKhuVuc}"!`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể cập nhật khu vực.', 'error');
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    try {
      await apiRequest(`/api/areas/${areaId}`, { method: 'DELETE' });
      await fetchBootstrap();
      showToast('Đã xóa khu vực khỏi danh mục nhà trường!', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Không thể xóa khu vực.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md">
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      <Header
        currentUser={currentUser}
        users={users}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if ((tab === 'booking' || tab === 'my-bookings' || tab === 'users' || tab === 'facilities' || tab === 'stats') && !currentUser) {
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            Đang kết nối cơ sở dữ liệu nhà trường...
          </div>
        ) : (
          <>
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
                onNotify={showToast}
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
                bookings={bookings}
                onAddUser={handleAddUser}
                onAddBatchUsers={handleAddBatchUsers}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
                onNotify={showToast}
              />
            )}

            {activeTab === 'facilities' &&
              (currentUser?.idVaiTro === 'bgh' || currentUser?.idVaiTro === 'admin') && (
                <BGHFacilityManagement
                  areas={areas}
                  bookings={bookings}
                  onAddArea={handleAddArea}
                  onUpdateArea={handleUpdateArea}
                  onDeleteArea={handleDeleteArea}
                />
              )}
          </>
        )}
      </main>

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

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

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
            {currentUser?.idVaiTro === 'admin' && (
              <>
                <span>·</span>
                <button
                  onClick={handleResetData}
                  className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Khôi phục dữ liệu gốc
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
