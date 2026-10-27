import React, { useState, useEffect } from 'react';
import { NguoiDung, VaiTroId } from '../types/index.ts';
import {
  Calendar,
  UserCheck,
  Shield,
  Award,
  GraduationCap,
  Building2,
  BarChart3,
  Users,
  LayoutGrid,
  LogOut,
  ChevronDown,
  School,
  Lock,
  LogIn,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  currentUser: NguoiDung | null;
  users: NguoiDung[];
  activeTab: 'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities' | 'security';
  setActiveTab: (tab: 'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities' | 'security') => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  activeTab,
  setActiveTab,
  onOpenLoginModal,
  onLogout,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClockTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatClockDate = (date: Date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${days[date.getDay()]}, ${d}/${m}/${y}`;
  };

  const getRoleBadge = (roleId: VaiTroId) => {
    switch (roleId) {
      case 'admin':
        return { label: 'Quản trị viên', icon: Shield, color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'bgh':
        return { label: 'Ban giám hiệu', icon: Building2, color: 'text-purple-800 bg-purple-50 border-purple-200' };
      case 'giao_vien':
        return { label: 'Giáo viên bộ môn', icon: Award, color: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'hoc_sinh':
        return { label: 'Học sinh', icon: GraduationCap, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'bao_ve':
        return { label: 'Bảo vệ trường', icon: ShieldCheck, color: 'text-amber-900 bg-amber-100 border-amber-300' };
    }
  };

  const roleInfo = currentUser ? getRoleBadge(currentUser.idVaiTro) : null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand - Specific to THPT Chuyên Lê Quý Đôn - Nam Nha Trang */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block leading-none">
                THPT Chuyên Lê Quý Đôn
              </span>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
                Quản Lý Khu Thể Thao
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Lịch Thể Thao
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'booking'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Đăng Ký Mượn/Thuê
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'my-bookings'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Lịch Của Tôi
            </button>

            {/* BGH & Admin only tab: Statistics */}
            {(currentUser?.idVaiTro === 'admin' || currentUser?.idVaiTro === 'bgh') && (
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'stats'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Thống Kê & Báo Cáo
              </button>
            )}

            {/* Admin only tab */}
            {currentUser?.idVaiTro === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Tài Khoản (Admin)
              </button>
            )}

            {/* BGH & Admin tab */}
            {(currentUser?.idVaiTro === 'bgh' || currentUser?.idVaiTro === 'admin') && (
              <button
                onClick={() => setActiveTab('facilities')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'facilities'
                    ? 'bg-purple-100 text-purple-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Khu Vực (BGH)
              </button>
            )}

            {/* Security Guard tab: Bao Ve, Admin, BGH */}
            {(currentUser?.idVaiTro === 'bao_ve' || currentUser?.idVaiTro === 'admin' || currentUser?.idVaiTro === 'bgh') && (
              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                    : 'text-amber-800 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Ca Trực Bảo Vệ
              </button>
            )}
          </nav>

          {/* Right section: Live System Clock & User profile */}
          <div className="flex items-center gap-3">
            {/* Live Clock Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <div className="text-left leading-tight">
                <div className="text-[11px] font-mono font-bold text-slate-800">
                  {formatClockTime(currentTime)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {formatClockDate(currentTime)}
                </div>
              </div>
            </div>

            {/* User profile with realistic School Account dropdown */}
            <div className="relative flex items-center gap-2">
            {currentUser && roleInfo ? (
              <>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  aria-label="Thông tin tài khoản"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {currentUser.hoTen.slice(0, 2)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                      {currentUser.hoTen}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>{roleInfo.label}</span>
                      {currentUser.lop && <span className="font-semibold text-emerald-700">· {currentUser.lop}</span>}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Account Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <div className="text-xs font-bold text-slate-900">
                        {currentUser.hoTen}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tên đăng nhập: <span className="font-mono text-slate-700">@{currentUser.tenDangNhap}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                        {currentUser.lop && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Lớp {currentUser.lop}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenLoginModal();
                        }}
                        className="w-full px-3 py-2 text-xs text-left text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Lock className="w-4 h-4 text-slate-500" />
                        Đổi tài khoản đăng nhập
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2 text-xs text-left text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        Đăng xuất tài khoản
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
            )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 py-2 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'schedule' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600'
            }`}
          >
            Lịch
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'booking' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600'
            }`}
          >
            Đăng ký
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'my-bookings' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600'
            }`}
          >
            Lịch của tôi
          </button>
          {(currentUser?.idVaiTro === 'admin' || currentUser?.idVaiTro === 'bgh') && (
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                activeTab === 'stats' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600'
              }`}
            >
              Thống kê
            </button>
          )}
          {currentUser?.idVaiTro === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                activeTab === 'users' ? 'bg-amber-100 text-amber-900' : 'text-slate-600'
              }`}
            >
              Tài khoản
            </button>
          )}
          {(currentUser?.idVaiTro === 'bgh' || currentUser?.idVaiTro === 'admin') && (
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                activeTab === 'facilities' ? 'bg-purple-100 text-purple-900' : 'text-slate-600'
              }`}
            >
              Khu vực
            </button>
          )}
          {(currentUser?.idVaiTro === 'bao_ve' || currentUser?.idVaiTro === 'admin' || currentUser?.idVaiTro === 'bgh') && (
            <button
              onClick={() => setActiveTab('security')}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                activeTab === 'security' ? 'bg-amber-200 text-amber-950 font-bold' : 'text-amber-800'
              }`}
            >
              Ca trực
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
