<!-- src/components/UserCounter.vue -->
<script setup>
import { ref as vueRef, onMounted, onBeforeUnmount } from 'vue';
// import { db, ref as firebaseRef, set, onValue, increment } from '../firebase';
import { db, ref as firebaseRef, set, onValue, increment } from '../firebase';
const onlineUsers = vueRef(0);
const totalVisitors = vueRef(0);
const userSessionId = Date.now().toString();

const initCounter = () => {
  const userRef = firebaseRef(db, `sessions/${userSessionId}`);
  const countRef = firebaseRef(db, 'counters/totalVisitors');
  
  set(countRef, increment(1));
  set(userRef, { 
    lastActive: Date.now(),
    status: 'online'
  });

  window.addEventListener('beforeunload', () => {
    set(userRef, null);
  });

  onValue(firebaseRef(db, 'sessions'), (snapshot) => {
    const sessions = snapshot.val() || {};
    onlineUsers.value = Object.keys(sessions).length;
  });

  onValue(countRef, (snapshot) => {
    totalVisitors.value = snapshot.val() || 0;
  });
};

onMounted(initCounter);
onBeforeUnmount(() => {
  set(firebaseRef(db, `sessions/${userSessionId}`), null);
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