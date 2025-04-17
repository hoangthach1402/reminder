```vue
<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

// Lấy route hiện tại
const route = useRoute();

// Xác định hình ảnh logo dựa trên route
const logoSrc = route.path === '/study' ? '../assets/LogoStudy.png' : '.../assets/logoMeditation.png';
// console.log(logoSrc);
// Quản lý trạng thái màu nền
const backgroundColor = ref('default'); // Mặc định

// Các màu nền
const colors = {
  default: '#818181', // Màu nền mặc định của logo (xám)
  green: '#4caf50', // Xanh lá
  red: '#f44336' // Đỏ
};

// Hàm đổi màu nền khi nhấn vào logo
const changeBackgroundColor = () => {
  if (backgroundColor.value === 'default') {
    backgroundColor.value = 'green';
  } else if (backgroundColor.value === 'green') {
    backgroundColor.value = 'red';
  } else {
    backgroundColor.value = 'default';
  }
};

// Kết hợp cả hai hành động: đổi màu và emit sự kiện click
const handleClick = () => {
  changeBackgroundColor();
  // Emit sự kiện click để App.vue xử lý toggle mode
};
</script>

<template>
  <div class="logo-box" @click="handleClick">
    <span class="logo-text">De</span>
    <img
      src="../assets/LogoStudy.png"
      alt="Logo ứng dụng thiền và tư thế"
      class="logo"
      :style="{ backgroundColor: colors[backgroundColor] }"
    />
  </div>
</template>

<style scoped>
.logo-box {
  z-index: 1100;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  padding: 0.15rem 0.2rem;
  background: transparent;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.2s;
}

.logo-box:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.logo-text {
  display: none;
}

.logo {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  filter: grayscale(100%);
  opacity: 0.9;
  transition: background-color 0.2s, filter 0.2s, opacity 0.2s;
}

.logo-box:hover .logo {
  filter: grayscale(0%);
  opacity: 1;
}

@media (max-width: 640px) {
  .logo-box {
    padding: 0.1rem;
  }
  .logo {
    width: 30px;
    height: 30px;
  }
}
</style>