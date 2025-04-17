```vue
<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { Howl } from 'howler';
import UserCounter from './UserCounter.vue';
import BreathingGuide from './BreathingGuide.vue';
import { TECHNIQUES } from '../data/BreathingTechniques';
import Logo from './Logo.vue';

// Configuration
const POSTURE_REMINDER_INTERVAL = 3 * 60 * 1000;

// Audio
const sounds = {
  breatheIn: new Howl({ src: ['/sounds/breathe-in.mp3'] }),
  breatheOut: new Howl({ src: ['/sounds/breathe-out.mp3'] }),
  hold: new Howl({ src: ['/sounds/hold-breath.mp3'] }),
  postureAlert: new Howl({ src: ['/sounds/posture-alert.mp3'] }),
  count: Array.from({ length: 8 }, (_, i) => new Howl({ src: [`/sounds/${i + 1}.mp3`] })),
};

// State
const isActive = ref(false);
const status = ref('Nhấn "Bắt đầu" để thiền');
const currentMode = ref(null);
const enableCount = ref(false);
const elapsedTime = ref(0);
const phaseTimeLeft = ref(0);
const breathingTechnique = ref(TECHNIQUES.DEFAULT);
const selectedDuration = ref(0);

let breathInterval, postureInterval, timerInterval;
let countTimeouts = [];
let phaseInterval;
let stopAfterTimeout = null;

// State cho modal
const isModalOpen = ref(false);

// Utility Functions
const playCountSound = (duration) => {
  if (!enableCount.value) return;
  for (let i = 1; i <= duration; i++) {
    countTimeouts.push(
      setTimeout(() => {
        sounds.count[i - 1]?.play?.();
      }, (duration - i) * 1000)
    );
  }
};

const clearAllCountTimeouts = () => {
  countTimeouts.forEach((timeout) => clearTimeout(timeout));
  countTimeouts = [];
};

const clearPhaseInterval = () => {
  if (phaseInterval) {
    clearInterval(phaseInterval);
    phaseInterval = null;
  }
};

// Breathing Logic
const startPhase = (label, duration, soundKey, nextPhase) => {
  const sound = sounds[soundKey];
  phaseTimeLeft.value = duration;
  sound?.play?.();
  playCountSound(duration);

  clearPhaseInterval();
  status.value = `${label}... ${phaseTimeLeft.value}s`;

  phaseInterval = setInterval(() => {
    phaseTimeLeft.value--;
    if (phaseTimeLeft.value <= 0) {
      clearPhaseInterval();
      nextPhase?.();
    } else {
      status.value = `${label}... ${phaseTimeLeft.value}s`;
    }
  }, 1000);
};

const startBreathingCycle = () => {
  if (!isActive.value) return;
  currentMode.value = 'breathing';

  const steps = breathingTechnique.value.steps;
  let currentStep = 0;

  const executeStep = () => {
    if (currentStep >= steps.length) {
      if (isActive.value) startBreathingCycle(); // Loop if still active
      return;
    }

    const step = steps[currentStep];
    startPhase(
      step.action,
      step.duration,
      step.sound,
      () => {
        currentStep++;
        executeStep();
      }
    );
  };

  executeStep();
};

const handleBreathingChange = () => {
  if (isActive.value) {
    clearPhaseInterval();
    clearAllCountTimeouts();
    startBreathingCycle();
  }
};

// Timer Logic
const startTimer = () => {
  timerInterval = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Posture Reminder
const triggerPostureReminder = () => {
  currentMode.value = 'posture';
  status.value = 'Hãy kiểm tra tư thế của bạn!';
  sounds.postureAlert?.play?.();
  setTimeout(() => {
    if (isActive.value && currentMode.value === 'posture') {
      currentMode.value = 'breathing';
      startBreathingCycle();
    }
  }, 5000); // Show posture alert for 5 seconds
};

// Main Control
const toggleSystem = () => {
  if (isActive.value) {
    // Stop meditation
    isActive.value = false;
    currentMode.value = null;
    status.value = 'Nhấn "Bắt đầu" để thiền';
    elapsedTime.value = 0;
    clearPhaseInterval();
    clearAllCountTimeouts();
    clearInterval(postureInterval);
    stopTimer();
    if (stopAfterTimeout) {
      clearTimeout(stopAfterTimeout);
      stopAfterTimeout = null;
    }
    Object.values(sounds).forEach((sound) => sound.stop?.());
    if (Array.isArray(sounds.count)) {
      sounds.count.forEach((sound) => sound.stop?.());
    }
  } else {
    // Start meditation
    isActive.value = true;
    elapsedTime.value = 0;
    startTimer();
    startBreathingCycle();
    postureInterval = setInterval(triggerPostureReminder, POSTURE_REMINDER_INTERVAL);

    if (selectedDuration.value > 0) {
      stopAfterTimeout = setTimeout(() => {
        toggleSystem(); // Auto-stop after selected duration
      }, selectedDuration.value * 60 * 1000);
    }
  }
};

// Cleanup
onBeforeUnmount(() => {
  clearInterval(breathInterval);
  clearInterval(postureInterval);
  stopTimer();
  clearPhaseInterval();
  clearAllCountTimeouts();
  if (stopAfterTimeout) {
    clearTimeout(stopAfterTimeout);
  }
  Object.values(sounds).forEach((sound) => sound.unload?.());
  if (Array.isArray(sounds.count)) {
    sounds.count.forEach((sound) => sound.unload?.());
  }
});

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// Đóng modal khi click bên ngoài
const handleClickOutside = (event) => {
  const modal = document.querySelector('.modal-content');
  if (modal && !modal.contains(event.target)) {
    closeModal();
  }
};
</script>

<template>
  <div class="page-wrapper">
    <div class="main-container">
      <h1>Thiền & Tư Thế Khi Làm Việc</h1>

      <div class="settings">
        <div class="timer-select">
          <label for="timer-select">⏱ Hẹn giờ:</label>
          <select id="timer-select" v-model="selectedDuration" :disabled="isActive">
            <option :value="0">Không hẹn giờ</option>
            <option :value="5">5 phút</option>
            <option :value="10">10 phút</option>
            <option :value="15">15 phút</option>
            <option :value="20">20 phút</option>
          </select>
        </div>

        <div class="breath-technique">
          <label for="breath-technique">Kỹ thuật thở:</label>
          <select
            id="breath-technique"
            v-model="breathingTechnique"
            :disabled="isActive"
            @change="handleBreathingChange"
          >
            <option v-for="tech in Object.values(TECHNIQUES)" :key="tech.id" :value="tech">
              {{ tech.name }}
            </option>
          </select>
          <button class="guide-button" @click="openModal" title="Xem hướng dẫn">
            <span>ℹ️</span>
          </button>
        </div>

        <label class="count-setting">
          <input type="checkbox" v-model="enableCount" :disabled="!isActive" />
          Đếm số khi thở
        </label>
      </div>

      <div class="controls">
        <button @click="toggleSystem" :class="{ active: isActive }" :aria-pressed="isActive">
          {{ isActive ? 'Dừng Thiền' : 'Bắt Đầu' }}
        </button>
      </div>

      <div class="status-box" :class="{ breathing: currentMode === 'breathing', posture: currentMode === 'posture' }">
        {{ status }}
      </div>

      <div class="timer">
        🕒 Thời gian thiền: {{ Math.floor(elapsedTime / 60) }} phút {{ elapsedTime % 60 }} giây
      </div>

      <UserCounter class="user-counter" />
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click="handleClickOutside">
        <div class="modal-content">
          <button class="close-button" @click="closeModal">&times;</button>
          <h2>Hướng dẫn kỹ thuật thở</h2>
          <BreathingGuide :technique="breathingTechnique" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 1rem;
  padding-top: 6rem; /* Đảm bảo không bị che bởi logo và notification */
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
}

h1 {
  color: var(--text-color);
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timer-select,
.breath-technique,
.count-setting {
  flex-wrap: wrap;
}

.status-box {
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f0fa 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  transition: all 0.5s ease;
}

.status-box.breathing {
  background: linear-gradient(135deg, var(--primary-color) 0%, #74b3f0 100%);
  color: var(--white);
  box-shadow: 0 6px 12px rgba(66, 153, 225, 0.3);
}

.status-box.posture {
  background: linear-gradient(135deg, var(--success-color) 0%, #7ed4a1 100%);
  color: var(--white);
  box-shadow: 0 6px 12px rgba(72, 187, 120, 0.3);
}

.status-text {
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;
}

button {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  background-color: #48bb78;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover:not(:disabled) {
  background-color: #38a169;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

button.active {
  background-color: #4299e1;
}

button.active:hover:not(:disabled) {
  background-color: #3182ce;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.timer {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
  text-align: center;
  background-color: var(--bg-color);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

select {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: 2px solid var(--primary-color);
  background-color: var(--white);
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

select:hover:not(:disabled) {
  border-color: #3182ce;
  background-color: #e6f0fa;
  box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2);
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
}

input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  cursor: pointer;
  accent-color: var(--primary-color);
  transition: all 0.3s ease;
}

input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.count-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controls {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-shrink: 0;
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
}

.guide-button {
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 2px solid #4299e1;
  color: #4299e1;
  font-size: 1rem;
}

.guide-button:hover {
  background-color: #4299e1;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content {
  background-color: var(--white);
  padding: 2rem;
  border-radius: 24px;
  max-width: 90%;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: var(--shadow);
  animation: slideIn 0.3s ease-in-out;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #718096;
  padding: 0.5rem;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background-color: var(--bg-color);
  color: var(--primary-color);
  transform: rotate(90deg);
}

.modal-content h2 {
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-right: 2.5rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .page-wrapper {
    padding-top: 5rem; /* Đảm bảo không bị che bởi logo và notification */
    padding: 0.5rem;
  }

  .main-container {
    padding: 1rem;
    border-radius: 16px;
  }

  h1 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }

  .settings {
    gap: 0.75rem;
  }

  .setting-group {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .timer-select,
  .breath-technique,
  .count-setting {
    padding: 0.5rem;
  }

  select {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    width: 100%; /* Đảm bảo select chiếm toàn bộ chiều rộng */
    max-width: 200px;
  }

  label {
    font-size: 0.9rem;
  }

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
  }

  .status-box {
    padding: 1rem;
    min-height: 100px;
  }

  .status-text {
    font-size: 1.1rem;
  }

  .controls {
    margin: 0.75rem 0;
  }

  button {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }

  .guide-button {
    padding: 0.4rem;
    width: 1.8rem;
    height: 1.8rem;
    font-size: 0.9rem;
  }

  .timer {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .user-counter {
    bottom: 1rem;
    right: 1rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .modal-content {
    width: 95%;
    padding: 1rem;
    border-radius: 16px;
  }

  .modal-content h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .close-button {
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1.5rem;
    width: 2rem;
    height: 2rem;
  }
}
</style>