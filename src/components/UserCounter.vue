<script setup>
import { ref as vueRef, onMounted, onBeforeUnmount } from 'vue';
import { db, ref as firebaseRef, set, onValue, increment } from '../firebase';
import { setupPresence, getOrCreateSessionId, cleanupInactiveSessions } from '../presence';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const onlineUsers = vueRef(0);
const totalVisitors = vueRef(0);
const sessionId = getOrCreateSessionId();
let cleanup;
const chartData = vueRef({ labels: [], datasets: [] });
let chartInstance = null;

onMounted(() => {
  const totalVisitorsRef = firebaseRef(db, 'counters/totalVisitors');

  if (!localStorage.getItem('hasVisited')) {
    set(totalVisitorsRef, increment(1));
    localStorage.setItem('hasVisited', 'true');
  }

  onValue(totalVisitorsRef, (snap) => {
    totalVisitors.value = snap.val() || 0;
  });

  const sessionsRef = firebaseRef(db, 'sessions');
  onValue(sessionsRef, (snap) => {
    const sessions = snap.val() || {};
    onlineUsers.value = Object.values(sessions).filter(
      (session) => session.status === 'online'
    ).length; // Chỉ đếm session có status 'online'
  });

  const dailyStatsRef = firebaseRef(db, 'dailyStats');
  onValue(dailyStatsRef, (snap) => {
    const stats = snap.val() || {};
    const labels = [];
    const data = [];

    const sortedDays = Object.keys(stats).sort();
    sortedDays.forEach((day) => {
      labels.push(day);
      data.push(stats[day].maxOnline);
    });

    chartData.value = {
      labels: labels,
      datasets: [
        {
          label: 'Số người online tối đa mỗi ngày',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false
        }
      ]
    };

    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('onlineChart').getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData.value,
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'yyyy-MM-dd'
              }
            },
            title: {
              display: true,
              text: 'Ngày'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số người online'
            }
          }
        }
      }
    });
  });

  cleanup = setupPresence(sessionId);
  cleanupInactiveSessions();
});

onBeforeUnmount(() => {
  if (cleanup) cleanup();
  if (chartInstance) chartInstance.destroy();
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
      <div class="counter-item">
        <span class="icon">📊</span>
        <span class="value">{{ totalVisitors }}</span>
        <span class="label">Tổng lượt</span>
      </div>
    </div>
    <div class="chart-container">
      <canvas id="onlineChart"></canvas>
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

.chart-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>