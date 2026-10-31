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
} from 'lucide-react';

interface HeaderProps {
  currentUser: NguoiDung | null;
  users: NguoiDung[];
  activeTab: 'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities';
  setActiveTab: (tab: 'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities') => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
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
    }
  };

  const roleInfo = currentUser ? getRoleBadge(currentUser.idVaiTro) : null;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* TIER 1: Brand & User Header Bar */}
      <div className="border-b border-slate-200/90 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Title with School Emblem */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs shrink-0 border border-emerald-500/20">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block leading-none">
                  THPT Chuyên Lê Quý Đôn · Nam Nha Trang
                </span>
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-tight mt-0.5">
                  Quản Lý Khu Thể Thao
                </h1>
              </div>
            </div>

            {/* Right Side: Live Clock & Account Actions */}
            <div className="flex items-center gap-3">
              {/* Real-time System Clock */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <div className="text-left leading-none">
                  <div className="text-[11px] font-mono font-bold text-slate-900">
                    {formatClockTime(currentTime)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {formatClockDate(currentTime)}
                  </div>
                </div>
              </div>

              {/* User Account / Login State */}
              <div className="relative">
                {currentUser && roleInfo ? (
                  <>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                      aria-label="Thông tin tài khoản"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                        {currentUser.hoTen.slice(0, 2)}
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                          {currentUser.hoTen}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <span>{roleInfo.label}</span>
                          {currentUser.lop && (
                            <span className="font-semibold text-emerald-700">· {currentUser.lop}</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Account Dropdown */}
                    {showProfileMenu && (
                      <div className="absolute right-0 top-12 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                          <div className="text-xs font-bold text-slate-900">
                            {currentUser.hoTen}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Tên đăng nhập: <span className="font-mono font-semibold text-slate-700">@{currentUser.tenDangNhap}</span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5">
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
                            className="w-full px-3 py-2 text-xs text-left text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Lock className="w-4 h-4 text-slate-500" />
                            Đổi tài khoản đăng nhập
                          </button>

                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              onLogout();
                            }}
                            className="w-full px-3 py-2 text-xs text-left text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
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
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: Dedicated Navigation Bar (Placed cleanly below logo & account) */}
      <div className="bg-slate-50/95 border-b border-slate-200/90 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto scrollbar-none">
            {/* 1. Lịch Thể Thao */}
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Lịch Thể Thao</span>
            </button>

            {/* 2. Đăng Ký Mượn/Thuê */}
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Đăng Ký Mượn/Thuê</span>
            </button>

            {/* 3. Lịch Của Tôi */}
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'my-bookings'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Lịch Của Tôi</span>
            </button>

            {/* 4. Thống Kê & Báo Cáo - Only for BGH & Admin */}
            {(currentUser?.idVaiTro === 'admin' || currentUser?.idVaiTro === 'bgh') && (
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Thống Kê & Báo Cáo</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                  activeTab === 'stats' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  BGH
                </span>
              </button>
            )}

            {/* 5. Quản Trị Người Dùng - Only for Admin */}
            {currentUser?.idVaiTro === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Tài Khoản (Admin)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                  activeTab === 'users' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-900'
                }`}>
                  Admin
                </span>
              </button>
            )}

            {/* 6. Quản Lý Khu Vực - For BGH & Admin */}
            {(currentUser?.idVaiTro === 'bgh' || currentUser?.idVaiTro === 'admin') && (
              <button
                onClick={() => setActiveTab('facilities')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'facilities'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Khu Vực (BGH)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                  activeTab === 'facilities' ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-900'
                }`}>
                  BGH
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
