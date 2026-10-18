import React, { useState } from 'react';
import { DangKy, KhuVuc, NguoiDung } from '../types/index.ts';
import {
  filterBookingsByTimeframe,
  aggregateStatistics,
  FilterTimeframe,
  formatDateToVN,
  isoDateToVN,
  vnDateToIso,
} from '../utils/bookingRules.ts';
import { exportToExcelFile } from '../utils/exportExcel.ts';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  Users,
  Building2,
  Filter,
} from 'lucide-react';

interface StatisticsViewProps {
  bookings: DangKy[];
  areas: KhuVuc[];
  users: NguoiDung[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  bookings,
  areas,
  users,
}) => {
  const [timeframe, setTimeframe] = useState<FilterTimeframe>('tat_ca');
  const [targetDateIso, setTargetDateIso] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const refDate = new Date(targetDateIso);
  const filteredBookings = filterBookingsByTimeframe(bookings, timeframe, refDate);

  const { areaStats, userStats, totalBookings, totalHours, totalRevenue } =
    aggregateStatistics(filteredBookings, areas, users);

  const handleExportExcel = () => {
    exportToExcelFile(
      filteredBookings,
      areas,
      users,
      `Bao_Cao_Khu_The_Thao_${timeframe}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Thống Kê Sử Dụng Khu Vực Thể Thao
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Báo cáo chi tiết số lượt mượn/thuê theo từng khu vực, từng người dùng và xuất dữ liệu ra Excel
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Xuất Báo Cáo Excel (.xlsx)
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Timeframe Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTimeframe('tat_ca')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeframe === 'tat_ca'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTimeframe('ngay')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeframe === 'ngay'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo ngày
            </button>
            <button
              onClick={() => setTimeframe('tuan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeframe === 'tuan'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo tuần
            </button>
            <button
              onClick={() => setTimeframe('thang')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeframe === 'thang'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo tháng
            </button>
            <button
              onClick={() => setTimeframe('hoc_ky')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                timeframe === 'hoc_ky'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo học kỳ
            </button>
          </div>

          {/* Target Reference Date picker when specific timeframe selected */}
          {timeframe !== 'tat_ca' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Mốc thời gian:</span>
              <input
                type="date"
                value={targetDateIso}
                onChange={(e) => setTargetDateIso(e.target.value)}
                className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng lượt đăng ký
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalBookings}
            </span>
            <span className="text-xs text-slate-500">lượt mượn/thuê</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng thời gian sử dụng
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalHours}
            </span>
            <span className="text-xs text-slate-500">giờ hoạt động</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh thu thuê cuối tuần
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalRevenue.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-500">đồng</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Khu vực thể thao
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {areas.filter((a) => a.trangThai === 'hoạt động').length}/{areas.length}
            </span>
            <span className="text-xs text-slate-500">sẵn sàng sử dụng</span>
          </div>
        </div>
      </div>

      {/* Table 1: Thống kê theo khu vực */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Thống Kê Chi Tiết Theo Khu Vực Thể Thao
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tần suất mượn, tổng số giờ vận hành và doanh thu phát sinh
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {areaStats.length} khu vực
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Tên khu vực</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Giá thuê/giờ</th>
                <th className="py-3 px-4 text-right">Số lượt ĐK</th>
                <th className="py-3 px-4 text-right">Tổng giờ (h)</th>
                <th className="py-3 px-4 text-center">Đang dùng / Đã trả</th>
                <th className="py-3 px-4 text-right">Doanh thu (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {areaStats.map((item) => {
                const area = areas.find((a) => a.id === item.idKhuVuc);
                return (
                  <tr key={item.idKhuVuc} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.tenKhuVuc}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        area?.trangThai === 'hoạt động'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border border-rose-200'
                      }`}>
                        {area?.trangThai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {area?.giaThueGio.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {item.soLuotDangKy}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                      {item.tongThoiGianGio} h
                    </td>
                    <td className="py-3 px-4 text-center text-[11px] font-mono">
                      <span className="text-blue-700 font-semibold">{item.soLuotDangSuDung}</span> /{' '}
                      <span className="text-emerald-700 font-semibold">{item.soLuotDaTra}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                      {item.tongTienThu.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Thống kê theo người dùng */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Thống Kê Chi Tiết Theo Người Dùng (Giáo Viên & Học Sinh)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi đối tượng mượn dạy học và học sinh đăng ký thuê theo giờ
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {userStats.length} tài khoản
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Vai trò</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4 text-right">Số lượt mượn/thuê</th>
                <th className="py-3 px-4 text-right">Tổng thời gian (h)</th>
                <th className="py-3 px-4 text-right">Chi phí thuê (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {userStats.map((item) => (
                <tr key={item.idNguoiDung} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.hoTen}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {item.tenVaiTro}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {item.lop || '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                    {item.soLuotDangKy}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                    {item.tongThoiGianGio} h
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                    {item.tongChiPhi ? `${item.tongChiPhi.toLocaleString('vi-VN')} đ` : '0 đ (Giảng dạy)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
