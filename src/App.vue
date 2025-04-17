```vue
<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import Logo from './components/Logo.vue';

const route = useRoute();
const router = useRouter();

// Xác định mode hiện tại dựa trên route
const currentMode = computed(() => (route.path === '/study' ? 'study' : 'meditation'));

// Trạng thái và nội dung của notification
const showNotification = ref(false);
const notificationMessage = ref('');

// Hàm toggle mode khi nhấn vào logo
const toggleMode = () => {
  if (currentMode.value === 'study') {
    router.push('/');
    notificationMessage.value = 'Chế độ: Thiền';
  } else {
    router.push('/study');
    notificationMessage.value = 'Chế độ: Học tập';
  }

  // Hiển thị notification và tự động ẩn sau 5 giây
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 5000);
};
</script>

<template>
  <div class="app" :class="currentMode">
    <!-- Logo ở góc trái -->
    <div class="logo-container">
      <Logo class="logo" @click="toggleMode" :class="{ clickable: true }" />
    </div>

    <!-- Notification -->
    <div class="notification" :class="{ visible: showNotification }">
      {{ notificationMessage }}
    </div>

    <!-- Nội dung chính -->
    <RouterView />
  </div>
</template>

<style>
body {
  margin: 0;
  min-height: 100vh;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  background: linear-gradient(135deg, #e6f0fa 0%, #f0f5ff 100%);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary-color: #4299e1;
  --success-color: #48bb78;
  --danger-color: #e53e3e;
  --text-color: #2d3748;
  --bg-color: #f7fafc;
  --white: #ffffff;
  --shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.app {
  min-height: 100vh;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
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
    top: 4.5rem;
    left: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>