<script setup>
import { ref } from 'vue';

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
</script>

<template>
  <div class="logo-box">
    <span class="logo-text">M</span>
    <img
      src="../assets/logoMeditaiton.png"
      alt="Logo ứng dụng thiền và tư thế"
      class="logo"
      @click="changeBackgroundColor"
      :style="{ backgroundColor: colors[backgroundColor] }"
    />
    <span class="logo-text">De</span>
  </div>
</template>

<style scoped>
.logo-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-text {
  font-size: 2rem;
  font-weight: bold;
  color: #818181;
}

.logo {
  border-radius: 50%;
  width: 40px; /* Kích thước nhỏ hơn để vừa với chữ */
  height: 40px;
  filter: grayscale(100%);
  opacity: 0.8;
  margin: 0 5px; /* Khoảng cách giữa chữ và logo */
  cursor: pointer; /* Hiển thị con trỏ khi hover */
  transition: background-color 0.3s ease; /* Hiệu ứng chuyển màu mượt mà */
}
</style>