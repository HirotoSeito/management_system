import path from 'node:path';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {
  ensureSeeded,
  getAllState,
  getUserById,
  authenticateUser,
  signAuthToken,
  verifyAuthToken,
  createBookingAtomic,
  updateBookingAtomic,
  startUsingBookingAtomic,
  returnBookingAtomic,
  cancelBookingAtomic,
  createAreaAtomic,
  updateAreaAtomic,
  deleteAreaAtomic,
  createUserAtomic,
  createBatchUsersAtomic,
  toggleUserStatusAtomic,
  deleteUserAtomic,
  resetDatabaseToSeed,
  sweepOverdueBookings,
  HttpError,
} from './src/server/db.ts';
import type { NguoiDung } from './src/types/index.ts';

dotenv.config();

ensureSeeded();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// SSE connected clients for real-time schedule synchronization across users
const sseClients = new Set<Response>();

function broadcastSync(resource: 'bookings' | 'areas' | 'users' | 'all') {
  const payload = JSON.stringify({ type: 'sync', resource, timestamp: Date.now() });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Periodically sweep overdue no-show bookings every 60 seconds
const sweepInterval = setInterval(() => {
  try {
    const changed = sweepOverdueBookings(new Date());
    if (changed) {
      broadcastSync('bookings');
    }
  } catch (err) {
    console.error('Overdue sweep error:', err);
  }
}, 60_000);
sweepInterval.unref();

function extractBearerUser(req: Request): NguoiDung | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  const decoded = verifyAuthToken(token);
  if (!decoded) return null;
  const user = getUserById(decoded.uid, true);
  if (!user || user.trangThai === 'bị khóa') return null;
  return user;
}

interface AuthedRequest extends Request {
  authUser?: NguoiDung;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = extractBearerUser(req);
  if (!user) {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc tài khoản đã bị khóa. Vui lòng đăng nhập lại.' });
    return;
  }
  req.authUser = user;
  next();
}

function requireRoles(...roles: NguoiDung['idVaiTro'][]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      res.status(401).json({ error: 'Vui lòng đăng nhập.' });
      return;
    }
    if (!roles.includes(req.authUser.idVaiTro)) {
      res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này.' });
      return;
    }
    next();
  };
}

// --- SSE Endpoint ---
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// --- Bootstrap & Auth ---
app.get('/api/bootstrap', (req: Request, res: Response) => {
  const currentUser = extractBearerUser(req);
  const state = getAllState(currentUser);
  res.json({
    ...state,
    currentUser,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { tenDangNhap, matKhau } = req.body || {};
  if (!tenDangNhap || !matKhau) {
    res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    return;
  }

  const result = authenticateUser(String(tenDangNhap), String(matKhau));
  if (!result.user) {
    res.status(result.status || 401).json({ error: result.error });
    return;
  }

  const token = signAuthToken(result.user.id);
  res.json({ token, user: result.user });
});

app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res: Response) => {
  res.json({ user: req.authUser });
});

// --- Bookings ---
app.post('/api/bookings', requireAuth, (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const created = createBookingAtomic(req.authUser!, req.body || {});
    broadcastSync('bookings');
    res.status(201).json({ booking: created });
  } catch (err) {
    next(err);
  }
});

app.put('/api/bookings/:id', requireAuth, (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = updateBookingAtomic(req.authUser!, String(req.params.id), req.body || {});
    broadcastSync('bookings');
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
});

app.post('/api/bookings/:id/start', requireAuth, (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = startUsingBookingAtomic(req.authUser!, String(req.params.id));
    broadcastSync('bookings');
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
});

app.post('/api/bookings/:id/return', requireAuth, (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = returnBookingAtomic(req.authUser!, String(req.params.id));
    broadcastSync('bookings');
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
});

app.post('/api/bookings/:id/cancel', requireAuth, (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = cancelBookingAtomic(req.authUser!, String(req.params.id));
    broadcastSync('bookings');
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
});

// --- Facilities (BGH & Admin) ---
app.post('/api/areas', requireAuth, requireRoles('bgh', 'admin'), (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const area = createAreaAtomic(req.body || {});
    broadcastSync('areas');
    res.status(201).json({ area });
  } catch (err) {
    next(err);
  }
});

app.put('/api/areas/:id', requireAuth, requireRoles('bgh', 'admin'), (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const result = updateAreaAtomic(String(req.params.id), req.body || {});
    broadcastSync('all');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/areas/:id', requireAuth, requireRoles('bgh', 'admin'), (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    deleteAreaAtomic(String(req.params.id));
    broadcastSync('areas');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- Users (Admin only) ---
app.post('/api/users', requireAuth, requireRoles('admin'), (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const user = createUserAtomic(req.body || {});
    broadcastSync('users');
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

app.post('/api/users/batch', requireAuth, requireRoles('admin'), (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const created = createBatchUsersAtomic(req.body?.users || []);
    broadcastSync('users');
    res.status(201).json({ users: created });
  } catch (err) {
    next(err);
  }
});

app.patch('/api/users/:id/toggle-status', requireAuth, requireRoles('admin'), (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const user = toggleUserStatusAtomic(req.authUser!, String(req.params.id));
    broadcastSync('users');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/users/:id', requireAuth, requireRoles('admin'), (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    deleteUserAtomic(req.authUser!, String(req.params.id));
    broadcastSync('users');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- Admin Database Reset ---
app.post('/api/reset', requireAuth, requireRoles('admin'), (_req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    resetDatabaseToSeed();
    broadcastSync('all');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Error handler for API routes
app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error('API Error:', err);
  res.status(500).json({ error: 'Lỗi máy chủ nội bộ. Vui lòng thử lại.' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
