<template>
  <transition name="fade">
    <div v-if="visible" class="custom-notification" :class="type">
      <span v-if="icon" class="notif-icon">{{ icon }}</span>
      <span class="notif-message">{{ message }}</span>
      <button v-if="closable" class="notif-close" @click="close">×</button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
const props = defineProps({
  message: String,
  type: { type: String, default: 'info' }, // info, success, warning, error
  duration: { type: Number, default: 3500 },
  icon: String,
  closable: { type: Boolean, default: false }
});
const emit = defineEmits(['close']);
const visible = ref(true);
let timer = null;

const close = () => {
  visible.value = false;
  emit('close');
};

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration);
  }
});

watch(() => props.message, (msg) => {
  if (msg) {
    visible.value = true;
    if (timer) clearTimeout(timer);
    if (props.duration > 0) {
      timer = setTimeout(close, props.duration);
    }
  }
});
</script>

<style scoped>
.custom-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  min-width: 220px;
  max-width: 85vw;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  background: linear-gradient(120deg, #e0e7ff 0%, #f0fff4 100%);
  color: #1a365d;
  font-size: 1.08rem;
  font-weight: 500;
  box-shadow: 0 4px 24px rgba(44,62,80,0.13);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  z-index: 3000;
  animation: slideIn 0.4s cubic-bezier(.4,2,.6,1.1);
}
.custom-notification.success {
  background: linear-gradient(120deg, #c6f6d5 0%, #f0fff4 100%);
  color: #22543d;
}
.custom-notification.warning {
  background: linear-gradient(120deg, #fefcbf 0%, #f0fff4 100%);
  color: #744210;
}
.custom-notification.error {
  background: linear-gradient(120deg, #fed7d7 0%, #fff5f5 100%);
  color: #9b2c2c;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.notif-icon {
  font-size: 1.4em;
  margin-right: 0.2em;
  opacity: 0.85;
}
.notif-close {
  background: none;
  border: none;
  font-size: 1.2em;
  margin-left: 0.5em;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.notif-close:hover {
  opacity: 1;
}
</style>
