import { db, ref, set, onValue, onDisconnect } from './firebase';

// Khởi tạo hoặc lấy sessionId từ localStorage
export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

export function setupPresence(sessionId) {
  const sessionRef = ref(db, `sessions/${sessionId}`);
  const connectedRef = ref(db, '.info/connected');

  // Khi người dùng kết nối
  onValue(connectedRef, (snap) => {
    if (snap.val()) {
      set(sessionRef, { lastActive: Date.now(), status: 'online' });
      // Tự động xóa session khi ngắt kết nối
      onDisconnect(sessionRef).remove();
    }
  });

  // Heartbeat: Cập nhật trạng thái mỗi 5 giây
  const heartbeat = setInterval(() => {
    set(sessionRef, { lastActive: Date.now(), status: 'online' });
  }, 5000);

  // Cleanup khi component bị hủy
  return () => {
    clearInterval(heartbeat);
    set(sessionRef, null);
  };
}

// Dọn dẹp các session không hoạt động
export function cleanupInactiveSessions() {
  const sessionsRef = ref(db, 'sessions');
  onValue(sessionsRef, (snap) => {
    const sessions = snap.val() || {};
    const now = Date.now();
    for (const [id, session] of Object.entries(sessions)) {
      if (session.lastActive < now - 10000) { // Xóa sau 10 giây không hoạt động
        set(ref(db, `sessions/${id}`), null);
      }
    }
  }, { onlyOnce: true });
}