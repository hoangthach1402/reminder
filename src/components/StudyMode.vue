```vue
<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue';
import UserCounter from './UserCounter.vue';
import { loadStudySounds } from '../utils/soundUtils';

const studyDuration = ref(25);
const breakDuration = ref(5);
const minReminderDelay = ref(60); // Thời gian tối thiểu (giây)
const maxReminderDelay = ref(180); // Thời gian tối đa (giây)
const isStudying = ref(false);
const timeLeft = ref(0);
const currentMode = ref('study');
const enableReminders = ref(true);
const reminderSounds = ref([]);
const isLoadingSounds = ref(true);
const currentSoundIndex = ref(0);
const shuffledSounds = ref([]);
const isReminderModalOpen = ref(false);

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

const openReminderModal = () => {
  if (enableReminders.value && !isStudying.value) {
    isReminderModalOpen.value = true;
  }
};

const closeReminderModal = () => {
  if (!isStudying.value) {
    isReminderModalOpen.value = false;
  }
};

const handleReminderToggle = () => {
  if (enableReminders.value) {
    openReminderModal();
  }
};
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
              @change="handleReminderToggle"
            />
            🔔 Bật nhắc nhở tập trung
            <span v-if="isLoadingSounds" class="loading-text">
              (Đang tải âm thanh...)
            </span>
          </label>
        </div>
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

      <UserCounter class="user-counter" />
    </div>

    <!-- Modal cài đặt nhắc nhở -->
    <Teleport to="body">
      <div v-if="isReminderModalOpen" class="modal-overlay" @click="closeReminderModal">
        <div class="modal-content" @click.stop>
          <button class="close-button" @click="closeReminderModal">&times;</button>
          <h2>Cài đặt nhắc nhở tập trung</h2>
          
          <div class="reminder-settings-container">
            <div class="reminder-explanation">
              <div class="info-icon">ℹ️</div>
              <p>Tính năng này sẽ phát âm thanh nhắc nhở trong quá trình học tập để giúp bạn duy trì tập trung và tư thế đúng.</p>
            </div>
            
            <div class="reminder-delay">
              <label>Thời gian giữa các lần nhắc nhở:</label>
              <div class="delay-inputs">
                <div class="input-group">
                  <span class="input-label">Tối thiểu</span>
                  <input
                    type="number"
                    v-model.number="minReminderDelay"
                    min="30"
                    max="600"
                    :disabled="isStudying || isLoadingSounds"
                    placeholder="Tối thiểu"
                  />
                  <span class="input-unit">giây</span>
                </div>
                
                <div class="input-separator">đến</div>
                
                <div class="input-group">
                  <span class="input-label">Tối đa</span>
                  <input
                    type="number"
                    v-model.number="maxReminderDelay"
                    min="30"
                    max="600"
                    :disabled="isStudying || isLoadingSounds"
                    placeholder="Tối đa"
                  />
                  <span class="input-unit">giây</span>
                </div>
              </div>
            </div>
            
            <div class="reminder-actions">
              <button class="save-button" @click="closeReminderModal">Lưu cài đặt</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
:root {
  --primary-yellow: #ffd700;
  --soft-yellow: #f4d03f;
  --dark-yellow: #d4ac0d;
  --light-gray: #a0a0a0;
  --medium-gray: #4a4a4a;
  --dark-gray: #2c2c2c;
  --darker-gray: #1a1a1a;
  --text-yellow: #ffd95a;
}

.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 1rem;
  padding-top: 6rem; /* Đảm bảo không bị che bởi logo và notification */
  background-color: var(--darker-gray);
}

.main-container {
  background-color: var(--dark-gray);
  padding: 2rem;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 600px;
}

h1 {
  color: var(--text-yellow);
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
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
  background-color: var(--medium-gray);
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0;
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
  background-color: var(--medium-gray);
  border-radius: 12px;
  border: 2px solid var(--soft-yellow);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.reminder-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-yellow);
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
}

.reminder-label input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--soft-yellow);
  transition: all 0.3s ease;
}

.reminder-label:hover:not(:disabled) {
  color: var(--soft-yellow);
}

.loading-text {
  font-size: 0.9rem;
  color: var(--light-gray);
  margin-left: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.reminder-delay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
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
  border: 2px solid var(--soft-yellow);
  background-color: var(--dark-gray);
  color: var(--text-yellow);
  font-size: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

.delay-inputs input:hover:not(:disabled) {
  border-color: var(--primary-yellow);
  background-color: var(--medium-gray);
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.2);
}

.delay-inputs input:disabled {
  background-color: var(--medium-gray);
  cursor: not-allowed;
  opacity: 0.7;
}

.delay-inputs span {
  color: var(--text-yellow);
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
}

.status-box {
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--medium-gray) 0%, var(--dark-gray) 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  transition: all 0.5s ease;
  flex: 1;
  margin: 1rem 0;
  color: var(--text-yellow);
}

.status-box.study {
  background: linear-gradient(135deg, var(--dark-yellow) 0%, var(--medium-gray) 100%);
}

.status-box.break {
  background: linear-gradient(135deg, var(--medium-gray) 0%, var(--dark-gray) 100%);
}

h2 {
  color: var(--text-yellow);
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.timer {
  font-size: 2.75rem;
  font-weight: bold;
  margin: 0.5rem 0;
  font-variant-numeric: tabular-nums;
  color: var(--primary-yellow);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Poppins', sans-serif;
  letter-spacing: 2px;
}

.controls {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-shrink: 0;
}

button {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  background-color: var(--soft-yellow);
  color: var(--darker-gray);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

button:hover:not(:disabled) {
  background-color: var(--primary-yellow);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

button.active {
  background-color: var(--dark-yellow);
  color: var(--darker-gray);
}

button.active:hover:not(:disabled) {
  background-color: var(--soft-yellow);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: var(--light-gray);
}

select {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: 2px solid var(--soft-yellow);
  background-color: var(--dark-gray);
  color: var(--text-yellow);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}

select:hover:not(:disabled) {
  border-color: var(--primary-yellow);
  background-color: var(--medium-gray);
}

select:disabled {
  background-color: var(--medium-gray);
  border-color: var(--light-gray);
  color: var(--light-gray);
  cursor: not-allowed;
  opacity: 0.7;
}

label {
  color: var(--text-yellow);
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
}

.user-counter {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background-color: var(--dark-gray);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-yellow);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: none;
}

.modal-content {
  background-color: #222;
  padding: 2rem;
  border-radius: 16px;
  max-width: 90%;
  width: 550px;
  position: relative;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  border: 2px solid var(--soft-yellow);
}

.modal-content h2 {
  color: var(--primary-yellow);
  margin-bottom: 1.5rem;
  padding-right: 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  border-bottom: 2px solid var(--primary-yellow);
  padding-bottom: 0.75rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.reminder-settings-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reminder-explanation {
  background-color: #333;
  border-left: 4px solid var(--primary-yellow);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.info-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.reminder-explanation p {
  color: #fff;
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
}

.reminder-delay {
  background-color: #333;
  padding: 1.75rem;
  border-radius: 12px;
  border: 2px solid var(--primary-yellow);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.reminder-delay label {
  display: block;
  color: var(--primary-yellow);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.delay-inputs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.input-label {
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
}

.input-unit {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.input-separator {
  color: var(--primary-yellow);
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 0.5rem;
  align-self: center;
  margin-top: 1.5rem;
}

.delay-inputs input {
  background-color: #191919;
  border: 3px solid var(--primary-yellow);
  color: white;
  padding: 0.9rem 0.75rem;
  border-radius: 10px;
  width: 100%;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.delay-inputs input:focus {
  outline: none;
  border-color: #fff;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.4);
}

.delay-inputs input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  border-color: #666;
}

.reminder-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.save-button {
  background-color: var(--primary-yellow);
  color: var(--darker-gray);
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.save-button:hover {
  background-color: #ffea00;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  color: #000000;
  font-weight: 800;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-yellow);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  transition: all 0.3s ease;
  background-color: var(--medium-gray);
}

.close-button:hover {
  background-color: var(--soft-yellow);
  color: var(--darker-gray);
}

@media (max-width: 640px) {
  .page-wrapper {
    padding-top: 5rem; /* Đảm bảo không bị che bởi logo và notification */
    padding: 0.5rem;
  }

  .main-container {
    padding: 1rem;
    border-radius: 16px;
    min-height: 500px;
  }

  h1 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .settings {
    padding: 1rem;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .setting-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .reminder-setting {
    padding: 0.75rem;
  }

  .reminder-label {
    font-size: 0.9rem;
  }

  .reminder-label input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
  }

  .loading-text {
    font-size: 0.8rem;
    margin-left: 0;
    margin-top: 0.25rem;
  }

  .reminder-delay {
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .delay-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .delay-inputs input {
    width: 100%;
    max-width: 150px;
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .delay-inputs span {
    font-size: 0.9rem;
  }

  select {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
  }

  label {
    font-size: 0.9rem;
  }

  .status-box {
    padding: 1rem;
    min-height: 120px;
    flex: 1;
    margin: 0.75rem 0;
  }

  h2 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .timer {
    font-size: 2.25rem;
    letter-spacing: 1px;
  }

  .controls {
    margin: 0.75rem 0;
  }

  button {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }

  .user-counter {
    bottom: 1rem;
    right: 1rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .modal-content h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .reminder-settings-container {
    gap: 1rem;
  }

  .reminder-explanation {
    padding: 0.75rem;
  }

  .reminder-delay {
    padding: 1rem;
  }

  .delay-inputs {
    flex-direction: column;
    gap: 1rem;
  }

  .input-group {
    width: 100%;
  }

  .input-separator {
    margin: 0;
  }

  .delay-inputs input {
    font-size: 1rem;
    padding: 0.6rem;
  }

  .save-button {
    width: 100%;
    padding: 0.75rem;
  }

  .close-button {
    top: 0.75rem;
    right: 0.75rem;
    font-size: 1.25rem;
  }
}
</style>
```