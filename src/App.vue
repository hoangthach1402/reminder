<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { Howl } from 'howler';
import UserCounter from './components/UserCounter.vue';
import BreathingGuide from './components/BreathingGuide.vue';
import { TECHNIQUES } from './data/BreathingTechniques';
import Logo from './components/Logo.vue';
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
</script>

<template>
  <div class="container">
    <Logo />
    <!-- <div class="logo-box">
      <img src="./assets/logoMeditaiton.png" alt="Logo ứng dụng thiền và tư thế" class="logo" />
    </div> -->
    <h1>Thiền & Tư Thế Khi Làm Việc</h1>
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
    </div>

    <div
      class="status-box"
      :class="{ breathing: currentMode === 'breathing', posture: currentMode === 'posture' }"
      role="status"
      aria-live="polite"
    >
      {{ status }}
    </div>

    <div class="controls">
      <button @click="toggleSystem" :class="{ active: isActive }" :aria-pressed="isActive">
        {{ isActive ? 'Dừng Thiền' : 'Bắt Đầu' }}
      </button>
      <label>
        <input type="checkbox" v-model="enableCount" :disabled="!isActive" />
        Đếm số khi thở
      </label>
    </div>

    <div class="timer">
      🕒 Thời gian thiền: {{ Math.floor(elapsedTime / 60) }} phút {{ elapsedTime % 60 }} giây
    </div>

    <BreathingGuide :technique="breathingTechnique" />

    <UserCounter class="user-counter" />
  </div>
</template>

<style scoped>
.user-counter {
  position: fixed;
  bottom: 10px;
  right: 10px;
}
.container {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}
.status-box {
  padding: 1.5rem;
  margin: 1rem 0;
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all 0.3s;
}
.status-box.breathing {
  background: #e3f2fd;
  color: #0d47a1;
}
.status-box.posture {
  background: #fff8e1;
  color: #ff6f00;
}
button {
  padding: 0.8rem 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}
button.active {
  background: #f44336;
}
.breathing-guide {
  color: #818181;
  font-weight: bold;
  margin-top: 2rem;
  text-align: left;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
}
.breathing-guide span {
  font-weight: bold;
  color: #818181;
}
.breathing-guide .benefit {
  font-weight: normal;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: #666;
}
.timer {
  margin-bottom: 1rem;
  font-weight: bold;
  color: #3f51b5;
}
.controls {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}
.timer-select,
.breath-technique {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.timer-select label,
.breath-technique label {
  font-weight: bold;
  color: #818181;
}
.timer-select select,
.breath-technique select {
  padding: 0.4rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #fff;
  color: #818181;
  transition: border-color 0.3s;
}
.timer-select select:disabled,
.breath-technique select:disabled {
  background-color: #f0f0f0;
  color: #999;
  cursor: not-allowed;
  border-color: #ddd;
}
.logo-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo {
  color: #818181;
  background-color: #818181;
  border-radius: 50%;
  width: 80px;
  height: auto;
  filter: grayscale(100%);
  opacity: 0.8;
}
</style>