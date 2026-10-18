import React from 'react';
import { NguoiDung, VaiTroId } from '../types/index.ts';
import { Calendar, UserCheck, Shield, Award, GraduationCap, Building2, LogOut, RefreshCw, BarChart3, Users, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  currentUser: NguoiDung;
  users: NguoiDung[];
  activeTab: 'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities';
  setActiveTab: (tab: 'schedule' | 'booking' | 'my-bookings' | 'stats' | 'users' | 'facilities') => void;
  onSwitchUser: (user: NguoiDung) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  activeTab,
  setActiveTab,
  onSwitchUser,
  onResetData,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const getRoleBadge = (roleId: VaiTroId) => {
    switch (roleId) {
      case 'admin':
        return { label: 'Quản trị viên', icon: Shield, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'bgh':
        return { label: 'Ban giám hiệu', icon: Building2, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'giao_vien':
        return { label: 'Giáo viên', icon: Award, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'hoc_sinh':
        return { label: 'Học sinh', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.idVaiTro);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                SPORTS MASTER
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                Quản lý khu thể thao trường học
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Lịch Thể Thao
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'booking'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Đăng Ký Mượn/Thuê
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'my-bookings'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Lịch Đăng Ký Của Tôi
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Thống Kê & Báo Cáo
            </button>

            {/* Admin only tab */}
            {currentUser.idVaiTro === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Tài Khoản (Admin)
              </button>
            )}

            {/* BGH & Admin tab */}
            {(currentUser.idVaiTro === 'bgh' || currentUser.idVaiTro === 'admin') && (
              <button
                onClick={() => setActiveTab('facilities')}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'facilities'
                    ? 'bg-purple-100 text-purple-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Khu Vực (BGH)
              </button>
            )}
          </nav>

          {/* User profile & Fast Role Switcher */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              aria-label="Chọn tài khoản người dùng"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                {currentUser.hoTen.slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                  {currentUser.hoTen}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span>{roleInfo.label}</span>
                  {currentUser.lop && <span>({currentUser.lop})</span>}
                </div>
              </div>
              <div className="text-slate-400 text-xs px-1">▼</div>
            </button>

            {/* Dropdown for Switch Role / User */}
            {showUserDropdown && (
              <div className="absolute right-0 top-12 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    Chuyển đổi tài khoản (Demo)
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Thử nghiệm quyền Admin, BGH, Giáo viên hoặc Học sinh
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {users.map((u) => {
                    const rInfo = getRoleBadge(u.idVaiTro);
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-emerald-50/70 font-semibold text-emerald-950' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-xs truncate">{u.hoTen}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>{rInfo.label}</span>
                            {u.lop && <span>· Lớp {u.lop}</span>}
                            <span>· @{u.tenDangNhap}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-emerald-600 text-xs font-bold shrink-0">✓ Đang dùng</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                  <button
                    onClick={() => {
                      onResetData();
                      setShowUserDropdown(false);
                    }}
                    className="w-full px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Khôi phục dữ liệu mẫu ban đầu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 py-2 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              activeTab === 'schedule' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Lịch
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              activeTab === 'booking' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Đăng ký
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              activeTab === 'my-bookings' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Lịch của tôi
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              activeTab === 'stats' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
            }`}
          >
            Thống kê
          </button>
          {currentUser.idVaiTro === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                activeTab === 'users' ? 'bg-amber-100 text-amber-800' : 'text-slate-600'
              }`}
            >
              Tài khoản
            </button>
          )}
          {(currentUser.idVaiTro === 'bgh' || currentUser.idVaiTro === 'admin') && (
            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                activeTab === 'facilities' ? 'bg-purple-100 text-purple-800' : 'text-slate-600'
              }`}
            >
              Khu vực
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
