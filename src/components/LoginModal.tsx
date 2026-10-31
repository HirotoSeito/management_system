import React, { useState } from 'react';
import { NguoiDung } from '../types/index.ts';
import { School, Lock, User, AlertCircle, X, ShieldCheck, Award, Building2, GraduationCap, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  users: NguoiDung[];
  onLoginSuccess: (user: NguoiDung) => void;
  canClose?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onLoginSuccess,
  canClose = true,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickLogin = (targetUsername: string, targetPass: string) => {
    setUsername(targetUsername);
    setPassword(targetPass);
    setErrorMsg('');

    const targetUser = users.find(
      (u) => u.tenDangNhap.toLowerCase() === targetUsername.trim().toLowerCase()
    );

    if (targetUser) {
      onLoginSuccess(targetUser);
      if (onClose) onClose();
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUser = users.find(
      (u) => u.tenDangNhap.toLowerCase() === username.trim().toLowerCase()
    );

    if (!targetUser) {
      setErrorMsg('Tên đăng nhập không tồn tại trong hệ thống nhà trường.');
      return;
    }

    if (targetUser.trangThai === 'bị khóa') {
      setErrorMsg('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được mở khóa.');
      return;
    }

    if (targetUser.matKhau !== password) {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng thử lại.');
      return;
    }

    onLoginSuccess(targetUser);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="shrink-0 bg-slate-900 text-white p-5 text-center relative border-b border-slate-800">
          {canClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center shadow-md mb-2">
            <School className="w-6 h-6 text-white" />
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Cổng Thông Tin Nội Bộ
          </div>
          <h2 className="text-base font-bold text-white mt-0.5">
            Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Đăng nhập hệ thống quản lý khu vực thể thao
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick 1-Click Role Login - Highlight Bảo Vệ */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Đăng nhập nhanh theo vai trò (1 chạm):
              </span>
              <span className="text-[10px] text-slate-400">Dữ liệu mẫu trường</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Bảo vệ - Prominent */}
              <button
                type="button"
                onClick={() => handleQuickLogin('baove_tam', 'bv123')}
                className="col-span-1 sm:col-span-2 p-2.5 rounded-lg border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span>Bác Lê Văn Tám</span>
                      <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">Bảo vệ</span>
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Tài khoản: <span className="font-mono font-bold">baove_tam</span> · MK: <span className="font-mono">bv123</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-700 group-hover:underline">
                  Vào Ca Trực →
                </span>
              </button>

              {/* Giáo viên */}
              <button
                type="button"
                onClick={() => handleQuickLogin('gv_nam', 'gv123')}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-2 text-left"
              >
                <Award className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Thầy Nam (Giáo viên)</div>
                  <div className="text-[10px] text-slate-500 font-mono">gv_nam / gv123</div>
                </div>
              </button>

              {/* Ban giám hiệu */}
              <button
                type="button"
                onClick={() => handleQuickLogin('bgh_minh', 'bgh123')}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors flex items-center gap-2 text-left"
              >
                <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Thầy Minh (Ban Giám Hiệu)</div>
                  <div className="text-[10px] text-slate-500 font-mono">bgh_minh / bgh123</div>
                </div>
              </button>

              {/* Học sinh */}
              <button
                type="button"
                onClick={() => handleQuickLogin('hs_an', 'hs123')}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center gap-2 text-left"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Lê Văn An (Học sinh 11T)</div>
                  <div className="text-[10px] text-slate-500 font-mono">hs_an / hs123</div>
                </div>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex items-center gap-2 text-left"
              >
                <School className="w-4 h-4 text-slate-700 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Quản Trị Viên (Admin)</div>
                  <div className="text-[10px] text-slate-500 font-mono">admin / admin123</div>
                </div>
              </button>
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs pt-1 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Hoặc nhập tài khoản thủ công:
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập (VD: baove_tam, gv_nam, admin...)"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs"
            >
              Đăng Nhập Tài Khoản
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
