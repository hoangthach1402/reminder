```vue
<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import Logo from './components/Logo.vue';
import CustomNotification from './components/CustomNotification.vue';

const route = useRoute();
const router = useRouter();

// Xác định mode hiện tại dựa trên route
const currentMode = computed(() => (route.path === '/study' ? 'study' : 'meditation'));

// Trạng thái và nội dung của notification mới
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info'); // info, success, warning, error
const notificationIcon = ref('ℹ️');

// Hàm toggle mode khi nhấn vào logo
const toggleMode = () => {
  if (currentMode.value === 'study') {
    router.push('/');
    notificationMessage.value = 'Chế độ: Thiền ';
    notificationType.value = 'success';
    notificationIcon.value = '🧘';
  } else {
    router.push('/study');
    notificationMessage.value = 'Chế độ: Học tập';
    notificationType.value = 'info';
    notificationIcon.value = '📚';
  }
  showNotification.value = true;
};
</script>

<template>
  <div class="app" :class="currentMode">
    <!-- Logo ở góc trái -->
    <div class="logo-container">
      <Logo class="logo" @click="toggleMode" :class="{ clickable: true }" />
    </div>



    <!-- Nội dung chính -->
    <CustomNotification
      v-if="showNotification"
      :message="notificationMessage"
      :type="notificationType"
      :icon="notificationIcon"
      :duration="3500"
      closable
      @close="showNotification = false"
    />
    <RouterView />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  transition: background 0.3s;
  position: relative;
}

.logo-container {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  margin-bottom: 0;
  display: flex;
  align-items: flex-start;
}

.logo {
  width: 48px;
  height: 48px;
  cursor: pointer;
  border-radius: 50%;
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.logo.clickable:hover {
  box-shadow: 0 4px 16px rgba(66,153,225,0.15);
  transform: scale(1.07);
}

.notification {
  padding: 0.75rem 1.5rem;
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color, #4299e1);
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  opacity: 0;
  z-index: 1000;
  pointer-events: none;
  transition: opacity 0.3s, top 0.3s;
  font-size: 1rem;
  font-weight: 500;
}
.notification.visible {
  opacity: 1;
  top: 2.5rem;
  pointer-events: auto;
}

@media (max-width: 640px) {
  .notification {
    top: 1rem;
    right: 0.5rem;
    min-width: 120px;
    max-width: 98vw;
    padding: 0.5rem 0.8rem;
    font-size: 0.95rem;
    border-radius: 10px 0 10px 10px;
  }
}

@media (max-width: 640px) {
  .app {
    padding: 0.5rem 0.1rem;
  }
  .logo {
    width: 36px;
    height: 36px;
  }
  .notification {
    font-size: 0.95rem;
    padding: 0.5rem 1rem;
  }
}



.app.meditation {
  background: linear-gradient(135deg, #e6f0fa 0%, #f0f5ff 100%);
  color: #1a365d;
}

.app.study {
  background: linear-gradient(135deg, #e6fff4 0%, #f0fff4 100%);
  color: #1c4532;
}

.logo-container {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 1000;
}

.logo {
  height: 48px;
}

.logo.clickable {
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.logo.clickable:hover {
  transform: scale(1.15);
  filter: brightness(1.1);
}

/* Notification */
.notification {
  position: fixed;
  top: 5.5rem; /* Đặt dưới logo */
  left: 1.5rem;
  background-color: var(--white);
  color: var(--text-color);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  font-size: 1rem;
  font-weight: 500;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 1000;
}

.notification.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .logo-container {
    top: 1rem;
    left: 1rem;
  }

  .logo {
    height: 40px;
  }

  .notification {
    top: 1.5rem;
    right: 1.5rem;
    left: auto;
    transform: none;
    position: fixed;
    min-width: 180px;
    max-width: 80vw;
    padding: 0.7rem 1.3rem;
    font-size: 1rem;
    border-radius: 12px 0 12px 12px;
    background: linear-gradient(135deg, #b2f5ea 0%, #81e6d9 100%);
    color: #234e52;
    box-shadow: 0 2px 16px rgba(0,0,0,0.10);
    z-index: 2000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s, top 0.3s;
    font-weight: 500;
  }
}

    </style>