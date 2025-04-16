<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Howl } from 'howler';

// Cấu hình
const BREATH_CYCLE = { IN: 4, HOLD: 7, OUT: 8 };
const POSTURE_REMINDER_INTERVAL = 3 * 60 * 1000;

// Âm thanh
const sounds = {
  breatheIn: new Howl({ src: ['/sounds/breathe-in.mp3'] }),
  breatheOut: new Howl({ src: ['/sounds/breathe-out.mp3'] }),
  hold: new Howl({ src: ['/sounds/hold-breath.mp3'] }),
  postureAlert: new Howl({ src: ['/sounds/posture-alert.mp3'] }),
  count: Array.from({ length: 8 }, (_, i) =>
    new Howl({ src: [`/sounds/${i + 1}.mp3`] })
  )
};

// State
const isActive = ref(false);
const status = ref('Nhấn "Bắt đầu" để thiền');
const currentMode = ref(null); // 'breathing' | 'posture'
const enableCount = ref(true);
const elapsedTime = ref(0);
let breathInterval, postureInterval, timerInterval;
let countTimeouts = [];

// Hàm đếm số (1 -> n)
const playCountSound = (n) => {
  if (!isActive.value || !enableCount.value) return;
  for (let i = 0; i < n; i++) {
    const timeout = setTimeout(() => {
      if (isActive.value && enableCount.value) {
        sounds.count[i].play();
      }
    }, i * 1000);
    countTimeouts.push(timeout);
  }
};

// Hủy toàn bộ timeout đếm
const clearAllCountTimeouts = () => {
  countTimeouts.forEach(clearTimeout);
  countTimeouts = [];
};

// Chu kỳ hít thở
const startBreathingCycle = () => {
  if (!isActive.value) return;
  currentMode.value = 'breathing';

  // Hít vào
  status.value = `Hít vào... ${BREATH_CYCLE.IN}s`;
  sounds.breatheIn.play();
  playCountSound(BREATH_CYCLE.IN);

  setTimeout(() => {
    if (!isActive.value) return;

    // Giữ hơi
    status.value = `Giữ hơi... ${BREATH_CYCLE.HOLD}s`;
    sounds.hold.play();
    playCountSound(BREATH_CYCLE.HOLD);

    setTimeout(() => {
      if (!isActive.value) return;

      // Thở ra
      status.value = `Thở ra... ${BREATH_CYCLE.OUT}s`;
      sounds.breatheOut.play();
      playCountSound(BREATH_CYCLE.OUT);
    }, BREATH_CYCLE.HOLD * 1000);
  }, BREATH_CYCLE.IN * 1000);
};

// Nhắc tư thế
const triggerPostureReminder = () => {
  if (!isActive.value) return;
  currentMode.value = 'posture';
  status.value = "🪑 Ngồi thẳng lưng!";
  sounds.postureAlert.play();

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

// Bật/tắt
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
  } else {
    clearInterval(breathInterval);
    clearInterval(postureInterval);
    stopTimer();
    clearAllCountTimeouts();
    status.value = "Đã dừng";
  }
};

// Cleanup
onBeforeUnmount(() => {
  clearInterval(breathInterval);
  clearInterval(postureInterval);
  stopTimer();
  clearAllCountTimeouts();
});
</script>


<template>
  <div class="container">
    <h1>🧘‍♀️ Thiền & Tư Thế</h1>

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

    <div class="timer">🕒 Thời gian thiền: {{ Math.floor(elapsedTime / 60) }} phút {{ elapsedTime % 60 }} giây</div>

    <div class="breath-guide">
      <p>Kỹ thuật 4-7-8:</p>
      <ul>
        <li>Hít vào <span>4 giây</span></li>
        <li>Giữ hơi <span>7 giây</span></li>
        <li>Thở ra <span>8 giây</span></li>
      </ul>
    </div>
  </div>
</template>


<style scoped>
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
  background: #4CAF50;
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
  color: rgb(21, 209, 33);
  font-weight: bold;
  margin-top: 2rem;
  text-align: left;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
}

.breath-guide span {
  font-weight: bold;
  color: #2e7d32;
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

</style>