```vue
<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue';
import UserCounter from './UserCounter.vue';
import { loadStudySounds } from '../utils/soundUtils';

const studyDuration = ref(25);
const breakDuration = ref(5);
const minReminderDelay = ref(3); // Thời gian tối thiểu (giây)
const maxReminderDelay = ref(10); // Thời gian tối đa (giây)
const isStudying = ref(false);
const timeLeft = ref(0);
const currentMode = ref('study');
const enableReminders = ref(false);
const reminderSounds = ref([]);
const isLoadingSounds = ref(true);
const currentSoundIndex = ref(0);
const shuffledSounds = ref([]);

let timer = null;
let reminderTimer = null;

// Hàm xáo trộn mảng (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Hàm phát âm thanh theo thứ tự đã xáo trộn
const playShuffledSounds = async () => {
  if (
    !isStudying.value ||
    !enableReminders.value ||
    currentMode.value !== 'study' ||
    shuffledSounds.value.length === 0
  ) {
    return;
  }

  // Nếu đã phát hết mảng, xáo trộn lại
  if (currentSoundIndex.value >= shuffledSounds.value.length) {
    shuffledSounds.value = shuffleArray(reminderSounds.value);
    currentSoundIndex.value = 0;
  }

  // Lấy âm thanh hiện tại
  const currentSound = shuffledSounds.value[currentSoundIndex.value];

  try {
    // Reset thời gian âm thanh về đầu
    currentSound.currentTime = 0;
    // Phát âm thanh
    await currentSound.play();
    console.log('Đang phát âm thanh:', currentSound.src);
  } catch (e) {
    console.error('Lỗi phát âm thanh:', e);
    // Nếu không thể phát âm thanh này, thử âm thanh tiếp theo
    currentSoundIndex.value++;
    playShuffledSounds();
    return;
  }

  // Tăng index cho lần sau
  currentSoundIndex.value++;

  // Đặt thời gian cho lần phát tiếp theo (dùng minReminderDelay và maxReminderDelay)
  const minDelayMs = minReminderDelay.value * 1000; // Chuyển giây thành mili giây
  const maxDelayMs = maxReminderDelay.value * 1000;
  const nextDelay = Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;
  reminderTimer = setTimeout(playShuffledSounds, nextDelay);
};

// Load sounds khi component được mount
onMounted(async () => {
  isLoadingSounds.value = true;
  try {
    reminderSounds.value = await loadStudySounds();
    shuffledSounds.value = shuffleArray(reminderSounds.value);
  } catch (error) {
    console.error('Failed to load sounds:', error);
  } finally {
    isLoadingSounds.value = false;
  }
});

const startStudySession = () => {
  if (isLoadingSounds.value) {
    alert('Đang tải âm thanh, vui lòng đợi một chút...');
    return;
  }

  // Kiểm tra giá trị min và max delay
  if (minReminderDelay.value >= maxReminderDelay.value) {
    alert('Thời gian tối thiểu phải nhỏ hơn thời gian tối đa!');
    return;
  }

  isStudying.value = true;
  timeLeft.value = studyDuration.value * 60;
  currentMode.value = 'study';
  startTimer();

  // Bắt đầu phát âm thanh nếu được bật
  if (enableReminders.value) {
    currentSoundIndex.value = 0; // Reset index
    shuffledSounds.value = shuffleArray(reminderSounds.value); // Xáo trộn lại
    playShuffledSounds();
  }
};

const startBreak = () => {
  timeLeft.value = breakDuration.value * 60;
  currentMode.value = 'break';
  startTimer();

  // Dừng phát âm thanh trong giờ nghỉ
  if (reminderTimer) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }
};

const startTimer = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      if (currentMode.value === 'study') {
        startBreak();
      } else {
        startStudySession();
      }
    }
  }, 1000);
};

const stopSession = () => {
  isStudying.value = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (reminderTimer) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }
  timeLeft.value = 0;
  // Dừng tất cả âm thanh đang phát
  reminderSounds.value.forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Cleanup khi component bị hủy
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  if (reminderTimer) clearTimeout(reminderTimer);
  reminderSounds.value.forEach(sound => {
    sound.pause();
    if (sound.stop) sound.stop();
    if (sound.unload) sound.unload();
  });
});
</script>

<template>
  <div class="page-wrapper">
    <div class="main-container">
      <h1>Chế độ học tập</h1>

      <div class="settings" :class="{ 'settings-hidden': isStudying }">
        <div class="setting-group">
          <label for="study-duration">⏱ Thời gian học (phút):</label>
          <select id="study-duration" v-model="studyDuration">
            <option value="25">25 phút</option>
            <option value="30">30 phút</option>
            <option value="45">45 phút</option>
            <option value="60">60 phút</option>
          </select>
        </div>

        <div class="setting-group">
          <label for="break-duration">🌟 Thời gian nghỉ (phút):</label>
          <select id="break-duration" v-model="breakDuration">
            <option value="5">5 phút</option>
            <option value="10">10 phút</option>
            <option value="15">15 phút</option>
          </select>
        </div>

        <div class="setting-group reminder-setting">
          <label class="reminder-label">
            <input
              type="checkbox"
              v-model="enableReminders"
              :disabled="isStudying || isLoadingSounds"
            />
            🔔 Bật nhắc nhở tập trung
            <span v-if="isLoadingSounds" class="loading-text">
              (Đang tải âm thanh...)
            </span>
          </label>
        </div>

        <div class="setting-group reminder-delay" v-if="enableReminders">
          <label for="min-reminder-delay">Thời gian nhắc nhở (giây):</label>
          <div class="delay-inputs">
            <input
              type="number"
              id="min-reminder-delay"
              v-model.number="minReminderDelay"
              min="1"
              max="300"
              :disabled="isStudying || isLoadingSounds"
              placeholder="Tối thiểu"
            />
            <span>đến</span>
            <input
              type="number"
              id="max-reminder-delay"
              v-model.number="maxReminderDelay"
              min="1"
              max="300"
              :disabled="isStudying || isLoadingSounds"
              placeholder="Tối đa"
            />
          </div>
        </div>
      </div>

      <div
        class="status-box"
        :class="{ 'study': currentMode === 'study', 'break': currentMode === 'break' }"
      >
        <template v-if="isStudying">
          <h2>{{ currentMode === 'study' ? 'Đang học tập' : 'Đang nghỉ ngơi' }}</h2>
          <div class="timer">{{ formatTime(timeLeft) }}</div>
        </template>
        <template v-else>
          <h2>Sẵn sàng học tập?</h2>
        </template>
      </div>

      <div class="controls">
        <button
          @click="isStudying ? stopSession() : startStudySession()"
          :class="{ active: isStudying }"
          :disabled="isLoadingSounds && !isStudying"
        >
          {{ isStudying ? 'Dừng' : 'Bắt đầu học' }}
        </button>
      </div>

      <UserCounter class="user-counter" />
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #4299e1; /* Màu xanh dương cho chế độ nghỉ */
  --success-color: #48bb78; /* Màu xanh lá cho chế độ học */
  --text-color: #2d3748;
  --bg-color: #f7fafc;
  --white: #ffffff;
  --shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 1rem;
}

.main-container {
  background-color: var(--white);
  padding: 2rem;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 600px;
}

h1 {
  color: var(--text-color);
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Poppins', sans-serif;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-color);
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.settings-hidden {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.setting-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.reminder-setting {
  padding: 1rem;
  background-color: var(--white);
  border-radius: 12px;
  border: 2px solid var(--success-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.reminder-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
}

.reminder-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--success-color);
  transition: all 0.3s ease;
}

.reminder-label:hover:not(:disabled) {
  color: var(--success-color);
}

.loading-text {
  font-size: 0.9rem;
  color: #718096;
  margin-left: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.reminder-delay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.delay-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.delay-inputs input {
  width: 100px;
  padding: 0.75rem;
  border-radius: 10px;
  border: 2px solid var(--success-color);
  background-color: var(--white);
  color: var(--text-color);
  font-size: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

.delay-inputs input:hover:not(:disabled) {
  border-color: #38a169;
  background-color: #f0fff4;
  box-shadow: 0 2px 4px rgba(72, 187, 120, 0.2);
}

.delay-inputs input:disabled {
  background-color: #edf2f7;
  cursor: not-allowed;
  opacity: 0.7;
}

.delay-inputs span {
  color: var(--text-color);
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
}

.status-box {
  padding: 1rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #f0fff4 0%, #e6fff4 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  transition: all 0.5s ease;
  flex-grow: 1;
}

.status-box.study {
  background: linear-gradient(135deg, var(--success-color) 0%, #7ed4a1 100%);
  color: var(--white);
  box-shadow: 0 6px 12px rgba(72, 187, 120, 0.3);
}

.status-box.break {
  background: linear-gradient(135deg, var(--primary-color) 0%, #74b3f0 100%);
  color: var(--white);
  box-shadow: 0 6px 12px rgba(66, 153, 225, 0.3);
}

h2 {
  color: inherit;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.timer {
  font-size: 3.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
  font-variant-numeric: tabular-nums;
  color: inherit;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 2px;
}

.controls {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

button {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  background-color: var(--success-color);
  color: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
}

button:hover {
  background-color: #38a169;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(56, 161, 105, 0.3);
}

button.active {
  background-color: var(--primary-color);
}

button.active:hover {
  background-color: #3182ce;
  box-shadow: 0 6px 12px rgba(49, 130, 206, 0.3);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

select {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: 2px solid var(--success-color);
  background-color: var(--white);
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}

select:hover:not(:disabled) {
  border-color: #38a169;
  background-color: #f0fff4;
  box-shadow: 0 2px 4px rgba(72, 187, 120, 0.2);
}

select:disabled {
  background-color: #edf2f7;
  cursor: not-allowed;
  opacity: 0.7;
}

label {
  color: var(--text-color);
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
}

.user-counter {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background-color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  font-family: 'Poppins', sans-serif;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.status-box.study,
.status-box.break {
  animation: pulse 2s infinite ease-in-out;
}

@media (max-width: 640px) {
  .main-container {
    padding: 1.5rem;
    min-height: 500px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .settings {
    padding: 1rem;
    gap: 0.75rem;
  }

  .setting-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-box {
    padding: 1.5rem;
    min-height: 120px;
  }

  h2 {
    font-size: 1.25rem;
  }

  .timer {
    font-size: 2.5rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .delay-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .delay-inputs input {
    width: 120px;
  }

  .loading-text {
    display: block;
    margin-left: 1.7rem;
  }
}
</style>
