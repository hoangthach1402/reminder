<script setup>
import { ref as vueRef, onMounted, onBeforeUnmount } from 'vue';
import { db, ref as firebaseRef, set, onValue, increment } from '../firebase';
import { setupPresence, getOrCreateSessionId, cleanupInactiveSessions } from '../presence';

// State
const onlineUsers = vueRef(0);
const totalVisitors = vueRef(0);
const sessionId = getOrCreateSessionId(); // Lấy hoặc tạo sessionId
let cleanup;

// Khởi tạo counter
onMounted(() => {
  const totalVisitorsRef = firebaseRef(db, 'counters/totalVisitors');

  // Chỉ tăng totalVisitors nếu là phiên mới
  if (!localStorage.getItem('hasVisited')) {
    set(totalVisitorsRef, increment(1));
    localStorage.setItem('hasVisited', 'true');
  }

  // Theo dõi tổng lượt truy cập
  onValue(totalVisitorsRef, (snap) => {
    totalVisitors.value = snap.val() || 0;
  });

  // Theo dõi số người trực tuyến
  const sessionsRef = firebaseRef(db, 'sessions');
  onValue(sessionsRef, (snap) => {
    const sessions = snap.val() || {};
    onlineUsers.value = Object.keys(sessions).length;
  });

  // Thiết lập presence
  cleanup = setupPresence(sessionId);

  // Dọn dẹp session không hoạt động
  cleanupInactiveSessions();
});

// Cleanup khi component bị hủy
onBeforeUnmount(() => {
  if (cleanup) cleanup();
});
</script>

<template>
  <div class="user-counter">
    <div class="counter-item">
      <span class="icon">👥</span>
      <span class="value">{{ onlineUsers }}</span>
      <span class="label">Online</span>
    </div>
    <div class="counter-item">
      <span class="icon">📊</span>
      <span class="value">{{ totalVisitors }}</span>
      <span class="label">Tổng lượt</span>
    </div>
  </div>
</template>

<style scoped>
.user-counter {
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.counter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 1.2em;
}

.value {
  font-weight: bold;
  color: #2c3e50;
}

.label {
  color: #7f8c8d;
  font-size: 0.9em;
}
</style>