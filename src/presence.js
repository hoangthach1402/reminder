import { db, ref, set, onValue, onDisconnect } from './firebase';

// Lấy hoặc tạo sessionId từ localStorage
export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

// Theo dõi trạng thái trực tuyến
export function setupPresence(sessionId) {
  const sessionRef = ref(db, `sessions/${sessionId}`);
  const connectedRef = ref(db, '.info/connected');
  const startTime = Date.now();

  // Khi người dùng kết nối
  onValue(connectedRef, (snap) => {
    if (snap.val()) {
      set(sessionRef, {
        lastActive: Date.now(),
        status: 'online',
        startTime: startTime,
        endTime: null
      });
      onDisconnect(sessionRef).set({
        lastActive: Date.now(),
        status: 'offline',
        startTime: startTime,
        endTime: Date.now()
      });
    }
  });

  // Heartbeat: Cập nhật trạng thái mỗi 3 giây
  const heartbeat = setInterval(() => {
    set(sessionRef, {
      lastActive: Date.now(),
      status: 'online',
      startTime: startTime,
      endTime: null
    });
  }, 3000); // Giảm xuống 3 giây

  // Theo dõi và lưu thống kê hàng ngày
  updateDailyStats();

  // Dọn dẹp session liên tục
  const cleanupInterval = setInterval(cleanupInactiveSessions, 10000); // Chạy mỗi 10 giây

  // Cleanup khi component bị hủy
  return () => {
    clearInterval(heartbeat);
    clearInterval(cleanupInterval);
    set(sessionRef, {
      lastActive: Date.now(),
      status: 'offline',
      startTime: startTime,
      endTime: Date.now()
    });
  };
}

// Dọn dẹp các session không hoạt động
export function cleanupInactiveSessions() {
  const sessionsRef = ref(db, 'sessions');
  onValue(sessionsRef, (snap) => {
    const sessions = snap.val() || {};
    const now = Date.now();
    for (const [id, session] of Object.entries(sessions)) {
      if (session.lastActive < now - 5000 && session.status === 'online') { // Giảm ngưỡng xuống 5 giây
        set(ref(db, `sessions/${id}`), {
          ...session,
          status: 'offline',
          endTime: now
        });
      }
    }
  }, { onlyOnce: true });
}

// Cập nhật thống kê hàng ngày
export function updateDailyStats() {
  const sessionsRef = ref(db, 'sessions');
  const dailyStatsRef = ref(db, `dailyStats/${getDateKey()}`);

  onValue(sessionsRef, (snap) => {
    const sessions = snap.val() || {};
    const onlineCount = Object.values(sessions).filter(
      (session) => session.status === 'online'
    ).length;

    onValue(dailyStatsRef, (statSnap) => {
      const currentMax = statSnap.val()?.maxOnline || 0;
      if (onlineCount > currentMax) {
        set(dailyStatsRef, {
          date: getDateKey(),
          maxOnline: onlineCount
        });
      }
    }, { onlyOnce: true });
  });
}

// Hàm lấy key ngày (định dạng YYYY-MM-DD)
function getDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}