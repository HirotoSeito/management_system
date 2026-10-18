import React, { useState } from 'react';
import { KhuVuc, TrangThaiKhuVuc } from '../types/index.ts';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X,
  DollarSign,
  MapPin,
} from 'lucide-react';

interface BGHFacilityManagementProps {
  areas: KhuVuc[];
  onAddArea: (newArea: KhuVuc) => void;
  onUpdateArea: (updatedArea: KhuVuc) => void;
  onDeleteArea: (areaId: string) => void;
}

export const BGHFacilityManagement: React.FC<BGHFacilityManagementProps> = ({
  areas,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState<KhuVuc | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [tenKhuVuc, setTenKhuVuc] = useState('');
  const [giaThueGio, setGiaThueGio] = useState<number>(60000);
  const [trangThai, setTrangThai] = useState<TrangThaiKhuVuc>('hoạt động');
  const [moTa, setMoTa] = useState('');
  const [viTri, setViTri] = useState('');
  const [hinhAnh, setHinhAnh] = useState('');

  const openCreateModal = () => {
    setEditingArea(null);
    setTenKhuVuc('');
    setGiaThueGio(60000);
    setTrangThai('hoạt động');
    setMoTa('');
    setViTri('');
    setHinhAnh('');
    setShowAddModal(true);
  };

  const openEditModal = (area: KhuVuc) => {
    setEditingArea(area);
    setTenKhuVuc(area.tenKhuVuc);
    setGiaThueGio(area.giaThueGio);
    setTrangThai(area.trangThai);
    setMoTa(area.moTa || '');
    setViTri(area.viTri || '');
    setHinhAnh(area.hinhAnh || '');
    setShowAddModal(true);
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenKhuVuc.trim()) return;

    if (editingArea) {
      const updated: KhuVuc = {
        ...editingArea,
        tenKhuVuc: tenKhuVuc.trim(),
        giaThueGio: Number(giaThueGio) || 0,
        trangThai: trangThai,
        moTa: moTa.trim() || undefined,
        viTri: viTri.trim() || undefined,
        hinhAnh: hinhAnh.trim() || editingArea.hinhAnh,
      };
      onUpdateArea(updated);
    } else {
      const newArea: KhuVuc = {
        id: `kv_${Date.now().toString().slice(-6)}`,
        tenKhuVuc: tenKhuVuc.trim(),
        giaThueGio: Number(giaThueGio) || 0,
        trangThai: trangThai,
        moTa: moTa.trim() || undefined,
        viTri: viTri.trim() || undefined,
        hinhAnh: hinhAnh.trim() || undefined,
      };
      onAddArea(newArea);
    }

    setShowAddModal(false);
  };

  const handleQuickStatusChange = (area: KhuVuc, newStatus: TrangThaiKhuVuc) => {
    onUpdateArea({
      ...area,
      trangThai: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Quản Lý Cơ Sở Vật Chất & Khu Vực Thể Thao
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Dành riêng cho Ban Giám Hiệu: Thay đổi trạng thái vận hành, điều chỉnh giá thuê, thêm hoặc bỏ khu vực
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm Khu Vực Mới
          </button>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas.map((area) => {
          return (
            <div
              key={area.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Status Banner */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  {area.hinhAnh ? (
                    <img
                      src={area.hinhAnh}
                      alt={area.tenKhuVuc}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-purple-800 to-slate-900 flex items-center justify-center text-white">
                      <Building2 className="w-10 h-10 opacity-30" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${
                      area.trangThai === 'hoạt động'
                        ? 'bg-emerald-500 text-white'
                        : area.trangThai === 'bảo trì'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {area.trangThai}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/80 p-4">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {area.tenKhuVuc}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-300" />
                      <span>{area.viTri || 'Khuôn viên trường'}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {area.moTa || 'Phục vụ nhu cầu học tập bộ môn thể chất và hoạt động ngoại khóa.'}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Giá thuê cho học sinh (cuối tuần):</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {area.giaThueGio.toLocaleString('vi-VN')} đ / giờ
                    </span>
                  </div>

                  {/* Quick Change Status Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Cập nhật trạng thái nhanh:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(area, 'hoạt động')}
                        className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                          area.trangThai === 'hoạt động'
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Hoạt động
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(area, 'bảo trì')}
                        className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                          area.trangThai === 'bảo trì'
                            ? 'bg-amber-600 text-white border-amber-600 font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Bảo trì
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(area, 'ngừng sử dụng')}
                        className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                          area.trangThai === 'ngừng sử dụng'
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Ngừng dùng
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(area)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Chỉnh Sửa
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(area.id)}
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Bỏ Khu Vực
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingArea ? 'Chỉnh Sửa Thông Tin Khu Vực' : 'Thêm Khu Vực Thể Thao Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tên khu vực <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tenKhuVuc}
                  onChange={(e) => setTenKhuVuc(e.target.value)}
                  placeholder="VD: Sân bóng rổ ngoài trời, Hồ bơi trường học..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Giá thuê (đ/giờ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={giaThueGio}
                    onChange={(e) => setGiaThueGio(Number(e.target.value))}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={trangThai}
                    onChange={(e) => setTrangThai(e.target.value as TrangThaiKhuVuc)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="hoạt động">Hoạt động</option>
                    <option value="bảo trì">Bảo trì</option>
                    <option value="ngừng sử dụng">Ngừng sử dụng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vị trí trong trường
                </label>
                <input
                  type="text"
                  value={viTri}
                  onChange={(e) => setViTri(e.target.value)}
                  placeholder="VD: Khuôn viên phía Tây, cạnh sân vận động"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mô tả cơ sở vật chất
                </label>
                <textarea
                  rows={2}
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  placeholder="Thông tin quy mô, tiện ích, trang thiết bị đi kèm..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs"
                >
                  {editingArea ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Area Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Xác Nhận Bỏ / Xóa Khu Vực Thể Thao
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Bạn có chắc chắn muốn xóa khu vực này khỏi danh mục của nhà trường? Thao tác này sẽ gỡ bỏ khu vực khỏi hệ thống đăng ký.
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
                  onDeleteArea(deleteConfirmId);
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
