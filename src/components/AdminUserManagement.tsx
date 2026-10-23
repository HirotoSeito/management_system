import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { NguoiDung, VaiTroId, TrangThaiNguoiDung } from '../types/index.ts';
import {
  Users,
  UserPlus,
  Lock,
  Unlock,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Shield,
  Award,
  GraduationCap,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatDateToVN, DANH_SACH_LOP_CHUYEN } from '../utils/bookingRules.ts';

interface AdminUserManagementProps {
  users: NguoiDung[];
  onAddUser: (newUser: NguoiDung) => void;
  onAddBatchUsers?: (newUsers: NguoiDung[]) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  onAddUser,
  onAddBatchUsers,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Excel import states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportPreviewModal, setShowImportPreviewModal] = useState(false);
  const [importedParsedUsers, setImportedParsedUsers] = useState<NguoiDung[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Form states for single new user
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [idVaiTro, setIdVaiTro] = useState<VaiTroId>('hoc_sinh');
  const [lop, setLop] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [formError, setFormError] = useState('');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.idVaiTro !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = u.hoTen.toLowerCase().includes(term);
      const matchUser = u.tenDangNhap.toLowerCase().includes(term);
      const matchLop = u.lop?.toLowerCase().includes(term);
      if (!matchName && !matchUser && !matchLop) return false;
    }
    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = tenDangNhap.trim().toLowerCase();
    if (!cleanUsername || !hoTen.trim() || !matKhau.trim()) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    // Check duplicate username
    if (users.some((u) => u.tenDangNhap.toLowerCase() === cleanUsername)) {
      setFormError(`Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác.`);
      return;
    }

    const newUser: NguoiDung = {
      id: `u_${Date.now().toString().slice(-6)}`,
      tenDangNhap: cleanUsername,
      matKhau: matKhau,
      hoTen: hoTen.trim(),
      idVaiTro: idVaiTro,
      lop: idVaiTro === 'hoc_sinh' ? lop.trim() : undefined,
      soDienThoai: soDienThoai.trim() || undefined,
      trangThai: 'hoạt động',
      ngayTao: formatDateToVN(new Date()),
    };

    onAddUser(newUser);
    setShowAddModal(false);
    // Reset form
    setTenDangNhap('');
    setMatKhau('');
    setHoTen('');
    setIdVaiTro('hoc_sinh');
    setLop('');
    setSoDienThoai('');
  };

  // 1. Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Tên đăng nhập': 'hs_minh_tri',
        'Mật khẩu': '123456',
        'Họ và tên': 'Nguyễn Minh Trí',
        'Vai trò (Học sinh / Giáo viên / Ban giám hiệu / Quản trị viên / Bảo vệ)': 'Học sinh',
        'Lớp chuyên (Nếu là học sinh: 10 Toán, 11 Lý,...)': '11 Toán',
        'Số điện thoại': '0912345678',
        'Email': 'tri.nm@lequydon-nt.edu.vn',
      },
      {
        'Tên đăng nhập': 'gv_thanh',
        'Mật khẩu': '123456',
        'Họ và tên': 'Thầy Trần Văn Thành',
        'Vai trò (Học sinh / Giáo viên / Ban giám hiệu / Quản trị viên / Bảo vệ)': 'Giáo viên',
        'Lớp chuyên (Nếu là học sinh: 10 Toán, 11 Lý,...)': '',
        'Số điện thoại': '0987654321',
        'Email': 'thanhtv@lequydon-nt.edu.vn',
      },
      {
        'Tên đăng nhập': 'bv_hai',
        'Mật khẩu': '123456',
        'Họ và tên': 'Bác Hoàng Văn Hải (Tổ Bảo vệ)',
        'Vai trò (Học sinh / Giáo viên / Ban giám hiệu / Quản trị viên / Bảo vệ)': 'Bảo vệ',
        'Lớp chuyên (Nếu là học sinh: 10 Toán, 11 Lý,...)': '',
        'Số điện thoại': '0903334455',
        'Email': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    // Column widths
    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 14 },
      { wch: 26 },
      { wch: 32 },
      { wch: 24 },
      { wch: 16 },
      { wch: 28 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Mau');
    XLSX.writeFile(workbook, 'Mau_Nhap_Tai_Khoan_LeQuyDon.xlsx');
  };

  // 2. Export Current Users to Excel
  const handleExportUsersExcel = () => {
    const dataToExport = users.map((u, idx) => ({
      'STT': idx + 1,
      'Mã ID': u.id,
      'Tên đăng nhập': u.tenDangNhap,
      'Họ và tên': u.hoTen,
      'Vai trò':
        u.idVaiTro === 'admin'
          ? 'Quản trị viên'
          : u.idVaiTro === 'bgh'
          ? 'Ban giám hiệu'
          : u.idVaiTro === 'giao_vien'
          ? 'Giáo viên'
          : u.idVaiTro === 'bao_ve'
          ? 'Bảo vệ'
          : 'Học sinh',
      'Lớp': u.lop || '—',
      'Trạng thái': u.trangThai,
      'Ngày tạo': u.ngayTao,
      'Số điện thoại': u.soDienThoai || '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nguoi_Dung');
    XLSX.writeFile(workbook, `Danh_Sach_Nguoi_Dung_LQD_${formatDateToVN(new Date()).replace(/\//g, '-')}.xlsx`);
  };

  // 3. Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          alert('File Excel trống hoặc không đúng định dạng!');
          return;
        }

        const validParsed: NguoiDung[] = [];
        const errors: string[] = [];
        const seenUsernames = new Set(users.map((u) => u.tenDangNhap.toLowerCase()));

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          const rawUsername =
            row['Tên đăng nhập'] || row['tenDangNhap'] || row['Username'] || row['taiKhoan'] || '';
          const rawPassword = row['Mật khẩu'] || row['matKhau'] || row['Password'] || '123456';
          const rawFullName = row['Họ và tên'] || row['hoTen'] || row['FullName'] || row['ten'] || '';
          const rawRole =
            row['Vai trò (Học sinh / Giáo viên / Ban giám hiệu / Quản trị viên / Bảo vệ)'] ||
            row['Vai trò'] ||
            row['idVaiTro'] ||
            row['Role'] ||
            'Học sinh';
          const rawLop = row['Lớp chuyên (Nếu là học sinh: 10 Toán, 11 Lý,...)'] || row['Lớp'] || row['lop'] || '';
          const rawPhone = row['Số điện thoại'] || row['soDienThoai'] || row['Phone'] || '';
          const rawEmail = row['Email'] || row['email'] || '';

          const username = String(rawUsername).trim().toLowerCase();
          const fullName = String(rawFullName).trim();
          const password = String(rawPassword).trim();

          if (!username || !fullName) {
            errors.push(`Dòng ${rowNum}: Thiếu tên đăng nhập hoặc họ và tên.`);
            return;
          }

          if (seenUsernames.has(username)) {
            errors.push(`Dòng ${rowNum}: Tên đăng nhập "@${username}" đã tồn tại trong hệ thống hoặc bị trùng.`);
            return;
          }

          // Map role
          let roleId: VaiTroId = 'hoc_sinh';
          const roleNormalized = String(rawRole).toLowerCase();
          if (roleNormalized.includes('quản trị') || roleNormalized.includes('admin')) {
            roleId = 'admin';
          } else if (roleNormalized.includes('giám hiệu') || roleNormalized.includes('bgh')) {
            roleId = 'bgh';
          } else if (roleNormalized.includes('giáo viên') || roleNormalized.includes('gv')) {
            roleId = 'giao_vien';
          } else if (roleNormalized.includes('bảo vệ') || roleNormalized.includes('bv') || roleNormalized.includes('guard')) {
            roleId = 'bao_ve';
          } else {
            roleId = 'hoc_sinh';
          }

          seenUsernames.add(username);

          validParsed.push({
            id: `u_imp_${Date.now().toString().slice(-4)}_${index}`,
            tenDangNhap: username,
            matKhau: password || '123456',
            hoTen: fullName,
            idVaiTro: roleId,
            lop: roleId === 'hoc_sinh' ? String(rawLop).trim() || undefined : undefined,
            soDienThoai: rawPhone ? String(rawPhone).trim() : undefined,
            email: rawEmail ? String(rawEmail).trim() : undefined,
            trangThai: 'hoạt động',
            ngayTao: formatDateToVN(new Date()),
          });
        });

        setImportedParsedUsers(validParsed);
        setImportErrors(errors);
        setShowImportPreviewModal(true);
      } catch (err) {
        console.error(err);
        alert('Lỗi đọc file Excel. Vui lòng kiểm tra lại file định dạng .xlsx!');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (importedParsedUsers.length === 0) return;

    if (onAddBatchUsers) {
      onAddBatchUsers(importedParsedUsers);
    } else {
      importedParsedUsers.forEach((u) => onAddUser(u));
    }

    setShowImportPreviewModal(false);
    setImportedParsedUsers([]);
    setImportErrors([]);
  };

  const getRoleBadge = (roleId: VaiTroId) => {
    switch (roleId) {
      case 'admin':
        return { label: 'Quản trị viên', icon: Shield, color: 'text-amber-800 bg-amber-50' };
      case 'bgh':
        return { label: 'Ban giám hiệu', icon: Building2, color: 'text-purple-800 bg-purple-50' };
      case 'giao_vien':
        return { label: 'Giáo viên', icon: Award, color: 'text-blue-800 bg-blue-50' };
      case 'hoc_sinh':
        return { label: 'Học sinh', icon: GraduationCap, color: 'text-emerald-800 bg-emerald-50' };
      case 'bao_ve':
        return { label: 'Bảo vệ', icon: ShieldCheck, color: 'text-amber-900 bg-amber-100' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Quản Trị Người Dùng & Phân Quyền
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Dành cho Quản trị viên: Nhập hàng loạt từ Excel, cấp tài khoản, phân quyền (Quản trị, BGH, Giáo viên, Học sinh, Bảo vệ), khóa và xóa tài khoản.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
              className="hidden"
            />

            {/* Template Download */}
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Tải file mẫu Excel chuẩn để nhập"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Tải file mẫu Excel
            </button>

            {/* Import Excel */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Nhập từ file Excel
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportUsersExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Xuất Excel
            </button>

            {/* Manual Add User */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Tạo Mới Thủ Công
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên, username, lớp..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="bgh">Ban giám hiệu</option>
              <option value="giao_vien">Giáo viên</option>
              <option value="hoc_sinh">Học sinh</option>
              <option value="bao_ve">Bảo vệ</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-end font-medium">
            Tổng cộng: {filteredUsers.length} tài khoản trong hệ thống
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Mã / Username</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Lớp (Học sinh)</th>
                <th className="py-3 px-4">Ngày tạo</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => {
                const role = getRoleBadge(user.idVaiTro);
                const isLocked = user.trangThai === 'bị khóa';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      <div>@{user.tenDangNhap}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{user.id}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {user.hoTen}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${role.color}`}>
                        <role.icon className="w-3 h-3" />
                        {role.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {user.lop || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {user.ngayTao}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        isLocked
                          ? 'text-rose-700 bg-rose-50 border border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      }`}>
                        {user.trangThai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Lock / Unlock button */}
                        <button
                          type="button"
                          onClick={() => onToggleUserStatus(user.id)}
                          title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isLocked
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                              : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                          }`}
                        >
                          {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete button (except main admin) */}
                        {user.id !== 'u_admin' && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(user.id)}
                            title="Xóa tài khoản"
                            className="p-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excel Import Preview Modal */}
      {showImportPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Xem Trước Dữ Liệu Nhập Từ Excel
                </h3>
              </div>
              <button
                onClick={() => setShowImportPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {importErrors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Cảnh báo các dòng không hợp lệ (đã tự động bỏ qua):
                  </span>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-slate-800">
                  Tìm thấy {importedParsedUsers.length} tài khoản hợp lệ sẵn sàng nạp:
                </span>
                <span className="text-[11px] text-slate-500">
                  Mật khẩu mặc định: 123456 (nếu không khai báo)
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Username</th>
                      <th className="p-2.5">Họ và tên</th>
                      <th className="p-2.5">Vai trò</th>
                      <th className="p-2.5">Lớp</th>
                      <th className="p-2.5">SĐT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importedParsedUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-800">@{u.tenDangNhap}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{u.hoTen}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {u.idVaiTro}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">{u.lop || '—'}</td>
                        <td className="p-2.5 font-mono text-slate-500">{u.soDienThoai || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportPreviewModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importedParsedUsers.length === 0}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs flex items-center gap-1.5 ${
                  importedParsedUsers.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Check className="w-4 h-4" />
                Xác Nhận Nạp {importedParsedUsers.length} Tài Khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Thêm Tài Khoản Người Dùng Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tenDangNhap}
                    onChange={(e) => setTenDangNhap(e.target.value)}
                    placeholder="VD: gv_linh, baove_tam"
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={matKhau}
                    onChange={(e) => setMatKhau(e.target.value)}
                    placeholder="Mật khẩu khởi tạo"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vai trò hệ thống <span className="text-rose-500">*</span>
                </label>
                <select
                  value={idVaiTro}
                  onChange={(e) => setIdVaiTro(e.target.value as VaiTroId)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
                >
                  <option value="hoc_sinh">Học sinh (Thuê theo giờ cuối tuần)</option>
                  <option value="giao_vien">Giáo viên (Mượn theo tiết dạy học)</option>
                  <option value="bao_ve">Bảo vệ (Trực cổng, thu tiền & hoàn trả sân)</option>
                  <option value="bgh">Ban giám hiệu (Quản lý khu vực & thống kê)</option>
                  <option value="admin">Quản trị viên (Toàn quyền)</option>
                </select>
              </div>

              {idVaiTro === 'hoc_sinh' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lớp chuyên của học sinh <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={lop || DANH_SACH_LOP_CHUYEN[0]}
                    onChange={(e) => setLop(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
                  >
                    {DANH_SACH_LOP_CHUYEN.map((l) => (
                      <option key={l} value={l}>
                        Lớp {l} (Chuyên Lê Quý Đôn)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Lưu Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Xác Nhận Xóa Tài Khoản Người Dùng
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống? Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
