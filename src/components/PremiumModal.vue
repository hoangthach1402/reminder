<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      <h2>Nâng cấp Premium</h2>
      <ul class="benefits">
        <li>🔓 Mở khóa âm thanh nền độc quyền</li>
        <li>🎨 Giao diện đặc biệt, không quảng cáo</li>
        <li>📊 Thống kê & lịch sử nâng cao</li>
        <li>⏰ Tùy chỉnh nhắc nhở nâng cao</li>
      </ul>
      <div class="pay-section">
        <p>Chỉ với <b>49.000đ/tháng</b> hoặc <b>399.000đ/năm</b></p>
        <button class="pay-btn" @click="pay">Thanh toán qua Momo/ZaloPay</button>
        <a href="https://www.paypal.com/paypalme/yourpaypal" target="_blank" class="pay-btn">Thanh toán qua PayPal</a>
      </div>
      <p class="note">* Sau khi thanh toán, bạn vui lòng liên hệ admin để được kích hoạt Premium.</p>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted } from 'vue';
const emit = defineEmits(['close']);
const pay = () => {
  window.open('https://momo.vn', '_blank');
};
// Đóng modal bằng ESC
const handleEsc = (e) => {
  if (e.key === 'Escape') emit('close');
};
onMounted(() => { window.addEventListener('keydown', handleEsc); });
onUnmounted(() => { window.removeEventListener('keydown', handleEsc); });
</script>
<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45); z-index: 4000;
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  background: #fff; border-radius: 18px; max-width: 95vw; width: 370px;
  padding: 2rem 1.5rem 1.2rem; box-shadow: 0 6px 32px rgba(44,62,80,0.18);
  position: relative;
  color: #1a365d;
}
@media (max-width: 640px) {
  .modal-content {
    width: 98vw;
    padding: 1.2rem 0.5rem 1rem;
    font-size: 0.98em;
  }
  .benefits li, .pay-btn, .note { font-size: 1em; }
}
.close-btn {
  position: absolute; top: 0.6rem; right: 1rem;
  background: none; border: none; font-size: 1.5rem; cursor: pointer;
  color: #3182ce;
  transition: color 0.18s;
}
.close-btn:focus {
  outline: 2px solid #3182ce;
  outline-offset: 2px;
}
.close-btn:hover { color: #e53e3e; }
.benefits { margin: 1.4rem 0 1.2rem 0; padding-left: 1.1em; }
.benefits li { margin-bottom: 0.7em; font-size: 1.08em; }
.pay-section { margin-bottom: 1.2rem; }
.pay-btn {
  display: block; width: 100%; margin-bottom: 0.7em;
  background: linear-gradient(90deg,#4299e1,#48bb78); color: #fff;
  border: none; border-radius: 8px; padding: 0.7em 0; font-size: 1.08em;
  font-weight: 600; cursor: pointer; text-align: center; text-decoration: none;
  transition: background 0.2s;
  outline: none;
}
.pay-btn:focus {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}
.pay-btn:hover { background: linear-gradient(90deg,#48bb78,#4299e1); }
.note { font-size: 0.92em; color: #555; margin-top: 0.5em; }
</style>
