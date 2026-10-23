import React, { useState } from 'react';
import { NguoiDung } from '../types/index.ts';
import { School, Lock, User, AlertCircle, X } from 'lucide-react';

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
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center relative border-b border-slate-800">
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

          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center shadow-md mb-2.5">
            <School className="w-6 h-6 text-white" />
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Cổng Thông Tin Nội Bộ
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Trường THPT Chuyên Lê Quý Đôn – Nam Nha Trang
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Đăng nhập hệ thống quản lý khu vực thể thao
          </p>
        </div>

        {/* Real Production Login Form */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập của bạn"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors text-xs"
            >
              Đăng Nhập
            </button>

            <div className="text-center pt-3 text-[11px] text-slate-500 border-t border-slate-100 mt-4 leading-relaxed">
              Quên mật khẩu hoặc chưa có tài khoản? Vui lòng liên hệ <strong className="text-slate-700">Tổ CNTT Trường THPT Chuyên Lê Quý Đôn</strong> để được cấp và kích hoạt tài khoản.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
