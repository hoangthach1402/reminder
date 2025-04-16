<script setup>
import { ref as vueRef, onMounted, onBeforeUnmount } from 'vue';
import { db, ref as firebaseRef, onValue } from '../firebase';
import { setupPresence, getOrCreateSessionId, cleanupInactiveSessions } from '../presence';

const onlineUsers = vueRef(0);
const sessionId = getOrCreateSessionId();
let cleanup;

onMounted(() => {
  // Theo dõi số người trực tuyến
  const sessionsRef = firebaseRef(db, 'sessions');
  onValue(sessionsRef, (snap) => {
    const sessions = snap.val() || {};
    onlineUsers.value = Object.values(sessions).filter(
      (session) => session.status === 'online'
    ).length;
  });

  cleanup = setupPresence(sessionId);
  cleanupInactiveSessions();
});

onBeforeUnmount(() => {
  if (cleanup) cleanup();
});
</script>

<template>
  <div class="user-counter-container">
    <div class="user-counter">
      <div class="counter-item">
        <span class="icon">👥</span>
        <span class="value">{{ onlineUsers }}</span>
        <span class="label">Online</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-counter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

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