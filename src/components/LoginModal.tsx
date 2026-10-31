import React, { useState } from 'react';
import { NguoiDung } from '../types/index.ts';
import { School, Lock, User, AlertCircle, X, Shield, ArrowRight } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanUsername = username.trim().toLowerCase();
    const targetUser = users.find(
      (u) => u.tenDangNhap.toLowerCase() === cleanUsername
    );

    if (!targetUser) {
      setErrorMsg('Tên đăng nhập không tồn tại trong hệ thống nhà trường.');
      setIsSubmitting(false);
      return;
    }

    if (targetUser.trangThai === 'bị khóa') {
      setErrorMsg('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được mở khóa.');
      setIsSubmitting(false);
      return;
    }

    if (targetUser.matKhau !== password) {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng thử lại.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onLoginSuccess(targetUser);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-linear-to-b from-slate-900 to-slate-850 text-white p-6 text-center relative border-b border-slate-800">
          {canClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/40 mb-3 border border-emerald-400/30">
            <School className="w-6 h-6 text-white" />
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
            Cổng Xác Thực Nội Bộ
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Trường THPT Chuyên Lê Quý Đôn
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Đăng nhập hệ thống quản lý khu vực thể thao
          </p>
        </div>

        {/* Real Production Login Form */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập được cấp"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-800 placeholder:text-slate-400 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <span className="text-[11px] text-slate-400">Bảo mật</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu tài khoản"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-800 placeholder:text-slate-400 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-xs hover:shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>Đăng Nhập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secure school notice */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              Mỗi tài khoản được cấp quyền tương ứng (Ban Giám Hiệu, Giáo viên, Học sinh, Quản trị viên). Quên mật khẩu hoặc cần cấp mới, vui lòng liên hệ <strong className="text-slate-700">Tổ CNTT Trường THPT Chuyên Lê Quý Đôn</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
