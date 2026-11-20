import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import type {
  VaiTro,
  NguoiDung,
  KhuVuc,
  DangKy,
  VaiTroId,
  TrangThaiKhuVuc,
  TrangThaiNguoiDung,
} from '../types/index.ts';
import {
  INITIAL_VAI_TRO,
  INITIAL_NGUOI_DUNG,
  INITIAL_KHU_VUC,
  generateInitialBookings,
} from '../data/mockData.ts';
import {
  formatDateToVN,
  formatDateTimeToVN,
  getThuTrongTuan,
  isCuoiTuan,
  isSlotEnded,
  isValidLopChuyen,
  checkBookingConflict,
  calculateBookingCost,
  calculateActualReturnCost,
  canEditOrCancelBooking,
  timeStringToMinutes,
} from '../utils/bookingRules.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'sports.db');
const SECRET_PATH = path.join(DATA_DIR, '.session_secret');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadOrCreateSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  if (fs.existsSync(SECRET_PATH)) {
    return fs.readFileSync(SECRET_PATH, 'utf8').trim();
  }
  const secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_PATH, secret, 'utf8');
  return secret;
}

const SESSION_SECRET = loadOrCreateSecret();

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(plain: string, storedHash: string): boolean {
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const [, salt, hexHash] = parts;
    const derived = crypto.scryptSync(plain, salt, 64);
    const storedBuf = Buffer.from(hexHash, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  }
  return plain === storedHash;
}

export function signAuthToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, iat: Date.now() })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAuthToken(token: string): { uid: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (parsed && typeof parsed.uid === 'string') {
      return { uid: parsed.uid };
    }
    return null;
  } catch {
    return null;
  }
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vaiTro (
      id TEXT PRIMARY KEY,
      tenVaiTro TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nguoiDung (
      id TEXT PRIMARY KEY,
      tenDangNhap TEXT NOT NULL UNIQUE COLLATE NOCASE,
      idVaiTro TEXT NOT NULL,
      matKhau TEXT NOT NULL,
      hoTen TEXT NOT NULL,
      lop TEXT,
      trangThai TEXT NOT NULL,
      ngayTao TEXT NOT NULL,
      soDienThoai TEXT,
      email TEXT,
      FOREIGN KEY (idVaiTro) REFERENCES vaiTro(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS khuVuc (
      id TEXT PRIMARY KEY,
      tenKhuVuc TEXT NOT NULL,
      giaThueGio INTEGER NOT NULL,
      trangThai TEXT NOT NULL,
      moTa TEXT,
      hinhAnh TEXT,
      viTri TEXT
    );

    CREATE TABLE IF NOT EXISTS dangKy (
      id TEXT PRIMARY KEY,
      idNguoiDung TEXT NOT NULL,
      idKhuVuc TEXT NOT NULL,
      ngaySuDung TEXT NOT NULL,
      thu TEXT NOT NULL,
      buoi TEXT,
      tiet INTEGER,
      lop TEXT,
      nguoiDaiDienTen TEXT,
      nguoiDaiDienId TEXT,
      gioBatDau TEXT,
      gioKetThuc TEXT,
      trangThai TEXT NOT NULL,
      thoiGianBatDauThucTe TEXT,
      thoiGianTra TEXT,
      mucDichSuDung TEXT,
      tongTien INTEGER NOT NULL DEFAULT 0,
      ghiChuHeThong TEXT,
      FOREIGN KEY (idNguoiDung) REFERENCES nguoiDung(id) ON DELETE RESTRICT,
      FOREIGN KEY (idKhuVuc) REFERENCES khuVuc(id) ON DELETE RESTRICT
    );
  `);
}

function seedDatabaseInternal() {
  const insertRole = db.prepare(
    'INSERT INTO vaiTro (id, tenVaiTro) VALUES (?, ?)'
  );
  for (const r of INITIAL_VAI_TRO) {
    insertRole.run(r.id, r.tenVaiTro);
  }

  const insertUser = db.prepare(`
    INSERT INTO nguoiDung (
      id, tenDangNhap, idVaiTro, matKhau, hoTen, lop, trangThai, ngayTao, soDienThoai, email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of INITIAL_NGUOI_DUNG) {
    insertUser.run(
      u.id,
      u.tenDangNhap.toLowerCase(),
      u.idVaiTro,
      hashPassword(u.matKhau || '123456'),
      u.hoTen,
      u.lop || null,
      u.trangThai,
      u.ngayTao,
      u.soDienThoai || null,
      u.email || null
    );
  }

  const insertArea = db.prepare(`
    INSERT INTO khuVuc (
      id, tenKhuVuc, giaThueGio, trangThai, moTa, hinhAnh, viTri
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of INITIAL_KHU_VUC) {
    insertArea.run(
      a.id,
      a.tenKhuVuc,
      a.giaThueGio,
      a.trangThai,
      a.moTa || null,
      a.hinhAnh || null,
      a.viTri || null
    );
  }

  const insertBooking = db.prepare(`
    INSERT INTO dangKy (
      id, idNguoiDung, idKhuVuc, ngaySuDung, thu, buoi, tiet, lop,
      nguoiDaiDienTen, nguoiDaiDienId, gioBatDau, gioKetThuc, trangThai,
      thoiGianBatDauThucTe, thoiGianTra, mucDichSuDung, tongTien, ghiChuHeThong
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const initialBookings = generateInitialBookings(new Date());
  for (const b of initialBookings) {
    insertBooking.run(
      b.id,
      b.idNguoiDung,
      b.idKhuVuc,
      b.ngaySuDung,
      b.thu,
      b.buoi || null,
      b.tiet ?? null,
      b.lop || null,
      b.nguoiDaiDienTen || null,
      b.nguoiDaiDienId || null,
      b.gioBatDau || null,
      b.gioKetThuc || null,
      b.trangThai,
      b.thoiGianBatDauThucTe || null,
      b.thoiGianTra || null,
      b.mucDichSuDung || null,
      b.tongTien || 0,
      b.ghiChuHeThong || null
    );
  }
}

export function ensureSeeded() {
  initSchema();
  const row = db.prepare('SELECT COUNT(*) as cnt FROM vaiTro').get() as { cnt: number };
  if (row.cnt === 0) {
    db.exec('BEGIN IMMEDIATE');
    try {
      seedDatabaseInternal();
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
}

export function resetDatabaseToSeed() {
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('DELETE FROM dangKy; DELETE FROM khuVuc; DELETE FROM nguoiDung; DELETE FROM vaiTro;');
    seedDatabaseInternal();
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function rowToUser(row: Record<string, unknown>, includeContact = true): NguoiDung {
  const user: NguoiDung = {
    id: String(row.id),
    tenDangNhap: String(row.tenDangNhap),
    idVaiTro: String(row.idVaiTro) as VaiTroId,
    hoTen: String(row.hoTen),
    lop: row.lop ? String(row.lop) : undefined,
    trangThai: String(row.trangThai) as TrangThaiNguoiDung,
    ngayTao: String(row.ngayTao),
  };
  if (includeContact) {
    if (row.soDienThoai) user.soDienThoai = String(row.soDienThoai);
    if (row.email) user.email = String(row.email);
  }
  return user;
}

function rowToArea(row: Record<string, unknown>): KhuVuc {
  return {
    id: String(row.id),
    tenKhuVuc: String(row.tenKhuVuc),
    giaThueGio: Number(row.giaThueGio),
    trangThai: String(row.trangThai) as TrangThaiKhuVuc,
    moTa: row.moTa ? String(row.moTa) : undefined,
    hinhAnh: row.hinhAnh ? String(row.hinhAnh) : undefined,
    viTri: row.viTri ? String(row.viTri) : undefined,
  };
}

function rowToBooking(row: Record<string, unknown>): DangKy {
  return {
    id: String(row.id),
    idNguoiDung: String(row.idNguoiDung),
    idKhuVuc: String(row.idKhuVuc),
    ngaySuDung: String(row.ngaySuDung),
    thu: String(row.thu) as DangKy['thu'],
    buoi: row.buoi ? (String(row.buoi) as DangKy['buoi']) : undefined,
    tiet: row.tiet !== null && row.tiet !== undefined ? (Number(row.tiet) as DangKy['tiet']) : undefined,
    lop: row.lop ? String(row.lop) : undefined,
    nguoiDaiDienTen: row.nguoiDaiDienTen ? String(row.nguoiDaiDienTen) : undefined,
    nguoiDaiDienId: row.nguoiDaiDienId ? String(row.nguoiDaiDienId) : undefined,
    gioBatDau: row.gioBatDau ? String(row.gioBatDau) : undefined,
    gioKetThuc: row.gioKetThuc ? String(row.gioKetThuc) : undefined,
    trangThai: String(row.trangThai) as DangKy['trangThai'],
    thoiGianBatDauThucTe: row.thoiGianBatDauThucTe ? String(row.thoiGianBatDauThucTe) : null,
    thoiGianTra: row.thoiGianTra ? String(row.thoiGianTra) : null,
    mucDichSuDung: row.mucDichSuDung ? String(row.mucDichSuDung) : undefined,
    tongTien: Number(row.tongTien || 0),
    ghiChuHeThong: row.ghiChuHeThong ? String(row.ghiChuHeThong) : undefined,
  };
}

export function getUserById(userId: string, includeContact = true): NguoiDung | null {
  const row = db.prepare('SELECT * FROM nguoiDung WHERE id = ?').get(userId) as Record<string, unknown> | undefined;
  return row ? rowToUser(row, includeContact) : null;
}

export function authenticateUser(username: string, password: string): { user?: NguoiDung; error?: string; status?: number } {
  const clean = username.trim().toLowerCase();
  const row = db.prepare('SELECT * FROM nguoiDung WHERE tenDangNhap = ?').get(clean) as Record<string, unknown> | undefined;
  if (!row) {
    return { error: 'Tên đăng nhập không tồn tại trong hệ thống nhà trường.', status: 401 };
  }
  if (String(row.trangThai) === 'bị khóa') {
    return { error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được mở khóa.', status: 403 };
  }
  if (!verifyPassword(password, String(row.matKhau))) {
    return { error: 'Mật khẩu không chính xác. Vui lòng thử lại.', status: 401 };
  }
  return { user: rowToUser(row, true) };
}

/**
 * Automatically transitions registered (unstarted) bookings past their end time to 'quá hạn' (no-show).
 * Returns true if any rows were updated.
 */
export function sweepOverdueBookings(now: Date = new Date()): boolean {
  const rows = db
    .prepare("SELECT * FROM dangKy WHERE trangThai = 'đã đăng ký'")
    .all() as Record<string, unknown>[];

  const expiredIds: string[] = [];
  for (const r of rows) {
    const b = rowToBooking(r);
    if (isSlotEnded(b, now)) {
      expiredIds.push(b.id);
    }
  }

  if (expiredIds.length === 0) return false;

  const updateStmt = db.prepare(
    "UPDATE dangKy SET trangThai = 'quá hạn', ghiChuHeThong = COALESCE(ghiChuHeThong, 'Quá giờ sử dụng nhưng không nhận sân (No-show)') WHERE id = ? AND trangThai = 'đã đăng ký'"
  );
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const id of expiredIds) {
      updateStmt.run(id);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return true;
}

export function getAllState(requestor: NguoiDung | null) {
  sweepOverdueBookings(new Date());
  const includeContact = Boolean(requestor && (requestor.idVaiTro === 'admin' || requestor.idVaiTro === 'bgh'));
  const usersRows = db.prepare('SELECT * FROM nguoiDung ORDER BY ngayTao ASC, hoTen ASC').all() as Record<string, unknown>[];
  const areasRows = db.prepare('SELECT * FROM khuVuc ORDER BY rowid ASC').all() as Record<string, unknown>[];
  const bookingsRows = db.prepare('SELECT * FROM dangKy ORDER BY rowid DESC').all() as Record<string, unknown>[];

  return {
    users: usersRows.map((r) => rowToUser(r, includeContact || (requestor ? String(r.id) === requestor.id : false))),
    areas: areasRows.map(rowToArea),
    bookings: bookingsRows.map(rowToBooking),
  };
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createBookingAtomic(
  authUser: NguoiDung,
  payload: {
    idKhuVuc: string;
    ngaySuDung: string;
    buoi?: 'sáng' | 'chiều';
    tiet?: 1 | 2 | 3 | 4 | 5;
    lop?: string;
    nguoiDaiDienId?: string;
    gioBatDau?: string;
    gioKetThuc?: string;
    mucDichSuDung?: string;
  }
): DangKy {
  const now = new Date();
  db.exec('BEGIN IMMEDIATE');
  try {
    sweepOverdueInTx(now);

    const areaRow = db.prepare('SELECT * FROM khuVuc WHERE id = ?').get(payload.idKhuVuc) as Record<string, unknown> | undefined;
    const area = areaRow ? rowToArea(areaRow) : undefined;
    if (!area) {
      throw new HttpError(404, 'Khu vực thể thao không tồn tại.');
    }

    const thu = getThuTrongTuan(payload.ngaySuDung);
    const isWeekend = isCuoiTuan(thu);

    // Determine owner user & renter role
    let ownerUser = authUser;
    if (
      isWeekend &&
      (authUser.idVaiTro === 'admin' || authUser.idVaiTro === 'bgh') &&
      payload.nguoiDaiDienId &&
      payload.nguoiDaiDienId !== authUser.id
    ) {
      const targetRow = db.prepare('SELECT * FROM nguoiDung WHERE id = ?').get(payload.nguoiDaiDienId) as Record<string, unknown> | undefined;
      if (!targetRow) {
        throw new HttpError(400, 'Học sinh được chọn không tồn tại trong hệ thống.');
      }
      ownerUser = rowToUser(targetRow, false);
    }

    // Validate weekday rules
    let effectiveLop: string | undefined;
    let repName: string | undefined;
    let repId: string | undefined;

    if (!isWeekend) {
      if (authUser.idVaiTro === 'hoc_sinh') {
        throw new HttpError(
          403,
          'Quy định nhà trường: Học sinh chỉ được phép đăng ký thuê sân vào Thứ 7 và Chủ nhật.'
        );
      }
      if (!payload.lop || !isValidLopChuyen(payload.lop)) {
        throw new HttpError(400, 'Vui lòng chọn lớp học hợp lệ trong danh sách 24 lớp chuyên (10/11/12).');
      }
      effectiveLop = payload.lop.trim();
      // Weekday PE lessons belong to the teacher & class directly (no student representative)
      repName = undefined;
      repId = undefined;
    } else {
      if (ownerUser.idVaiTro === 'hoc_sinh') {
        effectiveLop = ownerUser.lop;
        repName = ownerUser.hoTen;
        repId = ownerUser.id;
      } else {
        effectiveLop = payload.lop && isValidLopChuyen(payload.lop) ? payload.lop.trim() : undefined;
      }
    }

    const allBookingsRows = db.prepare('SELECT * FROM dangKy').all() as Record<string, unknown>[];
    const allBookings = allBookingsRows.map(rowToBooking);

    const candidate: Partial<DangKy> = {
      idNguoiDung: ownerUser.id,
      idKhuVuc: area.id,
      ngaySuDung: payload.ngaySuDung,
      thu,
      buoi: !isWeekend ? (payload.buoi || 'chiều') : undefined,
      tiet: !isWeekend ? payload.tiet : undefined,
      gioBatDau: isWeekend ? payload.gioBatDau : undefined,
      gioKetThuc: isWeekend ? payload.gioKetThuc : undefined,
    };

    const conflict = checkBookingConflict(
      allBookings,
      area,
      candidate,
      undefined,
      ownerUser.idVaiTro,
      now
    );

    if (conflict.hasConflict) {
      throw new HttpError(409, conflict.reason || 'Xung đột lịch sử dụng khu vực.');
    }

    const tongTien = calculateBookingCost(
      area.giaThueGio,
      isWeekend,
      ownerUser.idVaiTro,
      payload.gioBatDau,
      payload.gioKetThuc
    );

    const newBooking: DangKy = {
      id: `bk_${crypto.randomUUID()}`,
      idNguoiDung: ownerUser.id,
      idKhuVuc: area.id,
      ngaySuDung: payload.ngaySuDung,
      thu,
      buoi: !isWeekend ? 'chiều' : undefined,
      tiet: !isWeekend ? payload.tiet : undefined,
      lop: effectiveLop,
      nguoiDaiDienTen: repName,
      nguoiDaiDienId: repId,
      gioBatDau: isWeekend ? payload.gioBatDau : undefined,
      gioKetThuc: isWeekend ? payload.gioKetThuc : undefined,
      trangThai: 'đã đăng ký',
      thoiGianBatDauThucTe: null,
      thoiGianTra: null,
      mucDichSuDung:
        payload.mucDichSuDung?.trim() ||
        (isWeekend
          ? ownerUser.idVaiTro === 'hoc_sinh'
            ? `Học sinh lớp ${effectiveLop || ''} thuê vui chơi thể thao cuối tuần`
            : `Hoạt động thể thao cuối tuần (${ownerUser.hoTen})`
          : `Dạy học thể dục chính khóa lớp ${effectiveLop || ''}`),
      tongTien,
    };

    db.prepare(`
      INSERT INTO dangKy (
        id, idNguoiDung, idKhuVuc, ngaySuDung, thu, buoi, tiet, lop,
        nguoiDaiDienTen, nguoiDaiDienId, gioBatDau, gioKetThuc, trangThai,
        thoiGianBatDauThucTe, thoiGianTra, mucDichSuDung, tongTien, ghiChuHeThong
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newBooking.id,
      newBooking.idNguoiDung,
      newBooking.idKhuVuc,
      newBooking.ngaySuDung,
      newBooking.thu,
      newBooking.buoi || null,
      newBooking.tiet ?? null,
      newBooking.lop || null,
      newBooking.nguoiDaiDienTen || null,
      newBooking.nguoiDaiDienId || null,
      newBooking.gioBatDau || null,
      newBooking.gioKetThuc || null,
      newBooking.trangThai,
      null,
      null,
      newBooking.mucDichSuDung || null,
      newBooking.tongTien || 0,
      null
    );

    db.exec('COMMIT');
    return newBooking;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function sweepOverdueInTx(now: Date) {
  const rows = db
    .prepare("SELECT * FROM dangKy WHERE trangThai = 'đã đăng ký'")
    .all() as Record<string, unknown>[];
  const stmt = db.prepare(
    "UPDATE dangKy SET trangThai = 'quá hạn', ghiChuHeThong = COALESCE(ghiChuHeThong, 'Quá giờ sử dụng nhưng không nhận sân (No-show)') WHERE id = ? AND trangThai = 'đã đăng ký'"
  );
  for (const r of rows) {
    const b = rowToBooking(r);
    if (isSlotEnded(b, now)) {
      stmt.run(b.id);
    }
  }
}

export function updateBookingAtomic(
  authUser: NguoiDung,
  bookingId: string,
  payload: {
    idKhuVuc: string;
    ngaySuDung: string;
    buoi?: 'sáng' | 'chiều';
    tiet?: 1 | 2 | 3 | 4 | 5;
    lop?: string;
    gioBatDau?: string;
    gioKetThuc?: string;
    mucDichSuDung?: string;
  }
): DangKy {
  const now = new Date();
  db.exec('BEGIN IMMEDIATE');
  try {
    sweepOverdueInTx(now);

    const existingRow = db.prepare('SELECT * FROM dangKy WHERE id = ?').get(bookingId) as Record<string, unknown> | undefined;
    if (!existingRow) {
      throw new HttpError(404, 'Không tìm thấy lượt đăng ký.');
    }
    const existing = rowToBooking(existingRow);

    const isAdminOrBgh = authUser.idVaiTro === 'admin' || authUser.idVaiTro === 'bgh';
    if (existing.idNguoiDung !== authUser.id && !isAdminOrBgh) {
      throw new HttpError(403, 'Bạn không có quyền chỉnh sửa lượt đăng ký của người khác.');
    }

    const editGuard = canEditOrCancelBooking(existing, now);
    if (!editGuard.allowed) {
      throw new HttpError(400, editGuard.reason || 'Không thể chỉnh sửa lượt đăng ký này.');
    }

    // Preserve original owner!
    const ownerRow = db.prepare('SELECT * FROM nguoiDung WHERE id = ?').get(existing.idNguoiDung) as Record<string, unknown> | undefined;
    const ownerUser = ownerRow ? rowToUser(ownerRow, false) : authUser;

    const areaRow = db.prepare('SELECT * FROM khuVuc WHERE id = ?').get(payload.idKhuVuc) as Record<string, unknown> | undefined;
    const area = areaRow ? rowToArea(areaRow) : undefined;
    if (!area) {
      throw new HttpError(404, 'Khu vực thể thao không tồn tại.');
    }

    const thu = getThuTrongTuan(payload.ngaySuDung);
    const isWeekend = isCuoiTuan(thu);

    if (!isWeekend && ownerUser.idVaiTro === 'hoc_sinh') {
      throw new HttpError(403, 'Học sinh chỉ được phép đăng ký thuê sân vào Thứ 7 và Chủ nhật.');
    }

    let effectiveLop = existing.lop;
    if (!isWeekend) {
      if (!payload.lop || !isValidLopChuyen(payload.lop)) {
        throw new HttpError(400, 'Vui lòng chọn lớp học hợp lệ trong danh sách 24 lớp chuyên.');
      }
      effectiveLop = payload.lop.trim();
    } else if (ownerUser.idVaiTro === 'hoc_sinh') {
      effectiveLop = ownerUser.lop;
    } else {
      effectiveLop = payload.lop && isValidLopChuyen(payload.lop) ? payload.lop.trim() : undefined;
    }

    const allBookingsRows = db.prepare('SELECT * FROM dangKy').all() as Record<string, unknown>[];
    const allBookings = allBookingsRows.map(rowToBooking);

    const candidate: Partial<DangKy> = {
      id: existing.id,
      idNguoiDung: existing.idNguoiDung,
      idKhuVuc: area.id,
      ngaySuDung: payload.ngaySuDung,
      thu,
      buoi: !isWeekend ? (payload.buoi || 'chiều') : undefined,
      tiet: !isWeekend ? payload.tiet : undefined,
      gioBatDau: isWeekend ? payload.gioBatDau : undefined,
      gioKetThuc: isWeekend ? payload.gioKetThuc : undefined,
    };

    const conflict = checkBookingConflict(
      allBookings,
      area,
      candidate,
      existing.id,
      ownerUser.idVaiTro,
      now
    );

    if (conflict.hasConflict) {
      throw new HttpError(409, conflict.reason || 'Xung đột lịch sử dụng khu vực.');
    }

    const tongTien = calculateBookingCost(
      area.giaThueGio,
      isWeekend,
      ownerUser.idVaiTro,
      payload.gioBatDau,
      payload.gioKetThuc
    );

    const updated: DangKy = {
      ...existing,
      idKhuVuc: area.id,
      ngaySuDung: payload.ngaySuDung,
      thu,
      buoi: !isWeekend ? 'chiều' : undefined,
      tiet: !isWeekend ? payload.tiet : undefined,
      lop: effectiveLop,
      nguoiDaiDienTen: isWeekend && ownerUser.idVaiTro === 'hoc_sinh' ? ownerUser.hoTen : undefined,
      nguoiDaiDienId: isWeekend && ownerUser.idVaiTro === 'hoc_sinh' ? ownerUser.id : undefined,
      gioBatDau: isWeekend ? payload.gioBatDau : undefined,
      gioKetThuc: isWeekend ? payload.gioKetThuc : undefined,
      mucDichSuDung: payload.mucDichSuDung?.trim() || existing.mucDichSuDung,
      tongTien,
    };

    db.prepare(`
      UPDATE dangKy SET
        idKhuVuc = ?, ngaySuDung = ?, thu = ?, buoi = ?, tiet = ?, lop = ?,
        nguoiDaiDienTen = ?, nguoiDaiDienId = ?, gioBatDau = ?, gioKetThuc = ?,
        mucDichSuDung = ?, tongTien = ?
      WHERE id = ?
    `).run(
      updated.idKhuVuc,
      updated.ngaySuDung,
      updated.thu,
      updated.buoi || null,
      updated.tiet ?? null,
      updated.lop || null,
      updated.nguoiDaiDienTen || null,
      updated.nguoiDaiDienId || null,
      updated.gioBatDau || null,
      updated.gioKetThuc || null,
      updated.mucDichSuDung || null,
      updated.tongTien || 0,
      updated.id
    );

    db.exec('COMMIT');
    return updated;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function startUsingBookingAtomic(authUser: NguoiDung, bookingId: string): DangKy {
  const now = new Date();
  db.exec('BEGIN IMMEDIATE');
  try {
    sweepOverdueInTx(now);
    const existingRow = db.prepare('SELECT * FROM dangKy WHERE id = ?').get(bookingId) as Record<string, unknown> | undefined;
    if (!existingRow) throw new HttpError(404, 'Không tìm thấy lượt đăng ký.');
    const existing = rowToBooking(existingRow);

    const isAdminOrBgh = authUser.idVaiTro === 'admin' || authUser.idVaiTro === 'bgh';
    if (existing.idNguoiDung !== authUser.id && !isAdminOrBgh) {
      throw new HttpError(403, 'Bạn không có quyền thao tác lượt đăng ký này.');
    }

    if (existing.trangThai !== 'đã đăng ký') {
      throw new HttpError(400, `Lượt đăng ký đang ở trạng thái "${existing.trangThai}", không thể nhận sân.`);
    }

    if (isSlotEnded(existing, now)) {
      throw new HttpError(400, 'Lượt đăng ký đã quá giờ sử dụng.');
    }

    const startTimeStr = formatDateTimeToVN(now);
    db.prepare(
      "UPDATE dangKy SET trangThai = 'đang sử dụng', thoiGianBatDauThucTe = ? WHERE id = ?"
    ).run(startTimeStr, bookingId);

    db.exec('COMMIT');
    return {
      ...existing,
      trangThai: 'đang sử dụng',
      thoiGianBatDauThucTe: startTimeStr,
    };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function returnBookingAtomic(authUser: NguoiDung, bookingId: string): DangKy {
  const now = new Date();
  db.exec('BEGIN IMMEDIATE');
  try {
    const existingRow = db.prepare('SELECT * FROM dangKy WHERE id = ?').get(bookingId) as Record<string, unknown> | undefined;
    if (!existingRow) throw new HttpError(404, 'Không tìm thấy lượt đăng ký.');
    const existing = rowToBooking(existingRow);

    const isAdminOrBgh = authUser.idVaiTro === 'admin' || authUser.idVaiTro === 'bgh';
    if (existing.idNguoiDung !== authUser.id && !isAdminOrBgh) {
      throw new HttpError(403, 'Bạn không có quyền trả sân cho lượt đăng ký này.');
    }

    if (existing.trangThai !== 'đang sử dụng') {
      throw new HttpError(400, 'Chỉ có thể trả khu vực đang ở trạng thái "đang sử dụng".');
    }

    const areaRow = db.prepare('SELECT * FROM khuVuc WHERE id = ?').get(existing.idKhuVuc) as Record<string, unknown> | undefined;
    const area = areaRow ? rowToArea(areaRow) : undefined;
    const ownerRow = db.prepare('SELECT * FROM nguoiDung WHERE id = ?').get(existing.idNguoiDung) as Record<string, unknown> | undefined;
    const ownerRole = ownerRow ? String(ownerRow.idVaiTro) : undefined;

    const timeStr = formatDateTimeToVN(now);
    const updatedCost = area
      ? calculateActualReturnCost(area.giaThueGio, existing, timeStr, ownerRole)
      : existing.tongTien || 0;

    let note = existing.ghiChuHeThong;
    const isLate = isSlotEnded(existing, now);
    if (isLate) {
      note = `Trả sân muộn hơn giờ quy định (lúc ${timeStr})`;
    } else if (existing.gioBatDau && existing.gioKetThuc) {
      const nowHHmm = timeStr.split(' ')[0];
      if (existing.ngaySuDung === formatDateToVN(now) && timeStringToMinutes(nowHHmm) < timeStringToMinutes(existing.gioKetThuc)) {
        note = `Trả sân sớm lúc ${nowHHmm} — đã giải phóng phần giờ còn lại và tính lại phí thuê (${updatedCost.toLocaleString('vi-VN')} đ)`;
      }
    }

    db.prepare(
      "UPDATE dangKy SET trangThai = 'đã trả', thoiGianTra = ?, tongTien = ?, ghiChuHeThong = ? WHERE id = ?"
    ).run(timeStr, updatedCost, note || null, bookingId);

    db.exec('COMMIT');
    return {
      ...existing,
      trangThai: 'đã trả',
      thoiGianTra: timeStr,
      tongTien: updatedCost,
      ghiChuHeThong: note,
    };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function cancelBookingAtomic(authUser: NguoiDung, bookingId: string): DangKy {
  const now = new Date();
  db.exec('BEGIN IMMEDIATE');
  try {
    sweepOverdueInTx(now);
    const existingRow = db.prepare('SELECT * FROM dangKy WHERE id = ?').get(bookingId) as Record<string, unknown> | undefined;
    if (!existingRow) throw new HttpError(404, 'Không tìm thấy lượt đăng ký.');
    const existing = rowToBooking(existingRow);

    const isAdminOrBgh = authUser.idVaiTro === 'admin' || authUser.idVaiTro === 'bgh';
    if (existing.idNguoiDung !== authUser.id && !isAdminOrBgh) {
      throw new HttpError(403, 'Bạn không có quyền hủy lượt đăng ký này.');
    }

    const cancelGuard = canEditOrCancelBooking(existing, now);
    if (!cancelGuard.allowed) {
      throw new HttpError(400, cancelGuard.reason || 'Không thể hủy lượt đăng ký này.');
    }

    db.prepare("UPDATE dangKy SET trangThai = 'đã hủy' WHERE id = ?").run(bookingId);
    db.exec('COMMIT');
    return { ...existing, trangThai: 'đã hủy' };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function createAreaAtomic(payload: Omit<KhuVuc, 'id'>): KhuVuc {
  if (!payload.tenKhuVuc?.trim()) {
    throw new HttpError(400, 'Vui lòng nhập tên khu vực thể thao.');
  }
  const newArea: KhuVuc = {
    id: `kv_${crypto.randomUUID()}`,
    tenKhuVuc: payload.tenKhuVuc.trim(),
    giaThueGio: Math.max(0, Number(payload.giaThueGio) || 0),
    trangThai: payload.trangThai || 'hoạt động',
    moTa: payload.moTa?.trim() || undefined,
    viTri: payload.viTri?.trim() || undefined,
    hinhAnh: payload.hinhAnh?.trim() || undefined,
  };
  db.prepare(`
    INSERT INTO khuVuc (id, tenKhuVuc, giaThueGio, trangThai, moTa, hinhAnh, viTri)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    newArea.id,
    newArea.tenKhuVuc,
    newArea.giaThueGio,
    newArea.trangThai,
    newArea.moTa || null,
    newArea.hinhAnh || null,
    newArea.viTri || null
  );
  return newArea;
}

export function updateAreaAtomic(
  areaId: string,
  payload: Partial<KhuVuc>
): { area: KhuVuc; cancelledCount: number } {
  db.exec('BEGIN IMMEDIATE');
  try {
    const existingRow = db.prepare('SELECT * FROM khuVuc WHERE id = ?').get(areaId) as Record<string, unknown> | undefined;
    if (!existingRow) throw new HttpError(404, 'Khu vực không tồn tại.');
    const existing = rowToArea(existingRow);

    const updated: KhuVuc = {
      ...existing,
      tenKhuVuc: payload.tenKhuVuc?.trim() || existing.tenKhuVuc,
      giaThueGio:
        payload.giaThueGio !== undefined ? Math.max(0, Number(payload.giaThueGio) || 0) : existing.giaThueGio,
      trangThai: payload.trangThai || existing.trangThai,
      moTa: payload.moTa !== undefined ? payload.moTa?.trim() || undefined : existing.moTa,
      viTri: payload.viTri !== undefined ? payload.viTri?.trim() || undefined : existing.viTri,
      hinhAnh: payload.hinhAnh !== undefined ? payload.hinhAnh?.trim() || existing.hinhAnh : existing.hinhAnh,
    };

    db.prepare(`
      UPDATE khuVuc SET tenKhuVuc = ?, giaThueGio = ?, trangThai = ?, moTa = ?, hinhAnh = ?, viTri = ?
      WHERE id = ?
    `).run(
      updated.tenKhuVuc,
      updated.giaThueGio,
      updated.trangThai,
      updated.moTa || null,
      updated.hinhAnh || null,
      updated.viTri || null,
      updated.id
    );

    let cancelledCount = 0;
    if (updated.trangThai !== 'hoạt động') {
      const note = `Tự động hủy do khu vực chuyển sang trạng thái "${updated.trangThai}"`;
      const result = db
        .prepare("UPDATE dangKy SET trangThai = 'đã hủy', ghiChuHeThong = ? WHERE idKhuVuc = ? AND trangThai = 'đã đăng ký'")
        .run(note, updated.id);
      cancelledCount = Number(result.changes || 0);
    }

    db.exec('COMMIT');
    return { area: updated, cancelledCount };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function deleteAreaAtomic(areaId: string) {
  const existingRow = db.prepare('SELECT * FROM khuVuc WHERE id = ?').get(areaId) as Record<string, unknown> | undefined;
  if (!existingRow) throw new HttpError(404, 'Khu vực không tồn tại.');

  const refCount = db.prepare('SELECT COUNT(*) as cnt FROM dangKy WHERE idKhuVuc = ?').get(areaId) as { cnt: number };
  if (refCount.cnt > 0) {
    throw new HttpError(
      409,
      `Không thể xóa khu vực "${String(existingRow.tenKhuVuc)}" vì đang có ${refCount.cnt} lượt đăng ký lịch sử gắn với khu vực này. Vui lòng chuyển trạng thái sang "Ngừng sử dụng" để bảo toàn dữ liệu thống kê.`
    );
  }

  try {
    db.prepare('DELETE FROM khuVuc WHERE id = ?').run(areaId);
  } catch (err: unknown) {
    throw new HttpError(409, 'Không thể xóa khu vực do ràng buộc khóa ngoại trong cơ sở dữ liệu.');
  }
}

export function createUserAtomic(payload: {
  tenDangNhap: string;
  matKhau: string;
  hoTen: string;
  idVaiTro: VaiTroId;
  lop?: string;
  soDienThoai?: string;
  email?: string;
}): NguoiDung {
  const username = payload.tenDangNhap?.trim().toLowerCase();
  const hoTen = payload.hoTen?.trim();
  const matKhau = payload.matKhau?.trim();

  if (!username || !hoTen || !matKhau) {
    throw new HttpError(400, 'Vui lòng điền đầy đủ tên đăng nhập, mật khẩu và họ tên.');
  }

  if (!['admin', 'bgh', 'giao_vien', 'hoc_sinh'].includes(payload.idVaiTro)) {
    throw new HttpError(400, 'Vai trò không hợp lệ.');
  }

  if (payload.idVaiTro === 'hoc_sinh' && !isValidLopChuyen(payload.lop)) {
    throw new HttpError(
      400,
      'Tài khoản Học sinh bắt buộc phải chọn đúng 1 trong 24 lớp chuyên (10/11/12: Toán, Lý, Hóa, Sinh, Tin, Anh 1, Anh 2, Văn).'
    );
  }

  const dup = db.prepare('SELECT id FROM nguoiDung WHERE tenDangNhap = ?').get(username);
  if (dup) {
    throw new HttpError(409, `Tên đăng nhập "@${username}" đã tồn tại.`);
  }

  const newUser: NguoiDung = {
    id: `u_${crypto.randomUUID()}`,
    tenDangNhap: username,
    idVaiTro: payload.idVaiTro,
    hoTen,
    lop: payload.idVaiTro === 'hoc_sinh' ? payload.lop!.trim() : undefined,
    trangThai: 'hoạt động',
    ngayTao: formatDateToVN(new Date()),
    soDienThoai: payload.soDienThoai?.trim() || undefined,
    email: payload.email?.trim() || undefined,
  };

  db.prepare(`
    INSERT INTO nguoiDung (
      id, tenDangNhap, idVaiTro, matKhau, hoTen, lop, trangThai, ngayTao, soDienThoai, email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newUser.id,
    newUser.tenDangNhap,
    newUser.idVaiTro,
    hashPassword(matKhau),
    newUser.hoTen,
    newUser.lop || null,
    newUser.trangThai,
    newUser.ngayTao,
    newUser.soDienThoai || null,
    newUser.email || null
  );

  return newUser;
}

export function createBatchUsersAtomic(
  usersList: Array<{
    tenDangNhap: string;
    matKhau?: string;
    hoTen: string;
    idVaiTro: VaiTroId;
    lop?: string;
    soDienThoai?: string;
    email?: string;
  }>
): NguoiDung[] {
  if (!Array.isArray(usersList) || usersList.length === 0) {
    throw new HttpError(400, 'Danh sách tài khoản nhập trống.');
  }

  const created: NguoiDung[] = [];
  const today = formatDateToVN(new Date());

  db.exec('BEGIN IMMEDIATE');
  try {
    const checkDup = db.prepare('SELECT id FROM nguoiDung WHERE tenDangNhap = ?');
    const insertStmt = db.prepare(`
      INSERT INTO nguoiDung (
        id, tenDangNhap, idVaiTro, matKhau, hoTen, lop, trangThai, ngayTao, soDienThoai, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of usersList) {
      const username = item.tenDangNhap?.trim().toLowerCase();
      const hoTen = item.hoTen?.trim();
      if (!username || !hoTen) {
        throw new HttpError(400, 'Có dòng thiếu tên đăng nhập hoặc họ tên.');
      }
      if (!['admin', 'bgh', 'giao_vien', 'hoc_sinh'].includes(item.idVaiTro)) {
        throw new HttpError(400, `Vai trò không hợp lệ cho tài khoản @${username}.`);
      }
      if (item.idVaiTro === 'hoc_sinh' && !isValidLopChuyen(item.lop)) {
        throw new HttpError(
          400,
          `Tài khoản học sinh @${username} có lớp "${item.lop || ''}" không thuộc 24 lớp chuyên của trường.`
        );
      }
      if (checkDup.get(username)) {
        throw new HttpError(409, `Tên đăng nhập "@${username}" đã tồn tại.`);
      }

      const newUser: NguoiDung = {
        id: `u_${crypto.randomUUID()}`,
        tenDangNhap: username,
        idVaiTro: item.idVaiTro,
        hoTen,
        lop: item.idVaiTro === 'hoc_sinh' ? item.lop!.trim() : undefined,
        trangThai: 'hoạt động',
        ngayTao: today,
        soDienThoai: item.soDienThoai?.trim() || undefined,
        email: item.email?.trim() || undefined,
      };

      insertStmt.run(
        newUser.id,
        newUser.tenDangNhap,
        newUser.idVaiTro,
        hashPassword(item.matKhau?.trim() || '123456'),
        newUser.hoTen,
        newUser.lop || null,
        newUser.trangThai,
        newUser.ngayTao,
        newUser.soDienThoai || null,
        newUser.email || null
      );

      created.push(newUser);
    }

    db.exec('COMMIT');
    return created;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function toggleUserStatusAtomic(authUser: NguoiDung, userId: string): NguoiDung {
  if (authUser.id === userId) {
    throw new HttpError(400, 'Không thể tự khóa tài khoản đang đăng nhập của chính mình.');
  }
  const existingRow = db.prepare('SELECT * FROM nguoiDung WHERE id = ?').get(userId) as Record<string, unknown> | undefined;
  if (!existingRow) throw new HttpError(404, 'Tài khoản không tồn tại.');
  if (userId === 'u_admin') {
    throw new HttpError(400, 'Không thể khóa tài khoản Quản trị viên gốc.');
  }

  const nextStatus: TrangThaiNguoiDung =
    String(existingRow.trangThai) === 'hoạt động' ? 'bị khóa' : 'hoạt động';
  db.prepare('UPDATE nguoiDung SET trangThai = ? WHERE id = ?').run(nextStatus, userId);

  return rowToUser({ ...existingRow, trangThai: nextStatus }, true);
}

export function deleteUserAtomic(authUser: NguoiDung, userId: string) {
  if (userId === 'u_admin' || userId === authUser.id) {
    throw new HttpError(400, 'Không thể xóa tài khoản Quản trị viên gốc hoặc chính mình.');
  }
  const existingRow = db.prepare('SELECT * FROM nguoiDung WHERE id = ?').get(userId) as Record<string, unknown> | undefined;
  if (!existingRow) throw new HttpError(404, 'Tài khoản không tồn tại.');

  const refCount = db.prepare('SELECT COUNT(*) as cnt FROM dangKy WHERE idNguoiDung = ?').get(userId) as { cnt: number };
  if (refCount.cnt > 0) {
    throw new HttpError(
      409,
      `Không thể xóa tài khoản "${String(existingRow.hoTen)}" vì đã phát sinh ${refCount.cnt} lượt mượn/thuê sân trong lịch sử. Vui lòng dùng tính năng "Khóa tài khoản" để vô hiệu hóa đăng nhập.`
    );
  }

  try {
    db.prepare('DELETE FROM nguoiDung WHERE id = ?').run(userId);
  } catch {
    throw new HttpError(409, 'Không thể xóa tài khoản do ràng buộc khóa ngoại trong cơ sở dữ liệu.');
  }
}
