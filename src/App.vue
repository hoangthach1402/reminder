<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Howl } from 'howler';
import UserCounter from './components/UserCounter.vue';

// Cấu hình
const BREATH_CYCLE = { IN: 4, HOLD: 7, OUT: 8 };
const POSTURE_REMINDER_INTERVAL = 3 * 60 * 1000;

// Âm thanh
const sounds = {
  breatheIn: new Howl({ src: ['/sounds/breathe-in.mp3'] }),
  breatheOut: new Howl({ src: ['/sounds/breathe-out.mp3'] }),
  hold: new Howl({ src: ['/sounds/hold-breath.mp3'] }),
  postureAlert: new Howl({ src: ['/sounds/posture-alert.mp3'] }),
  count: Array.from({ length: 8 }, (_, i) => new Howl({ src: [`/sounds/${i + 1}.mp3`] }))
};

// State
const isActive = ref(false);
const status = ref('Nhấn "Bắt đầu" để thiền');
const currentMode = ref(null); // 'breathing' | 'posture'
const enableCount = ref(false);
const elapsedTime = ref(0);
const phaseTimeLeft = ref(0);

let breathInterval, postureInterval, timerInterval;
let countTimeouts = [];
let phaseInterval;

const useTimer = ref(false); // checkbox: có hẹn giờ hay không
const meditationDuration = ref(10); // thời lượng hẹn giờ (phút)
let timeoutStop; // timeout để dừng sau thời gian hẹn giờ
const selectedDuration = ref(0); // phút, 0 là không hẹn giờ
let stopAfterTimeout = null;
// Hàm đếm số (1 -> n)
const playCountSound = (n) => {
  if (!isActive.value || !enableCount.value) return;
  for (let i = 0; i < n; i++) {
    const timeout = setTimeout(() => {
      if (isActive.value && enableCount.value) {
        sounds.count[i]?.play?.();
      }
    }, i * 1000);
    countTimeouts.push(timeout);
  }
};

const clearAllCountTimeouts = () => {
  countTimeouts.forEach(clearTimeout);
  countTimeouts = [];
};

const clearPhaseInterval = () => {
  clearInterval(phaseInterval);
};

// Cập nhật status theo từng giây
const startPhase = (label, duration, sound, nextPhase) => {
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

// Bắt đầu chu kỳ hít thở
const startBreathingCycle = () => {
  if (!isActive.value) return;
  currentMode.value = 'breathing';

  startPhase('Hít vào', BREATH_CYCLE.IN, sounds.breatheIn, () => {
    startPhase('Giữ hơi', BREATH_CYCLE.HOLD, sounds.hold, () => {
      startPhase('Thở ra', BREATH_CYCLE.OUT, sounds.breatheOut);
    });
  });
};

// Nhắc tư thế
const triggerPostureReminder = () => {
  if (!isActive.value) return;
  currentMode.value = 'posture';
  clearPhaseInterval();
  status.value = '🪑 Ngồi thẳng lưng!';
  sounds.postureAlert?.play?.();

  setTimeout(() => startBreathingCycle(), 3000);
};

// Đếm thời gian thiền
const startTimer = () => {
  timerInterval = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
};

// Bật/tắt hệ thống
const toggleSystem = () => {
  isActive.value = !isActive.value;

  if (isActive.value) {
    elapsedTime.value = 0;
    startBreathingCycle();
    startTimer();

    breathInterval = setInterval(
      startBreathingCycle,
      (BREATH_CYCLE.IN + BREATH_CYCLE.HOLD + BREATH_CYCLE.OUT) * 1000
    );
    postureInterval = setInterval(triggerPostureReminder, POSTURE_REMINDER_INTERVAL);

    if (useTimer.value) {
      timeoutStop = setTimeout(() => {
        toggleSystem(); // tự dừng
      }, meditationDuration.value * 60 * 1000); // đổi phút sang ms
    }
    if (selectedDuration.value > 0) {
    stopAfterTimeout = setTimeout(() => {
      isActive.value = false;
      clearInterval(breathInterval);
      clearInterval(postureInterval);
      stopTimer();
      clearPhaseInterval();
      clearAllCountTimeouts();
      status.value = '⏰ Đã hết thời gian thiền';
    }, selectedDuration.value * 60 * 1000);
  }
  } else {
    clearInterval(breathInterval);
    clearInterval(postureInterval);
    stopTimer();
    clearPhaseInterval();
    clearAllCountTimeouts();
    clearTimeout(timeoutStop); // nếu người dùng dừng thủ công trước khi timeout
    status.value = 'Đã dừng';
  }
};
// Cleanup
onBeforeUnmount(() => {
  clearInterval(breathInterval);
  clearInterval(postureInterval);
  stopTimer();
  clearPhaseInterval();
  clearAllCountTimeouts();
});
</script>

<template>
  <div class="container">
    <h1>🧘‍♀️ Thiền & Tư Thế Khi Làm Việc</h1>
    <div class="timer-select">
  <label>⏱ Hẹn giờ:</label>
  <select v-model="selectedDuration" :disabled="isActive">
    <option :value="0">Không hẹn giờ</option>
    <option :value="5">5 phút</option>
    <option :value="10">10 phút</option>
    <option :value="15">15 phút</option>
    <option :value="20">20 phút</option>
  </select>
</div>


    <div class="status-box" :class="{ breathing: currentMode === 'breathing', posture: currentMode === 'posture' }">
      {{ status }}
    </div>

    <div class="controls">
      <button @click="toggleSystem" :class="{ active: isActive }">
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

    <div class="breath-guide">
      <p>Kỹ thuật 4-7-8:</p>
      <ul>
        <li>Hít vào <span>4 giây</span></li>
        <li>Giữ hơi <span>7 giây</span></li>
        <li>Thở ra <span>8 giây</span></li>
      </ul>
    </div>

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
.breath-guide {
  color: #818181;
  font-weight: bold;
  margin-top: 2rem;
  text-align: left;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
}
.breath-guide span {
  font-weight: bold;
  color: #818181;
}
.meditation-time {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #555;
}
.checkbox {
  margin-top: 1rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.controls {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}
.timer {
  margin-bottom: 1rem;
  font-weight: bold;
  color: #3f51b5;
}
.checkbox input[type='number'] {
  padding: 0.3rem;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.timer-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  font-size: 1rem;
}

.timer-select label {
  font-weight: bold;
  color: #818181;
}

.timer-select select {
  padding: 0.4rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #fff;
  color: #818181;
  transition: border-color 0.3s;
}

.timer-select select:disabled {
  background-color: #f0f0f0;
  color: #999;
  cursor: not-allowed;
  border-color: #ddd;
}

</style>
